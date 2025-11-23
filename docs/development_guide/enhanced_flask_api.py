"""
Enhanced Flask API for Heart Disease Prediction
With UI-Optimized Response Format
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Load models and artifacts at startup
print("Loading models and preprocessing artifacts...")

with open('../models/hierarchical_classifier.pkl', 'rb') as f:
    hierarchical_model = pickle.load(f)

with open('../data/processed/preprocessing_artifacts.pkl', 'rb') as f:
    preprocessing_artifacts = pickle.load(f)

with open('../models/model_metadata.pkl', 'rb') as f:
    model_metadata = pickle.load(f)

print("Models loaded successfully!")


# Preprocessing function (same as deployment guide)
def preprocess_input(raw_input_dict):
    """Preprocess raw user input to model-ready format."""
    identifier_features = ['id', 'dataset']
    df = pd.DataFrame([raw_input_dict])
    
    for col in identifier_features:
        if col in df.columns:
            df = df.drop(columns=[col])
    
    numeric_features = preprocessing_artifacts['numeric_features']
    for col in numeric_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    categorical_features = preprocessing_artifacts['categorical_features']
    for col in categorical_features:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lower()
    
    X = df.copy()
    
    # Create missing indicators
    high_missing_features = ['ca', 'thal', 'slope']
    for col in high_missing_features:
        if col in X.columns:
            X[f'{col}_missing'] = (X[col].isnull() | (X[col] == 'none') | (X[col] == 'nan')).astype(int)
    
    # Encode categorical variables
    label_encoders = preprocessing_artifacts['label_encoders']
    for col in categorical_features:
        if col in X.columns:
            le = label_encoders.get(col)
            if le is not None:
                valid_classes = [str(c).lower() for c in le.classes_]
                
                def map_to_valid_class(x):
                    if pd.isna(x) or str(x).lower() == 'nan' or str(x).lower() == 'none':
                        return le.classes_[0]
                    x_lower = str(x).lower()
                    if x_lower in valid_classes:
                        idx = valid_classes.index(x_lower)
                        return le.classes_[idx]
                    else:
                        return le.classes_[0]
                
                X[col] = X[col].apply(map_to_valid_class)
                X[col] = le.transform(X[col])
            else:
                X[col] = 0
    
    # Convert to numeric
    for col in X.columns:
        if X[col].dtype == 'object':
            X[col] = pd.to_numeric(X[col], errors='coerce')
    
    # Impute missing values
    imputation_values = {
        'age': 55,
        'trestbps': 130,
        'chol': 240,
        'thalch': 150,
        'oldpeak': 0.8,
    }
    
    for col in X.columns:
        if X[col].isnull().any():
            if col in imputation_values:
                X[col] = X[col].fillna(imputation_values[col])
            else:
                X[col] = X[col].fillna(0)
    
    # Feature engineering
    if 'age' in X.columns:
        X['age_group'] = pd.cut(X['age'], bins=[0, 45, 60, 75, 100], labels=[0, 1, 2, 3])
        X['age_group'] = X['age_group'].astype(float).fillna(1)
    
    if 'trestbps' in X.columns:
        X['bp_category'] = pd.cut(X['trestbps'], bins=[0, 120, 130, 140, 200], labels=[0, 1, 2, 3])
        X['bp_category'] = X['bp_category'].astype(float).fillna(1)
    
    if 'chol' in X.columns:
        X['chol_category'] = pd.cut(X['chol'], bins=[0, 200, 240, 500], labels=[0, 1, 2])
        X['chol_category'] = X['chol_category'].astype(float).fillna(1)
    
    if 'age' in X.columns and 'thalch' in X.columns:
        predicted_max_hr = 220 - X['age']
        X['hr_reserve'] = predicted_max_hr - X['thalch']
    
    risk_score = 0
    if 'trestbps' in X.columns:
        risk_score += (X['trestbps'] > 140).astype(int) * 2
    if 'chol' in X.columns:
        risk_score += (X['chol'] > 240).astype(int) * 2
    if 'fbs' in X.columns:
        risk_score += X['fbs']
    X['cv_risk_score'] = risk_score
    
    X = X.fillna(0)
    
    expected_features = preprocessing_artifacts['feature_names']
    for feature in expected_features:
        if feature not in X.columns:
            X[feature] = 0
    
    X = X[expected_features]
    
    scaler = preprocessing_artifacts['scaler']
    X_scaled = scaler.transform(X)
    
    return X_scaled


def get_severity_config(severity_level):
    """Get UI configuration for severity level."""
    configs = {
        0: {
            "title": "Low Risk - Looking Good!",
            "message": "Based on your information, your heart disease risk appears to be low. Keep up the healthy habits!",
            "severity_color": "#4CAF50",
            "background_color": "#E8F5E9",
            "icon": "check_circle",
            "urgency": "none"
        },
        1: {
            "title": "Mild Risk Detected",
            "message": "Your assessment shows some factors that may increase heart disease risk. A conversation with your doctor is recommended.",
            "severity_color": "#FFC107",
            "background_color": "#FFF8E1",
            "icon": "info",
            "urgency": "low"
        },
        2: {
            "title": "Moderate Risk Detected",
            "message": "Your assessment indicates a moderate level of heart disease risk. We recommend scheduling a cardiology consultation.",
            "severity_color": "#FF6B35",
            "background_color": "#FFF3E0",
            "icon": "warning",
            "urgency": "medium"
        },
        3: {
            "title": "High Risk Detected",
            "message": "Your assessment shows significant heart disease risk factors. Urgent medical attention is recommended.",
            "severity_color": "#E91E63",
            "background_color": "#FCE4EC",
            "icon": "error",
            "urgency": "high"
        },
        4: {
            "title": "CRITICAL - Immediate Action Needed",
            "message": "Your assessment indicates severe heart disease risk. Seek immediate emergency medical attention.",
            "severity_color": "#9C27B0",
            "background_color": "#F3E5F5",
            "icon": "priority_high",
            "urgency": "critical"
        }
    }
    return configs.get(severity_level, configs[0])


def get_action_items(severity_level):
    """Get action items for severity level."""
    actions = {
        0: [
            "Maintain your current healthy lifestyle",
            "Schedule routine check-ups annually",
            "Continue regular exercise (30+ minutes, 5 days/week)",
            "Eat a heart-healthy diet rich in fruits and vegetables",
            "Monitor your blood pressure at home monthly"
        ],
        1: [
            "Schedule a consultation with your primary care doctor",
            "Discuss lifestyle modifications (diet, exercise, stress)",
            "Get a comprehensive metabolic panel blood test",
            "Consider joining a cardiac rehabilitation program",
            "Monitor symptoms and track any changes"
        ],
        2: [
            "Schedule a cardiology consultation within 2-4 weeks",
            "Bring this assessment and medical history to appointment",
            "Continue any prescribed medications",
            "Make immediate lifestyle changes (diet, exercise, smoking cessation)",
            "Monitor blood pressure daily"
        ],
        3: [
            "Contact a cardiologist immediately for urgent consultation",
            "Do not delay - call within 24-48 hours",
            "Avoid strenuous physical activity until evaluated",
            "Keep a symptom diary",
            "Have someone accompany you to appointments"
        ],
        4: [
            "SEEK IMMEDIATE EMERGENCY CARE",
            "Go to the nearest emergency room or call 911",
            "Do not drive yourself - call ambulance or have someone drive you",
            "Bring a list of medications and medical history",
            "Inform ER staff of this risk assessment"
        ]
    }
    return actions.get(severity_level, actions[0])


def get_confidence_description(confidence):
    """Convert confidence to user-friendly description."""
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
    Main prediction endpoint with UI-optimized response.
    
    Request Body:
        JSON with patient data (13 clinical features)
    
    Response:
        Enhanced JSON with prediction and UI-ready formatting
    """
    try:
        # Get patient data
        patient_data = request.json
        
        # Validate required fields
        required_fields = ['age', 'sex', 'cp', 'fbs', 'exang']
        missing_fields = [f for f in required_fields if f not in patient_data]
        
        if missing_fields:
            return jsonify({
                "success": False,
                "error": {
                    "type": "validation_error",
                    "message": "Missing required fields",
                    "fields": missing_fields
                }
            }), 400
        
        # Preprocess input
        X_processed = preprocess_input(patient_data)
        
        # Get prediction
        severity_level = int(hierarchical_model.predict(X_processed)[0])
        probabilities = hierarchical_model.predict_proba(X_processed)[0]
        confidence = float(probabilities[severity_level])
        
        # Get configuration
        config = get_severity_config(severity_level)
        actions = get_action_items(severity_level)
        confidence_desc = get_confidence_description(confidence)
        
        # Build response
        response = {
            "success": True,
            "data": {
                "prediction": {
                    "severity_level": severity_level,
                    "severity_label": ["No Heart Disease", "Mild Heart Disease", 
                                     "Moderate Heart Disease", "Severe Heart Disease", 
                                     "Very Severe Heart Disease"][severity_level],
                    "risk_category": ["Low Risk", "Moderate Risk", "High Risk", 
                                    "Very High Risk", "Critical Risk"][severity_level],
                    "confidence": confidence
                },
                "display": {
                    "title": config["title"],
                    "message": config["message"],
                    "severity_color": config["severity_color"],
                    "background_color": config["background_color"],
                    "severity_icon": config["icon"],
                    "confidence_display": f"{int(confidence * 100)}% {confidence_desc['text']}",
                    "confidence_bar": int(confidence * 100)
                },
                "recommendation": {
                    "action_items": actions,
                    "urgency": config["urgency"],
                    "urgency_color": config["severity_color"]
                },
                "probabilities": {
                    "chart_data": [
                        {"label": "No Disease", "value": round(probabilities[0] * 100, 1), 
                         "color": "#4CAF50"},
                        {"label": "Mild", "value": round(probabilities[1] * 100, 1), 
                         "color": "#FFC107"},
                        {"label": "Moderate", "value": round(probabilities[2] * 100, 1), 
                         "color": "#FF6B35"},
                        {"label": "Severe", "value": round(probabilities[3] * 100, 1), 
                         "color": "#E91E63"},
                        {"label": "Very Severe", "value": round(probabilities[4] * 100, 1), 
                         "color": "#9C27B0"}
                    ]
                },
                "next_steps": {
                    "show_emergency_banner": severity_level >= 4,
                    "emergency_note": "If you experience severe chest pain, shortness of breath, or other acute symptoms, call emergency services immediately (911)." if severity_level >= 3 else None
                },
                "disclaimer": {
                    "text": "This is a screening tool only and not a medical diagnosis. Always consult with qualified healthcare professionals for medical advice.",
                    "type": "warning"
                }
            },
            "metadata": {
                "model_version": "1.0.0",
                "prediction_time": datetime.utcnow().isoformat() + "Z",
                "report_id": f"RPT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
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
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "model_loaded": hierarchical_model is not None,
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }), 200


@app.route('/api/info', methods=['GET'])
def model_info():
    """Get model information."""
    return jsonify({
        "model_name": "Heart Disease Risk Assessment",
        "model_version": "1.0.0",
        "binary_model": model_metadata.get('best_binary_model_name'),
        "multiclass_model": model_metadata.get('best_multiclass_model_name'),
        "f1_score": model_metadata.get('hierarchical_f1'),
        "features_required": 13,
        "severity_levels": 5
    }), 200


if __name__ == '__main__':
    print("Starting Heart Disease Prediction API...")
    print("Endpoints:")
    print("  POST /api/predict - Get heart disease prediction")
    print("  GET  /api/health  - Health check")
    print("  GET  /api/info    - Model information")
    app.run(host='0.0.0.0', port=8000, debug=True)
