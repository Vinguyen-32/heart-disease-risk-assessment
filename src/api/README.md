# Backend API - Heart Disease Risk Assessment

**Flask REST API for Heart Disease Prediction**

This is the backend API for the Heart Disease Risk Assessment System. It uses an XGBoost 3-Class Classifier (F1 = 0.6544) to predict heart disease severity in 3 categories (No Disease, Mild-Moderate, Severe-Critical) and provides a RESTful interface for the React frontend.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- pip

### Installation

```bash
# 1. Navigate to project root
cd cmpe-257-ML-heart-disease-risk-assessment

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the API
python src/api/app.py
```

The API will be available at **http://localhost:8000**

---

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Flask** | 3.1.0 | Web framework |
| **Flask-CORS** | 5.0.0 | Cross-origin support |
| **XGBoost** | 2.1.3 | ML model (3-class classifier) |
| **scikit-learn** | 1.5.2 | Preprocessing pipeline |
| **pandas** | 2.2.3 | Data manipulation |
| **NumPy** | 2.0.2 | Numerical operations |
| **imbalanced-learn** | 0.12.4 | SMOTE (if needed) |

---

## 📁 Project Structure

```
src/api/
├── __init__.py
├── app.py                      # ⭐ Main Flask application
└── README.md                   # This file

models/                         # ML models and artifacts
├── best_3class_model.pkl       # ⭐ XGBoost 3-Class (F1=0.6544)
├── preprocessing_artifacts_3class.pkl # ⭐ Scaler, encoders, imputer
├── model_metadata_3class.pkl   # ⭐ Performance metrics
├── best_ordinal_model.pkl      # Previous 5-class model
└── smote_multiclass.pkl        # BorderlineSMOTE
```

---

## 🔌 API Endpoints

### 1. POST /api/predict

Predicts heart disease severity (3 categories) from clinical data.

**Request Body**:
```json
{
  "age": 65,
  "sex": "male",
  "cp": "typical angina",
  "trestbps": 160,
  "chol": 280,
  "fbs": true,
  "restecg": "ST-T abnormality",
  "thalch": 120,
  "exang": true,
  "oldpeak": 2.5,
  "slope": "downsloping",
  "ca": "2",
  "thal": "reversible defect"
}
```

**Field Specifications**:

| Field | Type | Options/Range | Description |
|-------|------|---------------|-------------|
| `age` | int | 20-100 | Patient age in years |
| `sex` | string | "male", "female" | Biological sex |
| `cp` | string | "typical angina", "atypical angina", "non-anginal pain", "asymptomatic" | Chest pain type |
| `trestbps` | int | 80-200 | Resting blood pressure (mm Hg) |
| `chol` | int | 100-600 | Serum cholesterol (mg/dL) |
| `fbs` | boolean | true, false | Fasting blood sugar > 120 mg/dL |
| `restecg` | string | "normal", "ST-T abnormality", "left ventricular hypertrophy" | Resting ECG results |
| `thalch` | int | 60-220 | Maximum heart rate achieved |
| `exang` | boolean | true, false | Exercise-induced angina |
| `oldpeak` | float | 0.0-10.0 | ST depression induced by exercise |
| `slope` | string | "upsloping", "flat", "downsloping" | Slope of peak exercise ST segment |
| `ca` | string | "0", "1", "2", "3" | Number of major vessels colored by fluoroscopy |
| `thal` | string | "normal", "fixed defect", "reversible defect" | Thalassemia test result |

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "prediction": 2,
    "confidence": 0.78,
    "probabilities": {
      "0": 0.05,
      "1": 0.17,
      "2": 0.78
    },
    "risk_category": "Severe-Critical",
    "risk_color": "#E91E63",
    "action_items": [
      "Contact a cardiologist IMMEDIATELY for urgent consultation (within 24-48 hours)",
      "Do not delay - severe risk factors detected",
      "Avoid strenuous physical activity until medically evaluated",
      "Keep a detailed symptom diary (chest pain, breathing difficulty, fatigue)",
      "Have someone accompany you to medical appointments",
      "Bring complete medical history, current medications, and this assessment",
      "If experiencing acute symptoms (severe chest pain, shortness of breath), call 911"
    ]
  }
}
```

**Response Fields**:
- `prediction`: Severity level (0 = No Disease, 1 = Mild-Moderate, 2 = Severe-Critical)
- `confidence`: Confidence score (0.0-1.0) for the predicted class
- `probabilities`: Probability distribution across 3 severity categories
- `risk_category`: Human-readable risk category
- `risk_color`: UI color hex code for severity visualization
- `action_items`: Personalized recommendations based on severity

**Severity Level Mapping**:

| Level | Category | Color | UI Hex |
|-------|----------|-------|--------|
| 0 | No Disease | Green | #4CAF50 |
| 1 | Mild-Moderate | Orange | #FF9800 |
| 2 | Severe-Critical | Red-Pink | #E91E63 |

**Error Responses**:

**400 Bad Request** (Missing/Invalid Fields):
```json
{
  "success": false,
  "error": "Missing required fields: age, sex"
}
```

**500 Internal Server Error** (Prediction Failure):
```json
{
  "success": false,
  "error": "Prediction failed: [error details]"
}
```

---

### 2. GET /api/health

Health check endpoint to verify API is running.

**Response (200)**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2025-11-24T10:30:45.123Z"
}
```

---

### 3. GET /api/info

Returns model metadata and performance metrics.

**Response (200)**:
```json
{
  "model": "XGBoost Ordinal Classifier",
  "version": "1.0.0",
  "performance": {
    "test_f1": 0.5863,
    "test_accuracy": 0.5815,
    "mae": 0.5924
  },
  "features": 14,
  "classes": 5,
  "description": "Ordinal classification model with sample weighting for heart disease severity prediction"
}
```

---

## 🧪 Testing the API

### Using cURL

**Health Check**:
```bash
curl http://localhost:8000/api/health
```

**Model Info**:
```bash
curl http://localhost:8000/api/info
```

**Prediction (Low Risk Patient)**:
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "sex": "female",
    "cp": "asymptomatic",
    "trestbps": 120,
    "chol": 200,
    "fbs": false,
    "restecg": "normal",
    "thalch": 170,
    "exang": false,
    "oldpeak": 0.5,
    "slope": "upsloping",
    "ca": "0",
    "thal": "normal"
  }'
```

**Prediction (High Risk Patient)**:
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 65,
    "sex": "male",
    "cp": "typical angina",
    "trestbps": 160,
    "chol": 280,
    "fbs": true,
    "restecg": "ST-T abnormality",
    "thalch": 120,
    "exang": true,
    "oldpeak": 2.5,
    "slope": "downsloping",
    "ca": "2",
    "thal": "reversible defect"
  }'
```

### Using Python Requests

```python
import requests

# Health check
response = requests.get('http://localhost:8000/api/health')
print(response.json())

# Make prediction
data = {
    "age": 55,
    "sex": "male",
    "cp": "atypical angina",
    "trestbps": 140,
    "chol": 250,
    "fbs": False,
    "restecg": "normal",
    "thalch": 150,
    "exang": False,
    "oldpeak": 1.5,
    "slope": "flat",
    "ca": "1",
    "thal": "fixed defect"
}

response = requests.post('http://localhost:8000/api/predict', json=data)
result = response.json()

print(f"Prediction: {result['data']['prediction']}")
print(f"Confidence: {result['data']['confidence']:.2%}")
print(f"Risk: {result['data']['risk_category']}")
```

---

## 🔧 Configuration

### CORS Settings

By default, CORS is enabled for all origins (development mode):
```python
from flask_cors import CORS
CORS(app)
```

For production, restrict to specific origins:
```python
CORS(app, origins=["https://yourdomain.com", "https://www.yourdomain.com"])
```

### Port Configuration

Default port is 8000. To change:
```python
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)  # Change port here
```

---

## 📦 Deployment

### Production with Gunicorn

```bash
# Install Gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:8000 src.api.app:app
```

### Environment Variables

```bash
export FLASK_ENV=production
export FLASK_DEBUG=0
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

EXPOSE 8000

# Run with Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "src.api.app:app"]
```

Build and run:
```bash
docker build -t heart-disease-api .
docker run -p 8000:8000 heart-disease-api
```

### Cloud Deployment

#### Railway (Recommended)

1. Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn -w 4 -b 0.0.0.0:$PORT src.api.app:app",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. Deploy via Railway CLI or GitHub integration

#### Heroku

1. Create `Procfile`:
```
web: gunicorn -w 4 src.api.app:app
```

2. Deploy:
```bash
heroku create heart-disease-api
git push heroku main
```

---

## 🧩 ML Pipeline Details

### Model Architecture

The API uses the **XGBoost Ordinal Classifier** (`models/best_ordinal_model.pkl`):

**Training Details**:
- Algorithm: XGBoost with ordinal-aware sample weights
- Sample weighting: `weight = 1.0 + 0.3 * severity_level` (Class 0: 1.0, Class 4: 2.2)
- Hyperparameters:
  - n_estimators: 300
  - max_depth: 7
  - learning_rate: 0.05
  - subsample: 0.8
  - colsample_bytree: 0.8

**Performance**:
- Test F1-Score: 0.5863 (weighted)
- Test Accuracy: 58.15%
- Mean Absolute Error: 0.5924
- Clinical Safety: Only 14.1% severe errors (off by 2+ levels)

### Preprocessing Pipeline

Loaded from `models/preprocessing_artifacts.pkl`:

1. **Missing Value Imputation**: KNN Imputer (k=5)
2. **Feature Engineering**:
   - `age_group`: WHO age categories
   - `bp_category`: AHA blood pressure guidelines
   - `chol_category`: Cholesterol risk levels
   - `hr_reserve`: 220 - age - max heart rate
   - `cv_risk_score`: Composite cardiovascular risk

3. **Encoding**: Label encoding for 8 categorical features
4. **Scaling**: StandardScaler (fit on training data)

### Prediction Flow

```
1. Receive JSON request
   ↓
2. Validate required fields
   ↓
3. Load preprocessing artifacts
   ↓
4. Apply feature engineering
   ↓
5. Impute missing values (KNN)
   ↓
6. Encode categorical features
   ↓
7. Scale numerical features
   ↓
8. Load XGBoost Ordinal model
   ↓
9. Make prediction (0-4)
   ↓
10. Extract probabilities
   ↓
11. Map to risk category & color
   ↓
12. Generate action items
   ↓
13. Return JSON response
```

---

## 🐛 Common Issues

### Issue 1: Model File Not Found

**Error**: `FileNotFoundError: models/best_ordinal_model.pkl`

**Solution**:
```bash
# Ensure you're running from project root
cd cmpe-257-ML-heart-disease-risk-assessment
python src/api/app.py

# Or use absolute paths in app.py
```

### Issue 2: CORS Errors in Frontend

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Ensure `flask-cors` is installed
- Check CORS configuration in `app.py`
- Verify frontend is making requests to correct URL

### Issue 3: Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use`

**Solution**:
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in app.py
app.run(port=5000)
```

---

## 📚 Additional Resources

### Flask
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)

### XGBoost
- [XGBoost Python API](https://xgboost.readthedocs.io/en/stable/python/)
- [XGBoost Hyperparameter Tuning](https://xgboost.readthedocs.io/en/stable/parameter.html)

### scikit-learn
- [Preprocessing Pipeline](https://scikit-learn.org/stable/modules/preprocessing.html)
- [Model Persistence](https://scikit-learn.org/stable/model_persistence.html)

---

## 🔒 Security Considerations

### Current Implementation (Development)
- ✅ CORS enabled for frontend access
- ✅ Input validation on all requests
- ✅ Error messages don't expose internal details
- ✅ No sensitive data logging

### Production Recommendations
- ⚠️ **Rate Limiting**: Add Flask-Limiter to prevent abuse
  ```python
  from flask_limiter import Limiter
  limiter = Limiter(app, default_limits=["100 per hour"])
  ```
- ⚠️ **Authentication**: Add JWT if user accounts are needed
- ⚠️ **HTTPS**: Deploy behind a reverse proxy (nginx) with SSL
- ⚠️ **Data Privacy**: Ensure HIPAA compliance if storing patient data
- ⚠️ **API Keys**: Require API keys for production access
- ⚠️ **Logging**: Implement structured logging (avoid logging PHI)

---

## 📞 Support

For backend-specific issues:
1. Check Flask server logs for errors
2. Verify model files exist in `models/` directory
3. Test endpoints with cURL before frontend integration
4. Check Python dependencies are installed (`pip list`)

For general project questions, see [main README.md](../../README.md).

---

**Status**: ✅ Production-ready
**Last Updated**: November 24, 2025
**Version**: 1.0.0
**Model**: XGBoost Ordinal Classifier (F1 = 0.5863)
