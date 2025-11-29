# Heart Disease Risk Assessment API

## Overview

This API provides heart disease risk assessment based on clinical patient data. The system uses a machine learning model trained on the UCI Heart Disease dataset to predict disease severity levels.

**Model Performance:**
- Primary Metric: F1-Score (weighted)
- Expected F1-Score: ~0.71 on test data
- Prediction Classes:
  - **0**: No Disease (< 50% artery blockage)
  - **1**: Mild Disease (original severity 1-2 grouped)
  - **2**: Severe Disease (original severity 3-4 grouped)

## API Endpoints

### POST `/api/predict`

Predicts heart disease severity based on patient clinical data.

#### Request Format

**Complete Request (all fields):**
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

**Minimal Request (only required fields):**
```json
{
  "age": 45,
  "sex": "Female",
  "cp": "asymptomatic",
  "exang": false
}
```

**Note**: When optional fields are omitted, the API automatically applies sensible defaults. See [Optional Fields](#optional-fields-9-fields) for default values.

#### Response Format

**Success Response (200):**
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
  }
}
```

## Input Field Specifications

### Required Fields (4 fields)

These fields must always be provided:

| Field | Description | Type | Valid Values |
|-------|-------------|------|--------------|
| `age` | Patient age | Integer | 18-120 years |
| `sex` | Patient sex | String | `"Male"`, `"Female"` |
| `cp` | Chest pain type | String | `"typical angina"`, `"atypical angina"`, `"non-anginal"`, `"asymptomatic"` |
| `exang` | Exercise induced angina | Boolean | `true`, `false` |

### Optional Fields (9 fields)

These fields can be omitted. If not provided, sensible defaults will be used:

#### Numeric Optional Fields

| Field | Description | Type | Range | Unit | Default if Missing |
|-------|-------------|------|-------|------|--------------------|
| `trestbps` | Resting blood pressure | Float | 70-250 | mm Hg | `130.0` (median BP) |
| `chol` | Serum cholesterol | Float | 100-600 | mg/dl | `200.0` (median cholesterol) |
| `thalch` | Maximum heart rate achieved | Float | 60-220 | bpm | `220 - age` (estimated) |
| `oldpeak` | ST depression induced by exercise | Float | -3.0 to 10.0 | - | `0.0` (no test done) |
| `ca` | Number of major vessels with blockage | Float | 0.0-4.0 | count | `0.0` (no test/no blockages) |

#### Categorical Optional Fields

| Field | Description | Valid Values | Default if Missing |
|-------|-------------|--------------|-------------------|
| `fbs` | Fasting blood sugar > 120 mg/dl | `true`, `false` | `false` (non-diabetic) |
| `restecg` | Resting ECG results | `"normal"`, `"st-t abnormality"`, `"lv hypertrophy"` | `"normal"` |
| `slope` | Slope of peak exercise ST segment | `"upsloping"`, `"flat"`, `"downsloping"` | `"upsloping"` |
| `thal` | Thalassemia/nuclear stress test | `"normal"`, `"fixed defect"`, `"reversable defect"` | `"normal"` |

### Default Values Rationale

Default values are based on:
- **Population medians**: For blood pressure (130) and cholesterol (200)
- **Conservative assumptions**: Assuming no disease for untested parameters
- **Medical formulas**: Max heart rate = 220 - age
- **Common results**: Most ECGs and stress tests are normal in screening populations

## Output Field Specifications

| Field | Description | Type | Values |
|-------|-------------|------|--------|
| `success` | Request success status | Boolean | `true`, `false` |
| `data` | Response data (on success) | Object | See below |
| `error` | Error message (on failure) | String | Error description |

### Success Response Data Fields

| Field | Description | Type | Values |
|-------|-------------|------|--------|
| `prediction` | Numerical severity prediction | Integer | `0`, `1`, `2` |
| `confidence` | Model confidence score | Float | 0.0-1.0 |
| `probabilities` | Probability for each class | Object | `{"0": float, "1": float, "2": float}` |
| `risk_category` | Human-readable category | String | `"No Disease"`, `"Mild-Moderate"`, `"Severe-Critical"` |
| `risk_color` | UI color hex code | String | `"#4CAF50"`, `"#FF9800"`, `"#E91E63"` |
| `action_items` | Personalized recommendations | Array[String] | List of actionable steps |

### Severity Level Mapping

| Level | Category | Color | UI Hex |
|-------|----------|-------|--------|
| 0 | No Disease | Green | #4CAF50 |
| 1 | Mild-Moderate | Orange | #FF9800 |
| 2 | Severe-Critical | Red-Pink | #E91E63 |

## Error Responses

### 400 Bad Request - Invalid Input

```json
{
  "success": false,
  "error": "Missing required fields: age, sex"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Prediction failed: [error details]"
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

if result['success']:
    data = result['data']
    print(f"Prediction: {data['prediction']}")
    print(f"Risk Category: {data['risk_category']}")
    print(f"Confidence: {data['confidence']:.2%}")
    print(f"\nProbabilities:")
    for level, prob in data['probabilities'].items():
        print(f"  Level {level}: {prob:.2%}")
    print(f"\nAction Items:")
    for item in data['action_items']:
        print(f"  - {item}")
else:
    print(f"Error: {result['error']}")
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
  .then(result => {
    if (result.success) {
      const { prediction, risk_category, confidence, probabilities, risk_color, action_items } = result.data;
      
      console.log(`Prediction: ${prediction}`);
      console.log(`Risk Category: ${risk_category}`);
      console.log(`Confidence: ${(confidence * 100).toFixed(2)}%`);
      console.log(`Risk Color: ${risk_color}`);
      console.log("\nProbabilities:");
      Object.entries(probabilities).forEach(([level, prob]) => {
        console.log(`  Level ${level}: ${(prob * 100).toFixed(2)}%`);
      });
      console.log("\nAction Items:");
      action_items.forEach(item => console.log(`  - ${item}`));
    } else {
      console.error(`Error: ${result.error}`);
    }
  })
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
  "model_loaded": true
}
```

## Test Cases

Here are several test cases representing different patient scenarios you can use to test the `/api/predict` endpoint:

### Test Case 1: Healthy Patient (Expected: Class 0 - No Disease)

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "sex": "Female",
    "cp": "asymptomatic",
    "trestbps": 110.0,
    "chol": 180.0,
    "fbs": false,
    "restecg": "normal",
    "thalch": 180.0,
    "exang": false,
    "oldpeak": 0.0,
    "slope": "upsloping",
    "ca": 0.0,
    "thal": "normal"
  }'
```

**Patient Profile:** Young female with excellent cardiovascular markers, no chest pain, normal ECG, high exercise capacity.

---

### Test Case 2: Mild Disease Patient (Expected: Class 1 - Mild-Moderate)

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 52,
    "sex": "Male",
    "cp": "atypical angina",
    "trestbps": 140.0,
    "chol": 220.0,
    "fbs": false,
    "restecg": "st-t abnormality",
    "thalch": 140.0,
    "exang": true,
    "oldpeak": 1.5,
    "slope": "flat",
    "ca": 0.0,
    "thal": "normal"
  }'
```

**Patient Profile:** Middle-aged male with borderline high blood pressure, elevated cholesterol, atypical chest pain, mild exercise-induced changes.

---

### Test Case 3: High-Risk Elderly Patient (Expected: Class 2 - Severe-Critical)

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 70,
    "sex": "Male",
    "cp": "typical angina",
    "trestbps": 160.0,
    "chol": 280.0,
    "fbs": true,
    "restecg": "lv hypertrophy",
    "thalch": 120.0,
    "exang": true,
    "oldpeak": 3.5,
    "slope": "downsloping",
    "ca": 2.0,
    "thal": "reversable defect"
  }'
```

**Patient Profile:** Elderly male with multiple severe risk factors: typical angina, stage 2 hypertension, very high cholesterol, diabetes, low exercise capacity, multiple vessel disease.

---

### Test Case 4: Middle-Aged with Mixed Indicators (Expected: Class 0 or 1)

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "sex": "Female",
    "cp": "non-anginal",
    "trestbps": 130.0,
    "chol": 200.0,
    "fbs": false,
    "restecg": "normal",
    "thalch": 165.0,
    "exang": false,
    "oldpeak": 0.5,
    "slope": "upsloping",
    "ca": 0.0,
    "thal": "normal"
  }'
```

**Patient Profile:** Middle-aged female with borderline blood pressure and cholesterol, non-cardiac chest pain, good exercise tolerance.

---

### Test Case 5: Asymptomatic but High Risk (Expected: Class 1 or 2)

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 58,
    "sex": "Male",
    "cp": "asymptomatic",
    "trestbps": 150.0,
    "chol": 250.0,
    "fbs": true,
    "restecg": "st-t abnormality",
    "thalch": 130.0,
    "exang": false,
    "oldpeak": 2.0,
    "slope": "flat",
    "ca": 1.0,
    "thal": "reversable defect"
  }'
```

**Patient Profile:** Asymptomatic male but with significant underlying risk factors: hypertension, high cholesterol, diabetes, abnormal stress test, single vessel disease.

---

### Test Case 6: Minimal Request - User Doesn't Know Medical Details (Expected: Class 0 or 1)

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 42,
    "sex": "Female",
    "cp": "non-anginal",
    "exang": false
  }'
```

**Patient Profile:** Middle-aged female who only knows basic symptoms. All optional fields will use defaults:
- Blood pressure: 130 (default median)
- Cholesterol: 200 (default median)
- Fasting blood sugar: false (non-diabetic default)
- ECG: normal (default)
- Max heart rate: 178 (calculated as 220 - 42)
- ST depression: 0.0 (no test default)
- ST slope: upsloping (favorable default)
- Major vessels: 0 (no test default)
- Thalassemia: normal (no test default)

---

### Expected Results Summary

| Test Case | Age/Sex | Key Risk Factors | Expected Class | Expected Category |
|-----------|---------|------------------|----------------|-------------------|
| 1 | 35F | Excellent markers, no symptoms | 0 | No Disease |
| 2 | 52M | Borderline BP/cholesterol, atypical angina | 1 | Mild-Moderate |
| 3 | 70M | Multiple severe factors, multi-vessel disease | 2 | Severe-Critical |
| 4 | 45F | Borderline factors, non-cardiac pain | 0-1 | No Disease or Mild |
| 5 | 58M | Asymptomatic but abnormal stress test | 1-2 | Mild or Severe |
| 6 | 42F | Minimal data, only symptoms (uses defaults) | 0-1 | No Disease or Mild |

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

### Response Structure

The API returns a structured response with `success` field and nested `data` object:

```javascript
// Success response
{
  success: true,
  data: {
    prediction: 0-2,
    confidence: 0.0-1.0,
    probabilities: { "0": float, "1": float, "2": float },
    risk_category: string,
    risk_color: string (hex code),
    action_items: string[]
  }
}

// Error response
{
  success: false,
  error: string
}
```

### Form Validation

- Implement client-side validation for all numeric ranges (only if user provides values)
- Use dropdown menus for categorical fields to ensure valid values
- Mark only 4 fields as required: age, sex, chest pain type, exercise-induced angina
- Mark 9 fields as optional with "Skip if unknown" option
- Provide helpful tooltips/descriptions for medical terms
- Show default values that will be used if fields are left empty

### User Experience Recommendations

1. **Input Form**:
   - Group related fields (demographics, blood pressure/cholesterol, ECG results, exercise test)
   - Use appropriate input types (number, select, checkbox)
   - Add units to field labels (e.g., "Age (years)", "Blood Pressure (mm Hg)")

2. **Results Display**:
   - Use `risk_color` from response for background/border styling
   - Show prediction prominently with color coding:
     - Green (#4CAF50): No Disease
     - Orange (#FF9800): Mild-Moderate
     - Red-Pink (#E91E63): Severe-Critical
   - Display `confidence` as a percentage with progress bar
   - Show `probabilities` as a bar chart or percentage breakdown
   - Render `action_items` as a numbered or bulleted list
   - Add disclaimer: "This is a screening tool and not a substitute for professional medical advice"

3. **Example UI Implementation**:
   ```javascript
   // Parse response
   const { prediction, risk_category, confidence, probabilities, risk_color, action_items } = result.data;
   
   // Set background color
   resultCard.style.borderLeft = `5px solid ${risk_color}`;
   
   // Display risk category with badge
   riskBadge.textContent = risk_category;
   riskBadge.style.backgroundColor = risk_color;
   
   // Show confidence meter
   confidenceMeter.style.width = `${confidence * 100}%`;
   confidenceMeter.style.backgroundColor = risk_color;
   
   // Render probabilities
   Object.entries(probabilities).forEach(([level, prob]) => {
     const bar = document.createElement('div');
     bar.style.width = `${prob * 100}%`;
     bar.className = `prob-bar level-${level}`;
     probabilitiesContainer.appendChild(bar);
   });
   
   // Render action items
   action_items.forEach(item => {
     const li = document.createElement('li');
     li.textContent = item;
     actionList.appendChild(li);
   });
   ```

4. **Error Handling**:
   - Display user-friendly error messages from `error` field
   - Highlight invalid fields based on validation errors
   - Provide example values for guidance
   - Show loading state during API call

## Model Files Required

The API requires these files in the `../../models/` directory:

- `hierarchical_classifier.pkl` (or `best_multiclass_model.pkl`)
- `model_metadata.pkl`

And a file in the `../../data/processed/` directory:

- `preprocessing_artifacts.pkl`

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
