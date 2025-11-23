# Heart Disease Risk Assessment - Web Development Guide

## Overview

This package contains everything needed to build the Heart Disease Risk Assessment web application. The web app allows users to fill out a questionnaire about their health and receive an AI-powered assessment of their heart disease risk.

---

## Package Contents

### 1. Core Documentation
- `USER_QUESTIONNAIRE_GUIDE.md` - User-friendly questions for the form
- `FRONTEND_API_RESPONSE_FORMAT.md` - UI-optimized API response structure

### 2. Code Samples
- `sample_webapp_form.html` - Complete HTML/CSS/JS form template
- `enhanced_flask_api.py` - Backend API with UI-friendly responses
- `model_deployment_guide.ipynb` - Technical deployment guide

### 3. Model Artifacts (in ../models/)
- `hierarchical_classifier.pkl` - Trained model
- `model_metadata.pkl` - Model information
- `preprocessing_artifacts.pkl` - Preprocessing artifacts in ../data/processed/

---

## Quick Start for Web Development Team

### Step 1: Understand the User Flow
Read `USER_QUESTIONNAIRE_GUIDE.md` to understand:
- What questions to ask users
- How to make technical medical terms user-friendly
- Which fields are required vs optional
- Suggested UI/UX design

### Step 2: Review the Sample Frontend
Open `sample_webapp_form.html` in a browser to see:
- Multi-step form with progress indicator
- User-friendly question format
- Responsive design
- Result display with color-coded risk levels

### Step 3: Set Up the Backend
Use `enhanced_flask_api.py` which provides:
- `/api/predict` - Main prediction endpoint
- `/api/health` - Health check
- `/api/info` - Model information

### Step 4: Customize the API Response
Review `FRONTEND_API_RESPONSE_FORMAT.md` for:
- Color schemes by risk level
- Icon mappings
- User-friendly text templates
- Chart/gauge configurations

---

## Application Flow

```
┌─────────────────┐
│  User visits    │
│  web app        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fill out form   │
│ (5 sections)    │
│ - Demographics  │
│ - Symptoms      │
│ - Health metrics│
│ - Heart tests   │
│ - Advanced tests│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Submit to API   │
│ POST /api/predict
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend         │
│ - Preprocesses  │
│ - Runs model    │
│ - Formats result│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display Results │
│ - Risk level    │
│ - Confidence    │
│ - Actions       │
│ - Charts        │
└─────────────────┘
```

---

## Design Specifications

### Risk Level Color Scheme

| Level | Label | Color | Icon |
|-------|-------|-------|------|
| 0 | No Disease | Green (#4CAF50) | ✓ check_circle |
| 1 | Mild | Yellow (#FFC107) | ℹ info |
| 2 | Moderate | Orange (#FF6B35) | ⚠ warning |
| 3 | Severe | Pink (#E91E63) | ✖ error |
| 4 | Very Severe | Purple (#9C27B0) | ⚡ priority_high |

### Typography
- **Font Family**: Roboto (or similar sans-serif)
- **Headings**: 500-700 weight
- **Body**: 400 weight

### Responsive Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## Technical Requirements

### Frontend
```
- HTML5
- CSS3 (or framework: Tailwind, Bootstrap, Material-UI)
- JavaScript (Vanilla or React/Vue/Angular)
- Fetch API or Axios for HTTP requests
```

### Backend
```
- Python 3.8+
- Flask or FastAPI
- Required packages:
  - pandas>=2.2.0
  - numpy>=2.0.0
  - scikit-learn>=1.5.0
  - xgboost>=2.1.0
  - imbalanced-learn>=0.12.0
  - flask>=3.0.0 (or fastapi>=0.104.0)
  - flask-cors (for CORS support)
```

### Installation
```bash
pip install -r requirements.txt
```

### Running the Backend
```bash
python enhanced_flask_api.py
# Server will start on http://localhost:8000
```

---

## Form Fields Reference

### Required Fields (5)
1. **age** - Number (1-120)
2. **sex** - Radio: Male/Female
3. **cp** - Radio: 4 chest pain types
4. **fbs** - Radio: TRUE/FALSE
5. **exang** - Radio: TRUE/FALSE

### Optional Fields (8)
6. **trestbps** - Number (blood pressure)
7. **chol** - Number (cholesterol)
8. **restecg** - Dropdown: ECG results
9. **thalch** - Number (heart rate)
10. **oldpeak** - Number (ST depression)
11. **slope** - Dropdown: ST slope
12. **ca** - Dropdown: Number of vessels (0-4)
13. **thal** - Dropdown: Thalassemia result

**Note**: Optional fields have safe defaults if not provided.

---

## Sample API Request/Response

### Request
```javascript
POST /api/predict
Content-Type: application/json

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

### Response
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
      "message": "Your assessment indicates a moderate level of heart disease risk.",
      "severity_color": "#FF6B35",
      "severity_icon": "warning",
      "confidence_display": "72% Confident",
      "confidence_bar": 72
    },
    "recommendation": {
      "action_items": [
        "Schedule a cardiology consultation within 2-4 weeks",
        "Bring this assessment to your appointment",
        "Make immediate lifestyle changes",
        "Monitor blood pressure daily"
      ]
    }
  }
}
```

---

## Implementation Checklist

### Phase 1: Basic Functionality
- [ ] Set up frontend project structure
- [ ] Implement multi-step form (5 sections)
- [ ] Add form validation
- [ ] Set up backend API
- [ ] Test API connection
- [ ] Display basic results

### Phase 2: Enhanced UX
- [ ] Add progress indicator
- [ ] Add loading states
- [ ] Style results with colors
- [ ] Add confidence bar
- [ ] Implement error handling

### Phase 3: Polish
- [ ] Mobile responsive design
- [ ] Accessibility features (ARIA, keyboard nav)
- [ ] Add help tooltips
- [ ] Add animations/transitions
- [ ] Browser testing

### Phase 4: Deployment
- [ ] Set up CI/CD
- [ ] Security review
- [ ] Performance optimization
- [ ] Production deployment

---

## Important Disclaimers

### Medical Disclaimer
```
REQUIRED: Display this prominently on the results page:

"This is a screening tool only and not a medical diagnosis. 
Always consult with qualified healthcare professionals for medical advice."
```

### Emergency Warning (for Level 4)
```
For severity level 4, show:

"EMERGENCY: Seek immediate medical attention. 
Call 911 or go to the nearest emergency room."
```

---

## User Education

### Recommended Help Sections
1. **What is this tool?**
   - Explanation of AI-powered risk assessment
   - Not a replacement for medical diagnosis
   
2. **How accurate is it?**
   - Model performance metrics
   - Best for screening, not diagnosis

3. **What do I need to know?**
   - List of required vs optional information
   - Note that some fields can be left blank

4. **What do the results mean?**
   - Explanation of 5 severity levels
   - What each recommendation means

---

## Error Handling

### Common Errors to Handle

1. **Validation Errors**
   - Show which fields are incorrect
   - Highlight in red
   - Provide helpful error messages

2. **Network Errors**
   - "Unable to connect. Check your internet."
   - Retry button

3. **Server Errors**
   - "Something went wrong. Please try again."
   - Contact support info

4. **Low Confidence**
   - If confidence < 60%, show warning
   - Suggest consulting doctor for better assessment

---

## Security Considerations

1. **Data Privacy**
   - Never store personally identifiable information
   - Use HTTPS in production
   - Clear form data after submission

2. **Rate Limiting**
   - Prevent API abuse
   - Implement rate limiting (e.g., 10 requests/minute)

3. **Input Validation**
   - Server-side validation (don't trust client)
   - Sanitize all inputs
   - Prevent SQL injection (though not using SQL)

---

## Additional Resources

1. **Original Proposal**: `CMPE_257__Proposal.pdf`
2. **Model Training Notebook**: `model_training_updated.ipynb`
3. **Deployment Guide**: `model_deployment_guide.ipynb`
4. **Frontend API Format**: `FRONTEND_API_RESPONSE_FORMAT.md`
5. **User Questions Guide**: `USER_QUESTIONNAIRE_GUIDE.md`
