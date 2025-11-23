# Heart Disease Risk Assessment API

Flask REST API for heart disease risk prediction using a hierarchical machine learning model.

## Features

- **POST /api/predict** - Get heart disease risk prediction with UI-optimized response
- **GET /api/health** - Check API health status
- **GET /api/info** - Get model information
- **GET /** - API documentation

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- flask>=3.0.0
- flask-cors>=4.0.0
- pandas>=2.2.0
- numpy>=2.0.0
- scikit-learn>=1.5.0
- xgboost>=2.1.0

### 2. Run the API

From the project root:

```bash
python src/api/app.py
```

The API will start on `http://localhost:8000`

### 3. Test the API

**Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Get Model Info:**
```bash
curl http://localhost:8000/api/info
```

**Make a Prediction:**
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 55,
    "sex": "Male",
    "cp": "typical angina",
    "trestbps": 140,
    "chol": 260,
    "fbs": "FALSE",
    "restecg": "normal",
    "thalch": 145,
    "exang": "TRUE",
    "oldpeak": 1.5,
    "slope": "flat",
    "ca": "1",
    "thal": "reversable defect"
  }'
```

## API Endpoints

### POST /api/predict

Get heart disease risk prediction.

**Request Body:**
```json
{
  "age": 55,
  "sex": "Male",
  "cp": "typical angina",
  "trestbps": 140,
  "chol": 260,
  "fbs": "FALSE",
  "restecg": "normal",
  "thalch": 145,
  "exang": "TRUE",
  "oldpeak": 1.5,
  "slope": "flat",
  "ca": "1",
  "thal": "reversable defect"
}
```

**Required Fields:**
- `age` - Patient age (1-120)
- `sex` - "Male" or "Female"
- `cp` - Chest pain type: "typical angina", "atypical angina", "non-anginal", "asymptomatic"
- `fbs` - Fasting blood sugar > 120 mg/dL: "TRUE" or "FALSE"
- `exang` - Exercise-induced angina: "TRUE" or "FALSE"

**Optional Fields (will use defaults if not provided):**
- `trestbps` - Resting blood pressure (mm Hg)
- `chol` - Cholesterol (mg/dL)
- `restecg` - Resting ECG results: "normal", "st-t wave abnormality", "left ventricular hypertrophy"
- `thalch` - Maximum heart rate achieved
- `oldpeak` - ST depression induced by exercise
- `slope` - Slope of peak exercise ST segment: "upsloping", "flat", "downsloping"
- `ca` - Number of major vessels (0-4)
- `thal` - Thalassemia: "normal", "fixed defect", "reversable defect"

**Response:**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "severity_level": 2,
      "severity_label": "Moderate Heart Disease",
      "risk_category": "High Risk",
      "confidence": 0.72
    },
    "display": {
      "title": "Moderate Risk Detected",
      "message": "Your assessment indicates a moderate level of heart disease risk...",
      "severity_color": "#FF6B35",
      "background_color": "#FFF3E0",
      "severity_icon": "warning",
      "confidence_display": "72% Confident",
      "confidence_bar": 72,
      "confidence_color": "#8BC34A"
    },
    "recommendation": {
      "action_items": [
        "Schedule a cardiology consultation within 2-4 weeks",
        "Bring this assessment and medical history to appointment",
        "Continue any prescribed medications",
        "Make immediate lifestyle changes (diet, exercise, smoking cessation)",
        "Monitor blood pressure daily"
      ],
      "urgency": "medium",
      "urgency_color": "#FF6B35"
    },
    "probabilities": {
      "chart_data": [
        {"label": "No Disease", "value": 15.2, "color": "#4CAF50"},
        {"label": "Mild", "value": 8.5, "color": "#FFC107"},
        {"label": "Moderate", "value": 72.3, "color": "#FF6B35"},
        {"label": "Severe", "value": 3.8, "color": "#E91E63"},
        {"label": "Very Severe", "value": 0.2, "color": "#9C27B0"}
      ],
      "dominant": "Moderate Heart Disease (72.3%)"
    },
    "next_steps": {
      "show_emergency_banner": false,
      "emergency_note": null
    },
    "disclaimer": {
      "text": "This is a screening tool only and not a medical diagnosis...",
      "type": "warning"
    }
  },
  "metadata": {
    "model_version": "1.0.0",
    "prediction_time": "2024-11-23T10:30:45Z",
    "report_id": "RPT-20241123-a1b2c3d4"
  }
}
```

### GET /api/health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0",
  "timestamp": "2024-11-23T10:30:45Z"
}
```

### GET /api/info

Get model information.

**Response:**
```json
{
  "model_name": "Heart Disease Risk Assessment",
  "model_version": "1.0.0",
  "binary_model": "XGBoost",
  "multiclass_model": "RandomForest",
  "f1_score": 0.85,
  "features_required": 13,
  "severity_levels": 5,
  "description": "AI-powered heart disease risk assessment using hierarchical classification"
}
```

## Severity Levels

| Level | Label | Risk Category | Color |
|-------|-------|---------------|-------|
| 0 | No Heart Disease | Low Risk | Green (#4CAF50) |
| 1 | Mild Heart Disease | Moderate Risk | Yellow (#FFC107) |
| 2 | Moderate Heart Disease | High Risk | Orange (#FF6B35) |
| 3 | Severe Heart Disease | Very High Risk | Pink (#E91E63) |
| 4 | Very Severe Heart Disease | Critical Risk | Purple (#9C27B0) |

## Error Handling

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "type": "validation_error",
    "message": "Missing required fields",
    "fields": ["age", "sex"],
    "display": {
      "title": "Please Check Your Information",
      "message": "The following required fields are missing: age, sex"
    }
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": {
    "type": "server_error",
    "message": "An unexpected error occurred",
    "details": "Error details...",
    "display": {
      "title": "Something Went Wrong",
      "message": "Please try again or contact support if the problem persists."
    }
  }
}
```

## CORS

CORS is enabled for all origins by default. For production, update the CORS configuration:

```python
from flask_cors import CORS

# Restrict to specific origins
CORS(app, origins=["https://yourdomain.com"])
```

## Production Deployment

### Using Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:8000 src.api.app:app
```

### Environment Variables

```bash
export FLASK_ENV=production
export FLASK_DEBUG=0
```

### Docker (optional)

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "src.api.app:app"]
```

Build and run:
```bash
docker build -t heart-disease-api .
docker run -p 8000:8000 heart-disease-api
```

## Development

### Project Structure
```
src/api/
├── __init__.py
├── app.py          # Main Flask application
└── README.md       # This file
```

### Adding New Endpoints

1. Add route decorator to `app.py`
2. Implement function
3. Update this README
4. Test with curl or Postman

## Testing

Test all endpoints:

```bash
# Health check
curl http://localhost:8000/api/health

# Model info
curl http://localhost:8000/api/info

# Prediction (all fields)
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d @test_data.json

# Prediction (minimal fields)
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 50,
    "sex": "Male",
    "cp": "asymptomatic",
    "fbs": "FALSE",
    "exang": "FALSE"
  }'
```

## Security Considerations

- ✅ CORS enabled for frontend access
- ✅ Input validation on all requests
- ✅ Error messages don't expose internal details
- ⚠️ Add rate limiting for production
- ⚠️ Add authentication if needed
- ⚠️ Use HTTPS in production
- ⚠️ Don't log sensitive patient data

## Support

For issues or questions, refer to:
- Main project README: `../../README.md`
- Development guide: `../../docs/development_guide/`
- Model documentation: `../../models/README.md`
