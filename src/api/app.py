"""
Heart Disease Risk Assessment API

This Flask API provides endpoints for predicting heart disease severity
based on clinical patient data using trained machine learning models.
"""

from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import os
from typing import Dict, Any, Tuple

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Create API blueprint
api = Blueprint('api', __name__, url_prefix='/api')

# Global variables for models and preprocessing artifacts
model = None
preprocessing_artifacts = None
metadata = None
hierarchical_model = None

# Model directory path
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'models')
ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'processed')


class HierarchicalClassifier:
    """
    Hierarchical classifier that performs two-stage prediction:
    1. Binary classification (disease vs no disease)
    2. Multi-class classification (severity levels) for disease cases
    """
    def __init__(self, binary_model, multiclass_model):
        self.binary_model = binary_model
        self.multiclass_model = multiclass_model
        self.is_ordinal = 'Ordinal' in str(type(multiclass_model))

    def predict(self, X):
        """Perform hierarchical prediction."""
        # Stage 1: Binary prediction
        binary_pred = self.binary_model.predict(X)

        # Stage 2: Multi-class prediction for disease cases
        disease_mask = binary_pred == 1
        final_pred = np.zeros(len(X), dtype=int)

        if disease_mask.sum() > 0:
            if self.is_ordinal:
                # For ordinal models
                multi_pred_raw = self.multiclass_model.predict(X[disease_mask])
                multi_pred = np.clip(np.round(np.nan_to_num(multi_pred_raw, nan=1.0)), 0, 2).astype(int)
            else:
                multi_pred = self.multiclass_model.predict(X[disease_mask])

            # Map predictions: 0 stays 0, disease cases get their multi-class predictions
            final_pred[disease_mask] = multi_pred

        return final_pred

    def predict_proba(self, X):
        """
        Predict class probabilities.
        Combines binary and multi-class probabilities for hierarchical approach.
        
        Methodology:
        - Class 0 (No Disease): P(no disease from binary model)
        - Class 1 (Mild): P(disease from binary) × P(class 1 from multi-class)
        - Class 2 (Severe): P(disease from binary) × P(class 2 from multi-class)
        """
        # Stage 1: Binary prediction probabilities
        binary_proba = self.binary_model.predict_proba(X)
        
        # Initialize final probabilities for 3 classes
        final_proba = np.zeros((len(X), 3))
        
        # Probability of no disease (class 0) comes directly from binary model
        final_proba[:, 0] = binary_proba[:, 0]
        
        # For disease cases, distribute probability among severity classes
        if hasattr(self.multiclass_model, 'predict_proba'):
            # Get multi-class probabilities
            multi_proba = self.multiclass_model.predict_proba(X)
            
            # The multi-class model predicts among classes 0, 1, 2
            # But in hierarchical context, we only want classes 1 and 2
            # Distribute disease probability across severity classes 1 and 2
            if multi_proba.shape[1] == 3:
                # Multi-class model has 3 classes (0, 1, 2)
                # Renormalize classes 1 and 2 to distribute disease probability
                severity_proba = multi_proba[:, 1:3]  # Extract classes 1 and 2
                severity_sum = severity_proba.sum(axis=1, keepdims=True)
                severity_sum = np.where(severity_sum == 0, 1, severity_sum)  # Avoid division by zero
                severity_proba_normalized = severity_proba / severity_sum
                
                # Distribute disease probability
                final_proba[:, 1] = binary_proba[:, 1] * severity_proba_normalized[:, 0]
                final_proba[:, 2] = binary_proba[:, 1] * severity_proba_normalized[:, 1]
            else:
                # Fallback: equal distribution if shape is unexpected
                final_proba[:, 1] = binary_proba[:, 1] * 0.5
                final_proba[:, 2] = binary_proba[:, 1] * 0.5
        else:
            # If multi-class model doesn't support predict_proba, use predictions
            predictions = self.predict(X)
            for i in range(len(X)):
                final_proba[i, predictions[i]] = binary_proba[i, 1] if predictions[i] > 0 else binary_proba[i, 0]
        
        return final_proba

def load_models():
    """Load trained models and preprocessing artifacts."""
    global model, preprocessing_artifacts, metadata, hierarchical_model
    
    try:
        # Load preprocessing artifacts
        with open(os.path.join(ARTIFACT_DIR, 'preprocessing_artifacts.pkl'), 'rb') as f:
            preprocessing_artifacts = pickle.load(f)
        
        # Load metadata to determine which model to use
        with open(os.path.join(MODEL_DIR, 'model_metadata.pkl'), 'rb') as f:
            metadata = pickle.load(f)
        
        # Load the appropriate model based on best approach
        if metadata['best_approach'] == 'Hierarchical':
            with open(os.path.join(MODEL_DIR, 'hierarchical_classifier.pkl'), 'rb') as f:
                hierarchical_model = pickle.load(f)
            model = hierarchical_model
            print("Loaded Hierarchical Classifier")
        else:
            with open(os.path.join(MODEL_DIR, 'best_multiclass_model.pkl'), 'rb') as f:
                model = pickle.load(f)
            print(f"Loaded Multi-class Model: {metadata['multiclass_model_name']}")
        
        print("Models and artifacts loaded successfully!")
        return True
        
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        return False


def validate_input(data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate input data format and ranges.

    Args:
        data: Input dictionary containing patient data

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Only 4 fields are required - basic info that users always know
    required_fields = ['age', 'sex', 'cp', 'exang']

    # Check required fields
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    # Validate numeric ranges (only if field is provided - medically reasonable ranges)
    numeric_validations = {
        'age': (18, 120, 'years'),
        'trestbps': (70, 250, 'mm Hg'),
        'chol': (100, 600, 'mg/dl'),
        'thalch': (60, 220, 'bpm'),
        'oldpeak': (-3.0, 10.0, ''),
        'ca': (0.0, 4.0, '')
    }

    for field, (min_val, max_val, unit) in numeric_validations.items():
        # Only validate if field is present in the data
        if field in data:
            try:
                value = float(data[field])
                if not (min_val <= value <= max_val):
                    unit_str = f" {unit}" if unit else ""
                    return False, f"Field '{field}' must be between {min_val} and {max_val}{unit_str}"
            except (ValueError, TypeError):
                return False, f"Field '{field}' must be a valid number"
    
    # Validate categorical fields (only if field is provided)
    categorical_validations = {
        'sex': ['Male', 'Female'],
        'cp': ['typical angina', 'atypical angina', 'non-anginal', 'asymptomatic'],
        'fbs': [True, False, 'true', 'false', 1, 0],
        'restecg': ['normal', 'st-t abnormality', 'lv hypertrophy'],
        'exang': [True, False, 'true', 'false', 1, 0],
        'slope': ['upsloping', 'flat', 'downsloping'],
        'thal': ['normal', 'fixed defect', 'reversable defect']
    }

    for field, valid_values in categorical_validations.items():
        # Only validate if field is present in the data
        if field in data and data[field] not in valid_values:
            return False, f"Invalid value for '{field}'. Valid values: {', '.join(map(str, valid_values))}"

    return True, ""


def apply_defaults(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply default values for missing optional fields.

    Args:
        data: Input dictionary containing patient data

    Returns:
        Dictionary with defaults applied for missing optional fields
    """
    # Create a copy to avoid modifying the original
    data_with_defaults = data.copy()

    # Optional field defaults based on population medians and safe assumptions
    optional_field_defaults = {
        'trestbps': 130.0,      # Median resting blood pressure
        'chol': 200.0,          # Median cholesterol (borderline-high, conservative)
        'fbs': False,           # Most people don't have elevated blood sugar
        'restecg': 'normal',    # Most common ECG result
        'thalch': None,         # Will calculate as 220 - age
        'oldpeak': 0.0,         # No stress test done / normal result
        'slope': 'upsloping',   # Most favorable/common slope
        'ca': 0.0,              # No angiogram done / no blockages
        'thal': 'normal'        # No nuclear test done / normal result
    }

    # Apply defaults for missing fields
    for field, default_value in optional_field_defaults.items():
        if field not in data_with_defaults:
            if field == 'thalch':
                # Calculate estimated max heart rate: 220 - age
                age = data_with_defaults.get('age', 50)  # Default age if somehow missing
                data_with_defaults['thalch'] = float(220 - age)
            else:
                data_with_defaults[field] = default_value

    return data_with_defaults


def preprocess_input(data: Dict[str, Any]) -> pd.DataFrame:
    """
    Preprocess input data to match model training format.
    
    Args:
        data: Input dictionary containing patient data
        
    Returns:
        Preprocessed DataFrame ready for prediction
    """
    # Create DataFrame from input
    df = pd.DataFrame([data])
    
    # Handle categorical encoding
    categorical_features = preprocessing_artifacts['categorical_features']
    for feature in categorical_features:
        if feature in df.columns and feature in preprocessing_artifacts['label_encoders']:
            le = preprocessing_artifacts['label_encoders'][feature]
            # Convert boolean to string for consistency
            if df[feature].dtype == bool:
                df[feature] = df[feature].astype(str)
            # Handle case sensitivity
            df[feature] = df[feature].astype(str)
            
            # If the value is not in the encoder's classes, use the most common class
            if df[feature].iloc[0] not in le.classes_:
                df[feature] = le.classes_[0]
            
            df[feature] = le.transform(df[feature])
    
    # Feature engineering (must match training preprocessing)
    # 1. Age group
    df['age_group'] = pd.cut(
        df['age'],
        bins=[0, 40, 50, 60, 70, 100],
        labels=[0, 1, 2, 3, 4]
    ).fillna(2).astype(int)  # Default to middle category if NaN
    
    # 2. Blood pressure category
    df['bp_category'] = pd.cut(
        df['trestbps'],
        bins=[0, 120, 140, 160, 300],
        labels=[0, 1, 2, 3]
    ).fillna(1).astype(int)  # Default to normal-high if NaN
    
    # 3. Cholesterol category
    df['chol_category'] = pd.cut(
        df['chol'],
        bins=[0, 200, 240, 600],
        labels=[0, 1, 2]
    ).fillna(1).astype(int)  # Default to borderline-high if NaN
    
    # 4. Heart rate reserve
    df['hr_reserve'] = df['thalch'] - (220 - df['age'])
    
    # 5. Cardiovascular risk score
    df['cv_risk_score'] = (
        df['age'] / 100 +
        df['trestbps'] / 200 +
        df['chol'] / 300 +
        df['oldpeak'] / 10
    )
    
    # Reorder columns to match training feature order
    feature_names = preprocessing_artifacts['feature_names']
    df = df[feature_names]
    
    # Scale features
    scaler = preprocessing_artifacts['scaler']
    df_scaled = pd.DataFrame(
        scaler.transform(df),
        columns=df.columns
    )
    
    return df_scaled


def get_recommendation(prediction: int, confidence: float) -> Dict[str, Any]:
    """
    Generate clinical recommendation based on prediction.
    
    Args:
        prediction: Predicted class (0, 1, or 2)
        confidence: Model confidence score
        
    Returns:
        Dictionary with risk_category, risk_color, and action_items
    """
    if prediction == 0:
        risk_category = "No Disease"
        risk_color = "#4CAF50"  # Green
        action_items = [
            "Congratulations! Your assessment indicates no significant heart disease risk",
            "Continue maintaining a healthy lifestyle with regular exercise (150+ minutes/week)",
            "Follow a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins",
            "Monitor your blood pressure and cholesterol levels annually",
            "Avoid smoking and limit alcohol consumption",
            "Maintain a healthy weight (BMI 18.5-24.9)",
            "Schedule routine check-ups with your primary care physician as recommended",
            "Stay aware of family history and inform your doctor of any changes"
        ]
    elif prediction == 1:
        risk_category = "Mild-Moderate"
        risk_color = "#FF9800"  # Orange
        action_items = [
            "Your assessment indicates mild-to-moderate heart disease risk",
            "Schedule a consultation with a cardiologist within 1-2 weeks for further evaluation",
            "Discuss stress testing, echocardiogram, or other diagnostic tests with your doctor",
            "Implement lifestyle modifications: heart-healthy diet, regular exercise, stress reduction",
            "Monitor symptoms: chest discomfort, shortness of breath, fatigue, irregular heartbeat",
            "Consider cardiac rehabilitation programs if recommended by your physician",
            "Follow prescribed medications exactly as directed",
            "Avoid strenuous activity until cleared by your cardiologist",
            "Keep a symptom diary to share with your healthcare provider",
            "Reduce risk factors: quit smoking, manage diabetes, control blood pressure/cholesterol"
        ]
        
        if confidence < 0.6:
            action_items.append(
                "Note: Prediction confidence is moderate. Additional diagnostic testing recommended for confirmation"
            )
    else:  # prediction == 2
        risk_category = "Severe-Critical"
        risk_color = "#E91E63"  # Red-Pink
        action_items = [
            "URGENT: Your assessment indicates severe heart disease requiring immediate medical attention",
            "Contact a cardiologist IMMEDIATELY for urgent consultation (within 24-48 hours)",
            "Do not delay - severe risk factors detected that require prompt evaluation",
            "Avoid strenuous physical activity until medically evaluated",
            "Monitor for acute symptoms: severe chest pain, shortness of breath, dizziness, fainting",
            "Keep a detailed symptom diary (chest pain, breathing difficulty, fatigue, swelling)",
            "Have someone accompany you to medical appointments",
            "Bring complete medical history, current medications, and this assessment to your appointment",
            "If experiencing acute symptoms (severe chest pain, shortness of breath, profuse sweating), call 911 immediately",
            "Do not drive yourself if experiencing symptoms - call emergency services",
            "Discuss immediate treatment options: medications, procedures, lifestyle changes",
            "Consider getting a second opinion from a cardiac specialist"
        ]
        
        if confidence < 0.6:
            action_items.append(
                "Note: While confidence is moderate, the severity prediction warrants immediate medical attention regardless"
            )
    
    return {
        'risk_category': risk_category,
        'risk_color': risk_color,
        'action_items': action_items
    }


@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_type': metadata['best_approach'] if metadata else None
    })


@api.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.
    
    Expected JSON input:
    {
        "age": 63,
        "sex": "Male",
        "cp": "typical angina",
        "trestbps": 145.0,
        "chol": 233.0,
        "fbs": true,
        "restecg": "lv hypertrophy",
        "thalch": 150.0,
        "exang": false,
        "oldpeak": 2.3,
        "slope": "downsloping",
        "ca": 0.0,
        "thal": "fixed defect"
    }
    
    Returns success response with prediction, confidence, probabilities, and action items.
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No input data provided'
            }), 400
        
        # Validate input (only required fields)
        is_valid, error_msg = validate_input(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400

        # Apply defaults for missing optional fields
        data_with_defaults = apply_defaults(data)

        # Preprocess input
        processed_data = preprocess_input(data_with_defaults)
        
        # Make prediction and get probabilities
        if hasattr(model, 'predict_proba'):
            prediction_proba = model.predict_proba(processed_data)[0]
            prediction = int(np.argmax(prediction_proba))
            confidence = float(prediction_proba[prediction])
            
            # Create probabilities dictionary
            probabilities = {
                "0": round(float(prediction_proba[0]), 4),
                "1": round(float(prediction_proba[1]), 4),
                "2": round(float(prediction_proba[2]), 4)
            }
        else:
            # For hierarchical or ordinal models without predict_proba
            prediction = int(model.predict(processed_data)[0])
            confidence = 0.75  # Default confidence for models without probability estimates
            
            # Create uniform probabilities as fallback
            probabilities = {
                "0": 0.0,
                "1": 0.0,
                "2": 0.0
            }
            probabilities[str(prediction)] = confidence
        
        # Get recommendation details
        recommendation_data = get_recommendation(prediction, confidence)
        
        # Return success response
        return jsonify({
            'success': True,
            'data': {
                'prediction': prediction,
                'confidence': round(confidence, 4),
                'probabilities': probabilities,
                'risk_category': recommendation_data['risk_category'],
                'risk_color': recommendation_data['risk_color'],
                'action_items': recommendation_data['action_items']
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }), 500


@api.route('/model-info', methods=['GET'])
def model_info():
    """Return information about the loaded model."""
    if metadata is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 500

    return jsonify({
        'approach': metadata['best_approach'],
        'model_name': metadata['final_model_name'],
        'f1_score': metadata['best_f1_score'],
        'class_names': metadata['class_names'],
        'severity_grouping': metadata.get('severity_grouping', 'Original 1-2 → 1, 3-4 → 2'),
        'features_used': len(metadata['feature_names'])
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Register API blueprint
    app.register_blueprint(api)

    # Load models on startup
    print("Loading models...")
    if load_models():
        print("Starting Flask server...")
        print("API available at http://localhost:8000/api")
        print("\nEndpoints:")
        print("  - POST /api/predict     : Make predictions")
        print("  - GET  /api/health      : Health check")
        print("  - GET  /api/model-info  : Model information")
        app.run(host='0.0.0.0', port=8000, debug=True)
    else:
        print("Failed to load models. Please ensure model files exist in ../../models/")
        print("Run the training notebook (03_model_training.ipynb) first to generate models.")
