# Heart Disease Risk Assessment API

## Overview

This API provides heart disease risk assessment based on clinical patient data. The system uses a machine learning model trained on the UCI Heart Disease dataset to predict disease severity levels.

**Model Performance:**
- Primary Metric: F1-Score (weighted)
- Expected F1-Score: ~0.60-0.65 on test data
- Prediction Classes:
  - **0**: No Disease (< 50% artery blockage)
  - **1**: Mild Disease (original severity 1-2 grouped)
  - **2**: Severe Disease (original severity 3-4 grouped)

## API Endpoints

Base URL: `http://localhost:8000/api`

### POST `/api/predict`

Predicts heart disease severity based on patient clinical data.

#### Request Format

```json
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
```

#### Response Format

```json
{
  "prediction": 1,
  "prediction_label": "Mild Disease",
  "confidence": 0.85,
  "risk_level": "moderate",
  "recommendation": "Consult with a cardiologist for further evaluation. Lifestyle modifications recommended."
}
```

## Input Field Specifications

### Numeric Fields

| Field | Description | Type | Range | Unit |
|-------|-------------|------|-------|------|
| `age` | Patient age | Integer | 29-77 | years |
| `trestbps` | Resting blood pressure | Float | 94-200 | mm Hg |
| `chol` | Serum cholesterol | Float | 126-564 | mg/dl |
| `thalch` | Maximum heart rate achieved | Float | 71-202 | bpm |
| `oldpeak` | ST depression induced by exercise | Float | 0.0-6.2 | - |
| `ca` | Number of major vessels colored by fluoroscopy | Float | 0.0-3.0 | count |

### Categorical Fields

| Field | Description | Valid Values |
|-------|-------------|--------------|
| `sex` | Patient sex | `"Male"`, `"Female"` |
| `cp` | Chest pain type | `"typical angina"`, `"atypical angina"`, `"non-anginal"`, `"asymptomatic"` |
| `fbs` | Fasting blood sugar > 120 mg/dl | `true`, `false` |
| `restecg` | Resting ECG results | `"normal"`, `"st-t abnormality"`, `"lv hypertrophy"` |
| `exang` | Exercise induced angina | `true`, `false` |
| `slope` | Slope of peak exercise ST segment | `"upsloping"`, `"flat"`, `"downsloping"` |
| `thal` | Thalassemia | `"normal"`, `"fixed defect"`, `"reversable defect"` |

## Output Field Specifications

| Field | Description | Type | Values |
|-------|-------------|------|--------|
| `prediction` | Numerical severity prediction | Integer | `0`, `1`, `2` |
| `prediction_label` | Human-readable label | String | `"No Disease"`, `"Mild Disease"`, `"Severe Disease"` |
| `confidence` | Model confidence score | Float | 0.0-1.0 |
| `risk_level` | Risk assessment | String | `"low"`, `"moderate"`, `"high"` |
| `recommendation` | Clinical recommendation | String | Text description |

## Error Responses

### 400 Bad Request - Invalid Input

```json
{
  "error": "Invalid input",
  "details": "Field 'age' must be between 29 and 77"
}
```

### 500 Internal Server Error

```json
{
  "error": "Prediction failed",
  "details": "Internal server error occurred"
}
```

## Example Usage

### Using cURL

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Using Python

```python
import requests

url = "http://localhost:8000/api/predict"
data = {
    "age": 63,
    "sex": "Male",
    "cp": "typical angina",
    "trestbps": 145.0,
    "chol": 233.0,
    "fbs": True,
    "restecg": "lv hypertrophy",
    "thalch": 150.0,
    "exang": False,
    "oldpeak": 2.3,
    "slope": "downsloping",
    "ca": 0.0,
    "thal": "fixed defect"
}

response = requests.post(url, json=data)
result = response.json()
print(result)
```

### Using JavaScript (Fetch API)

```javascript
const url = "http://localhost:8000/api/predict";
const data = {
  age: 63,
  sex: "Male",
  cp: "typical angina",
  trestbps: 145.0,
  chol: 233.0,
  fbs: true,
  restecg: "lv hypertrophy",
  thalch: 150.0,
  exang: false,
  oldpeak: 2.3,
  slope: "downsloping",
  ca: 0.0,
  thal: "fixed defect"
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error("Error:", error));
```

## Running the API

### Prerequisites

```bash
pip install flask flask-cors numpy pandas scikit-learn xgboost imbalanced-learn
```

### Start the Server

```bash
python app.py
```

The API will be available at `http://localhost:8000/api`

### Testing the API

A test endpoint is available at `/api/health`:

```bash
curl http://localhost:8000/api/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_type": "Hierarchical"
}
```

Additional endpoints:
- `GET /api/model-info` - Get information about the loaded model

## Model Information

### Approach Used

The final model uses either:
- **Hierarchical Classification**: Two-stage prediction (binary then multi-class)
- **Multi-class Classification**: Direct 3-class prediction

The specific approach is determined during training based on which achieves better F1-score.

### Class Grouping

Original severity levels have been grouped for better class balance:
- **Class 0**: No Disease (unchanged)
- **Class 1**: Mild Disease (original 1-2)
- **Class 2**: Severe Disease (original 3-4)

### Preprocessing Pipeline

1. **Missing Value Imputation**: KNN imputation (k=5)
2. **Feature Encoding**: Label encoding for categorical variables
3. **Feature Engineering**: 
   - Age groups
   - Blood pressure categories
   - Cholesterol categories
   - Heart rate reserve
   - Cardiovascular risk score
4. **Feature Scaling**: StandardScaler normalization
5. **Class Balancing**: BorderlineSMOTE for training data

## Frontend Development Notes

### Form Validation

- Implement client-side validation for all numeric ranges
- Use dropdown menus for categorical fields to ensure valid values
- Mark all fields as required
- Provide helpful tooltips/descriptions for medical terms

### User Experience Recommendations

1. **Input Form**:
   - Group related fields (demographics, blood pressure/cholesterol, ECG results, exercise test)
   - Use appropriate input types (number, select, checkbox)
   - Add units to field labels (e.g., "Age (years)", "Blood Pressure (mm Hg)")

2. **Results Display**:
   - Show prediction label prominently with color coding:
     - Green: No Disease
     - Yellow: Mild Disease
     - Red: Severe Disease
   - Display confidence score as a percentage
   - Include clear, actionable recommendations
   - Add disclaimer: "This is a screening tool and not a substitute for professional medical advice"

3. **Error Handling**:
   - Display user-friendly error messages
   - Highlight invalid fields
   - Provide example values

### Security Considerations

- **DO NOT** store patient data without proper consent and HIPAA compliance
- Implement rate limiting to prevent abuse
- Use HTTPS in production
- Consider authentication if deploying publicly
- Log predictions securely without PII if needed for monitoring

## Model Files Required

The API requires these files in the `../../models/` directory:

- `best_multiclass_model.pkl` (or `hierarchical_classifier.pkl`)
- `preprocessing_artifacts.pkl`
- `model_metadata.pkl`

These are generated by running the `03_model_training.ipynb` notebook.

## Troubleshooting

### Common Issues

**Issue**: Model file not found
- **Solution**: Ensure you've run the training notebook and models are saved in `../../models/`

**Issue**: Prediction returns low confidence
- **Solution**: This is expected for borderline cases. Display appropriate uncertainty messaging to users.

**Issue**: CORS errors in browser
- **Solution**: CORS is enabled in the API. Check browser console for specific errors.

## Contact

For questions about the API or model:
- **Model Development Lead**: James Pham
- **Frontend Development Lead**: Le Duy Vu

## Version

- **API Version**: 1.0
- **Model Version**: 1.0
- **Last Updated**: December 2024
