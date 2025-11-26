"""
Heart Disease Risk Assessment API

This Flask API provides endpoints for predicting heart disease severity
based on clinical patient data using trained machine learning models.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import os
from typing import Dict, Any, Tuple

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Define HierarchicalClassifier class (needed for unpickling)
class HierarchicalClassifier:
    """Hierarchical classifier that combines binary and multi-class models."""
    def __init__(self, binary_model, multiclass_model):
        self.binary_model = binary_model
        self.multiclass_model = multiclass_model
        self.is_ordinal = 'Ordinal' in str(type(multiclass_model))

    def predict(self, X):
        # Stage 1: Binary prediction
        binary_pred = self.binary_model.predict(X)

        # Stage 2: Multi-class prediction for disease cases
        disease_mask = binary_pred == 1
        final_pred = np.zeros(len(X), dtype=int)

        if disease_mask.sum() > 0:
            multi_pred = self.multiclass_model.predict(X[disease_mask])
            # Handle ordinal models if needed
            if self.is_ordinal:
                multi_pred = np.clip(np.round(np.nan_to_num(multi_pred, nan=1.0)), 0, 2).astype(int)

            # Map predictions: 0 stays 0, disease cases get their multi-class predictions
            final_pred[disease_mask] = multi_pred

        return final_pred

    def predict_proba(self, X):
        """Get probability estimates if available."""
        if hasattr(self.multiclass_model, 'predict_proba'):
            return self.multiclass_model.predict_proba(X)
        else:
            # Return one-hot encoded predictions if probabilities not available
            predictions = self.predict(X)
            n_classes = 3  # No Disease, Mild, Severe
            proba = np.zeros((len(X), n_classes))
            for i, pred in enumerate(predictions):
                proba[i, pred] = 1.0
            return proba

# Global variables for models and preprocessing artifacts
model = None
preprocessing_artifacts = None
metadata = None
hierarchical_model = None

# Model directory path
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'models')
ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'processed')

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
    required_fields = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
        'restecg', 'thalch', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
    ]
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate numeric ranges
    numeric_validations = {
        'age': (29, 77, 'years'),
        'trestbps': (94, 200, 'mm Hg'),
        'chol': (126, 564, 'mg/dl'),
        'thalch': (71, 202, 'bpm'),
        'oldpeak': (0.0, 6.2, ''),
        'ca': (0.0, 3.0, '')
    }
    
    for field, (min_val, max_val, unit) in numeric_validations.items():
        try:
            value = float(data[field])
            if not (min_val <= value <= max_val):
                unit_str = f" {unit}" if unit else ""
                return False, f"Field '{field}' must be between {min_val} and {max_val}{unit_str}"
        except (ValueError, TypeError):
            return False, f"Field '{field}' must be a valid number"
    
    # Validate categorical fields
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
        if data[field] not in valid_values:
            return False, f"Field '{field}' has invalid value. Valid values: {valid_values}"
    
    return True, ""


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


def get_recommendation(prediction: int, confidence: float) -> Tuple[str, str]:
    """
    Generate clinical recommendation based on prediction.
    
    Args:
        prediction: Predicted class (0, 1, or 2)
        confidence: Model confidence score
        
    Returns:
        Tuple of (risk_level, recommendation_text)
    """
    class_names = metadata['class_names']
    
    if prediction == 0:
        risk_level = "low"
        recommendation = (
            "Your assessment indicates no significant heart disease risk. "
            "Continue maintaining a healthy lifestyle with regular exercise and balanced diet. "
            "Schedule routine check-ups as recommended by your healthcare provider."
        )
    elif prediction == 1:
        risk_level = "moderate"
        recommendation = (
            "Your assessment indicates mild heart disease. "
            "Consult with a cardiologist for further evaluation. "
            "Lifestyle modifications including diet, exercise, and stress management are recommended. "
            "Follow your doctor's advice regarding medication and monitoring."
        )
    else:  # prediction == 2
        risk_level = "high"
        recommendation = (
            "Your assessment indicates severe heart disease requiring immediate medical attention. "
            "Please consult with a cardiologist as soon as possible for comprehensive evaluation and treatment. "
            "Do not delay seeking medical care. "
            "Follow all medical advice and prescribed treatments carefully."
        )
    
    # Adjust for low confidence
    if confidence < 0.6:
        recommendation += (
            " Note: The prediction confidence is relatively low. "
            "Additional testing may be needed for more accurate assessment."
        )
    
    return risk_level, recommendation


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_type': metadata['best_approach'] if metadata else None
    })


@app.route('/api/predict', methods=['POST'])
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
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No input data provided',
                'details': 'Request body must contain JSON data'
            }), 400
        
        # Validate input
        is_valid, error_msg = validate_input(data)
        if not is_valid:
            return jsonify({
                'error': 'Invalid input',
                'details': error_msg
            }), 400
        
        # Preprocess input
        processed_data = preprocess_input(data)
        
        # Make prediction
        if hasattr(model, 'predict_proba'):
            prediction_proba = model.predict_proba(processed_data)[0]
            prediction = int(np.argmax(prediction_proba))
            confidence = float(prediction_proba[prediction])
        else:
            # For hierarchical or ordinal models without predict_proba
            prediction = int(model.predict(processed_data)[0])
            confidence = 0.75  # Default confidence for models without probability estimates
        
        # Get prediction label
        prediction_label = metadata['class_names'][prediction]
        
        # Generate recommendation
        risk_level, recommendation = get_recommendation(prediction, confidence)
        
        # Return response
        return jsonify({
            'prediction': prediction,
            'prediction_label': prediction_label,
            'confidence': round(confidence, 4),
            'risk_level': risk_level,
            'recommendation': recommendation
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'details': str(e)
        }), 500


@app.route('/api/model-info', methods=['GET'])
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
        'error': 'Endpoint not found',
        'details': 'The requested endpoint does not exist'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'error': 'Internal server error',
        'details': 'An unexpected error occurred'
    }), 500


if __name__ == '__main__':
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
