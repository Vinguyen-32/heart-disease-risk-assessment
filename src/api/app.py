"""
Flask API for Heart Disease Risk Assessment - 3-Class Version
Main application entry point with 3-severity grouping
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from datetime import datetime
import uuid
from pathlib import Path
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Get project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent

# Load models and artifacts at startup
print("="*70)
print("Heart Disease Risk Assessment API - 3-Class Version")
print("="*70)
print("\nLoading models and preprocessing artifacts...")

try:
    # Load 3-class model
    model_path = PROJECT_ROOT / 'models' / 'best_3class_model.pkl'
    with open(model_path, 'rb') as f:
        model_3class = pickle.load(f)
    print(f"✓ Loaded 3-class model: {model_path}")

    # Load preprocessing artifacts
    artifacts_path = PROJECT_ROOT / 'models' / 'preprocessing_artifacts_3class.pkl'
    with open(artifacts_path, 'rb') as f:
        preprocessing_artifacts = pickle.load(f)
    print(f"✓ Loaded preprocessing artifacts: {artifacts_path}")

    # Load model metadata
    metadata_path = PROJECT_ROOT / 'models' / 'model_metadata_3class.pkl'
    with open(metadata_path, 'rb') as f:
        model_metadata = pickle.load(f)
    print(f"✓ Loaded metadata: {metadata_path}")

    print("\n" + "="*70)
    print("MODEL INFORMATION")
    print("="*70)
    print(f"Model: {model_metadata['model_name']}")
    print(f"Classes: {model_metadata['num_classes']}")
    print(f"Test F1-Score: {model_metadata['performance']['test_f1_weighted']:.4f}")
    print(f"Test Accuracy: {model_metadata['performance']['test_accuracy']:.4f}")
    print("\nClass Mapping:")
    for code, name in model_metadata['class_mapping'].items():
        print(f"  {code}: {name}")

except Exception as e:
    print(f"✗ Error loading models: {e}")
    raise


def preprocess_input(raw_input_dict):
    """
    Preprocess raw user input to model-ready format.

    Args:
        raw_input_dict: Dictionary with patient data

    Returns:
        numpy.ndarray: Preprocessed and scaled features
    """
    # Create DataFrame
    df = pd.DataFrame([raw_input_dict])

    # Drop non-feature columns if present
    identifier_features = ['id', 'dataset']
    for col in identifier_features:
        if col in df.columns:
            df = df.drop(columns=[col])

    # Convert sex to numeric if needed
    if 'sex' in df.columns:
        sex_map = {'male': 1, 'female': 0, 1: 1, 0: 0, '1': 1, '0': 0}
        df['sex'] = df['sex'].map(lambda x: sex_map.get(str(x).lower(), 1))

    # Convert boolean fields
    bool_fields = ['fbs', 'exang']
    for field in bool_fields:
        if field in df.columns:
            if isinstance(df[field].iloc[0], bool):
                df[field] = df[field].astype(int)
            elif isinstance(df[field].iloc[0], str):
                df[field] = df[field].map({'true': 1, 'false': 0, '1': 1, '0': 0}).fillna(0).astype(int)

    # Feature Engineering (same as training)
    # Age groups (WHO categories)
    if 'age' in df.columns:
        df['age_group'] = pd.cut(df['age'], bins=[0, 40, 60, 80, 100], labels=[0, 1, 2, 3])
        df['age_group'] = df['age_group'].astype(float).fillna(1)

    # Blood pressure categories (AHA guidelines)
    if 'trestbps' in df.columns:
        df['bp_category'] = pd.cut(df['trestbps'], bins=[0, 120, 130, 140, 200], labels=[0, 1, 2, 3])
        df['bp_category'] = df['bp_category'].astype(float).fillna(1)

    # Cholesterol categories
    if 'chol' in df.columns:
        df['chol_category'] = pd.cut(df['chol'], bins=[0, 200, 240, 600], labels=[0, 1, 2])
        df['chol_category'] = df['chol_category'].astype(float).fillna(1)

    # Heart rate reserve
    if 'age' in df.columns and 'thalch' in df.columns:
        df['hr_reserve'] = 220 - df['age'] - df['thalch']

    # Composite cardiovascular risk score
    risk_score = 0
    if 'age' in df.columns:
        risk_score += (df['age'] > 55).astype(int) * 2
    if 'trestbps' in df.columns:
        risk_score += (df['trestbps'] > 140).astype(int) * 2
    if 'chol' in df.columns:
        risk_score += (df['chol'] > 240).astype(int)
    if 'fbs' in df.columns:
        risk_score += (df['fbs'] == 1).astype(int)
    if 'exang' in df.columns:
        risk_score += (df['exang'] == 1).astype(int) * 2
    if 'oldpeak' in df.columns:
        risk_score += (df['oldpeak'] > 2).astype(int) * 3
    df['cv_risk_score'] = risk_score

    # Label Encoding for categorical features
    label_encoders = preprocessing_artifacts['label_encoders']
    for col, le in label_encoders.items():
        if col in df.columns:
            # Handle unseen categories
            df[col] = df[col].astype(str)
            df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
            df[col] = le.transform(df[col])

    # Impute missing values using KNN imputer
    imputer = preprocessing_artifacts['imputer']
    df_imputed = pd.DataFrame(
        imputer.transform(df),
        columns=df.columns,
        index=df.index
    )

    # Scale features
    scaler = preprocessing_artifacts['scaler']
    X_scaled = scaler.transform(df_imputed)

    return X_scaled


def get_severity_config_3class(severity_level):
    """
    Get UI configuration for 3-class severity level.

    Args:
        severity_level: Integer 0-2

    Returns:
        dict: UI configuration including colors, icons, messages
    """
    configs = {
        0: {
            "title": "Low Risk - Looking Good!",
            "message": "Based on your information, your heart disease risk appears to be low. Keep up the healthy habits!",
            "severity_color": "#4CAF50",  # Green
            "background_color": "#E8F5E9",
            "icon": "check_circle",
            "urgency": "none"
        },
        1: {
            "title": "Mild to Moderate Risk Detected",
            "message": "Your assessment shows some factors that indicate mild to moderate heart disease risk. A consultation with your doctor is recommended to discuss lifestyle changes and monitoring.",
            "severity_color": "#FF9800",  # Orange
            "background_color": "#FFF3E0",
            "icon": "warning",
            "urgency": "medium"
        },
        2: {
            "title": "Severe Risk - Urgent Action Needed",
            "message": "Your assessment indicates severe heart disease risk factors. Seek medical attention urgently within 24-48 hours.",
            "severity_color": "#E91E63",  # Red-Pink
            "background_color": "#FCE4EC",
            "icon": "error",
            "urgency": "high"
        }
    }
    return configs.get(severity_level, configs[0])


def get_action_items_3class(severity_level):
    """
    Get action items for 3-class severity level.

    Args:
        severity_level: Integer 0-2

    Returns:
        list: Action items for the user
    """
    actions = {
        0: [
            "Maintain your current healthy lifestyle",
            "Schedule routine check-ups annually",
            "Continue regular exercise (30+ minutes, 5 days/week)",
            "Eat a heart-healthy diet rich in fruits and vegetables",
            "Monitor your blood pressure at home monthly"
        ],
        1: [
            "Schedule a consultation with your primary care doctor within 2-4 weeks",
            "Discuss lifestyle modifications (diet, exercise, stress management)",
            "Get a comprehensive metabolic panel and lipid profile blood test",
            "Consider joining a cardiac rehabilitation or wellness program",
            "Monitor symptoms (chest pain, shortness of breath) and track changes",
            "Reduce sodium intake and maintain healthy weight"
        ],
        2: [
            "Contact a cardiologist IMMEDIATELY for urgent consultation (within 24-48 hours)",
            "Do not delay - severe risk factors detected",
            "Avoid strenuous physical activity until medically evaluated",
            "Keep a detailed symptom diary (chest pain, breathing difficulty, fatigue)",
            "Have someone accompany you to medical appointments",
            "Bring complete medical history, current medications, and this assessment",
            "If experiencing acute symptoms (severe chest pain, shortness of breath), call 911"
        ]
    }
    return actions.get(severity_level, actions[0])


def get_confidence_description(confidence):
    """
    Convert confidence to user-friendly description.

    Args:
        confidence: Float 0-1

    Returns:
        dict: Confidence description with text and color
    """
    if confidence >= 0.9:
        return {"text": "Very Confident", "color": "#4CAF50"}
    elif confidence >= 0.75:
        return {"text": "Confident", "color": "#8BC34A"}
    elif confidence >= 0.60:
        return {"text": "Moderately Confident", "color": "#FFC107"}
    else:
        return {"text": "Low Confidence", "color": "#FF6B35", "warning": True}


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint with UI-optimized response (3-class version).

    Request Body:
        JSON with patient data (13 clinical features)

    Response:
        Enhanced JSON with prediction and UI-ready formatting
    """
    try:
        # Get patient data
        patient_data = request.json

        if not patient_data:
            return jsonify({
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "No data provided",
                    "display": {
                        "title": "Missing Data",
                        "message": "Please provide patient data in the request body."
                    }
                }
            }), 400

        # Validate required fields
        required_fields = ['age', 'sex', 'cp', 'fbs', 'exang']
        missing_fields = [f for f in required_fields if f not in patient_data]

        if missing_fields:
            return jsonify({
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "Missing required fields",
                    "fields": missing_fields,
                    "display": {
                        "title": "Please Check Your Information",
                        "message": f"The following required fields are missing: {', '.join(missing_fields)}"
                    }
                }
            }), 400

        # Preprocess input
        X_processed = preprocess_input(patient_data)

        # Get prediction (0-2)
        severity_level = int(model_3class.predict(X_processed)[0])
        probabilities = model_3class.predict_proba(X_processed)[0]
        confidence = float(probabilities[severity_level])

        # Get configuration
        config = get_severity_config_3class(severity_level)
        actions = get_action_items_3class(severity_level)
        confidence_desc = get_confidence_description(confidence)

        # Severity labels (3 classes)
        class_mapping = model_metadata['class_mapping']
        severity_label = class_mapping[severity_level]

        risk_categories = {
            0: "Low Risk",
            1: "Moderate Risk",
            2: "High Risk"
        }

        # Chart colors for 3 classes
        chart_colors = ["#4CAF50", "#FF9800", "#E91E63"]

        # Build response
        response = {
            "success": True,
            "data": {
                "prediction": severity_level,
                "confidence": confidence,
                "probabilities": {
                    str(i): float(probabilities[i]) for i in range(3)
                },
                "risk_category": severity_label,
                "risk_color": chart_colors[severity_level],
                "action_items": actions
            }
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": {
                "type": "server_error",
                "message": "An unexpected error occurred",
                "details": str(e),
                "display": {
                    "title": "Something Went Wrong",
                    "message": "Please try again or contact support if the problem persists."
                }
            }
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.

    Returns:
        JSON with API health status
    """
    return jsonify({
        "status": "healthy",
        "model_loaded": model_3class is not None,
        "model_version": "3-class grouping",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }), 200


@app.route('/api/info', methods=['GET'])
def model_info():
    """
    Get model information (3-class version).

    Returns:
        JSON with model metadata
    """
    return jsonify({
        "model": model_metadata['model_name'],
        "version": "1.0.0",
        "num_classes": model_metadata['num_classes'],
        "class_mapping": model_metadata['class_mapping'],
        "performance": {
            "test_f1": model_metadata['performance']['test_f1_weighted'],
            "test_accuracy": model_metadata['performance']['test_accuracy'],
            "f1_per_class": model_metadata['performance']['f1_per_class']
        },
        "features": len(preprocessing_artifacts['feature_names']),
        "description": "3-class severity grouping (No Disease, Mild-Moderate, Severe-Critical) for improved accuracy"
    }), 200


@app.route('/', methods=['GET'])
def index():
    """
    API root endpoint with documentation.
    """
    return jsonify({
        "name": "Heart Disease Risk Assessment API - 3-Class Version",
        "version": "1.0.0",
        "model": "XGBoost 3-Class Severity",
        "f1_score": model_metadata['performance']['test_f1_weighted'],
        "endpoints": {
            "POST /api/predict": "Get heart disease prediction (3 severity levels)",
            "GET /api/health": "Health check",
            "GET /api/info": "Model information"
        },
        "documentation": "See README.md for full API documentation"
    }), 200


if __name__ == '__main__':
    print("\n" + "="*70)
    print("Endpoints:")
    print("  POST /api/predict - Get heart disease prediction (3 classes)")
    print("  GET  /api/health  - Health check")
    print("  GET  /api/info    - Model information")
    print("  GET  /            - API documentation")
    print("\n" + "="*70)
    print("Starting server on http://0.0.0.0:8000")
    print("="*70 + "\n")

    app.run(host='0.0.0.0', port=8000, debug=False)
