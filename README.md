# Heart Disease Risk Assessment System

**CMPE 257 - Machine Learning (Fall 2025)**
San Jose State University

**Team**: Lam Nguyen, James Pham, Le Duy Vu, Vi Thi Tuong Nguyen

---

## 🎯 Project Overview

A **machine learning system** for predicting heart disease severity using clinical data. Features a full-stack implementation with React frontend, Flask backend, and advanced ML pipeline using **3-class severity grouping** for improved accuracy.

### Key Achievements

- ✅ **Binary Classification**: 85.1% F1-score (**13% above 75% target**)
- ✅ **3-Class Severity**: 65.4% F1-score (**+11.6% improvement** over 5-class approach)
- ✅ **Full-Stack Demo**: Working end-to-end application
- ✅ **Advanced Techniques**: Class grouping, ordinal classification, ensemble methods, SMOTE

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn

### Backend Setup (Flask API)

```bash
# 1. Navigate to project directory
cd cmpe-257-ML-heart-disease-risk-assessment

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run backend server
python src/api/app.py
```

✅ Backend running at **http://localhost:8000**

### Frontend Setup (React App)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Run development server
npm run dev
```

✅ Frontend running at **http://localhost:3000** (or 5173)

### Test the Application

1. Open http://localhost:3000 in your browser
2. Click **"Start Your Assessment"**
3. Accept terms & conditions
4. Fill the assessment form with test data (see [QUICKSTART.md](QUICKSTART.md))
5. View results with risk level, probability chart, and action items

---

## 📊 Performance Results

### Binary Classification (Disease Detection) ✅

| Model | Test F1 | Accuracy | ROC-AUC | Status |
|-------|---------|----------|---------|--------|
| **XGBoost (Tuned)** | **0.8692** | 0.8696 | 0.9214 | ✅ **BEST** |
| Voting Ensemble | 0.8421 | 0.8424 | 0.9225 | ✅ |
| Gradient Boosting | 0.8527 | 0.8533 | 0.9192 | ✅ |

**Achievement**: **85.1% F1** vs 75% target → **+13.5% above goal** ✅

### Multi-class Classification (3-Class Severity Grouping)

| Approach | Test F1 | Accuracy | Imbalance | Status |
|----------|---------|----------|-----------|--------|
| **3-Class (XGBoost)** | **0.6544** | 0.6576 | 3.04:1 | ✅ **CURRENT** |
| 5-Class (XGBoost Ordinal) | 0.5863 | 0.5815 | 15:1 | Previous |
| 5-Class (Gradient Boosting) | 0.5793 | 0.5761 | 15:1 | - |

**Current Model**: 3-class severity grouping
- **Classes**: 0 (No Disease), 1 (Mild-Moderate), 2 (Severe-Critical)
- **Improvement**: +11.6% F1-score over 5-class approach
- **Better Balance**: Reduced imbalance from 15:1 to 3.04:1
- **Per-Class F1**: Class 0: 0.79, Class 1: 0.60, Class 2: 0.38

---

## 🏗️ System Architecture

```
┌─────────────────┐      HTTP/JSON       ┌──────────────────┐
│  React Frontend │  ───────────────────> │   Flask Backend  │
│  (TypeScript)   │  <─────────────────── │    (Python)      │
│  Port 3000      │                       │    Port 8000     │
└─────────────────┘                       └──────────────────┘
        │                                          │
        v                                          v
    TailwindCSS                              ML Pipeline
    React Hook Form                    ┌──────────────────┐
    Recharts                           │  Preprocessing   │
    Axios                              │  - KNN Imputer   │
                                       │  - Label Encoder │
                                       │  - BorderlineSMOTE│
                                       └──────────────────┘
                                                 │
                                                 v
                                       ┌──────────────────┐
                                       │  XGBoost 3-Class │
                                       │  Classifier      │
                                       │  F1 = 0.6544     │
                                       └──────────────────┘
```

---

## 📁 Project Structure

```
cmpe-257-ML-heart-disease-risk-assessment/
│
├── 📓 notebooks/
│   ├── data_preprocessing.ipynb        ⭐ EDA & preprocessing
│   ├── model_training.ipynb            ⭐ Model development
│   ├── three_class_grouping.ipynb      ⭐ 3-class model (current)
│   ├── ordinal_classification.ipynb    Ordinal experiments
│   └── phase1_improvements.ipynb       Advanced techniques
│
├── 🔧 src/api/
│   ├── app.py                          ⭐ Flask API (3 endpoints)
│   └── README.md                       Backend documentation
│
├── 🎨 frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx                Landing page
│   │   │   └── SimpleAssessment.tsx    ⭐ Main assessment form
│   │   ├── components/                 Reusable UI components
│   │   ├── services/                   API integration
│   │   └── types/                      TypeScript types
│   ├── package.json                    Dependencies
│   ├── vite.config.ts                  Build configuration
│   └── README.md                       Frontend documentation
│
├── 🤖 models/
│   ├── best_3class_model.pkl           ⭐ XGBoost 3-class (F1=0.6544)
│   ├── preprocessing_artifacts_3class.pkl  ⭐ Scalers, encoders
│   ├── model_metadata_3class.pkl       ⭐ Performance metrics
│   ├── best_ordinal_model.pkl          Previous 5-class model
│   └── hierarchical_classifier.pkl     Hierarchical model
│
├── 📊 data/
│   ├── raw/                            UCI heart disease dataset
│   └── processed/                      Train/test splits
│
├── 📈 results/
│   ├── three_class_grouping_results.csv   ⭐ 3-class experiment results
│   ├── ordinal_classification_results.csv
│   ├── phase1_improvements_results.csv
│   └── *.png                           Confusion matrices, plots
│
├── 📖 Documentation/
│   ├── README.md                       ⭐ This file
│   ├── FINAL_RESULTS.md                ⭐ Comprehensive results
│   ├── TECHNICAL_DETAILS.md            ⭐ System architecture
│   ├── QUICKSTART.md                   5-minute setup guide
│   ├── DEMO_CHECKLIST.md               Presentation prep
│   ├── PROJECT_REPORT_TEMPLATE.md      Report structure
│   └── docs/archive/                   Archived documentation
│
├── requirements.txt                    Python dependencies
└── .gitignore
```

---

## 🔬 Methodology

### Dataset
- **Source**: UCI Heart Disease (4 medical centers)
- **Size**: 920 patients
- **Features**: 14 clinical attributes → 18 after engineering
- **Classes**: 3 severity groups (0: No Disease, 1: Mild-Moderate, 2: Severe-Critical)
- **Original Challenge**: Extreme 15:1 class imbalance in 5-class approach
- **Solution**: 3-class grouping reduced imbalance to 3.04:1

### Preprocessing Pipeline

1. **Missing Value Handling**
   - KNN Imputation (k=5) for ca (66% missing), thal (53% missing)
   - Mode/median for other features
   - Missing indicators for high-missingness features

2. **Feature Engineering**
   - `age_group`: WHO age categories
   - `bp_category`: AHA blood pressure guidelines
   - `chol_category`: Cholesterol risk levels
   - `hr_reserve`: Heart rate reserve
   - `cv_risk_score`: Composite cardiovascular risk

3. **Class Imbalance**
   - **Binary**: SMOTE (k=5)
   - **Multi-class**: BorderlineSMOTE (borderline-1, k=3)

4. **Scaling**: StandardScaler (fit on train only)

### Models Developed

**Binary Classification**:
- Logistic Regression, Random Forest, XGBoost, SVM, Gradient Boosting
- Ensemble: Voting (RF+XGB+GB), Stacking (RF+XGB+GB→LR)
- Hyperparameter tuning: RandomizedSearchCV (50 iterations, 5-fold CV)

**Multi-class Classification**:
- **3-class grouping** (XGBoost with class consolidation) ✅ **CURRENT**
- 5-class ordinal (XGBoost with sample weighting)
- Hierarchical (Binary → Severity)
- Direct multi-class (Gradient Boosting, Random Forest)

---

## 🎨 Frontend Features

- **Single-page assessment form** with 4 sections (Demographics, Symptoms, Vitals, Diagnostics)
- **Real-time validation** using React Hook Form
- **Color-coded results** (green/orange/red-pink for 3 severity levels)
- **Probability visualization** with Recharts bar charts (3 classes)
- **Action items** personalized by risk level
- **Responsive design** (mobile-friendly)
- **Medical disclaimer** and terms & conditions

### Tech Stack
- React 19.2.0 + TypeScript 5.6.2
- Vite 7.2.2 (build tool)
- TailwindCSS 3.4.18
- React Hook Form 7.66.0
- Axios 1.13.2
- Recharts 3.4.1

---

## 🔌 API Endpoints

### POST /api/predict
Predicts heart disease severity level.

**Request**:
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

**Response**:
```json
{
  "success": true,
  "data": {
    "prediction": 2,
    "confidence": 0.78,
    "probabilities": {"0": 0.05, "1": 0.17, "2": 0.78},
    "risk_category": "Severe-Critical",
    "risk_color": "#E91E63",
    "action_items": ["Contact cardiologist IMMEDIATELY", ...]
  }
}
```

### GET /api/health
Health check endpoint.

### GET /api/info
Model information and metadata.

See [src/api/README.md](src/api/README.md) for full API documentation.

---

## 📖 Documentation

| File | Purpose | Audience |
|------|---------|----------|
| [README.md](README.md) | Project overview (this file) | Everyone |
| [FINAL_RESULTS.md](FINAL_RESULTS.md) | Comprehensive results & analysis | Instructors, reviewers |
| [TECHNICAL_DETAILS.md](TECHNICAL_DETAILS.md) | System architecture & implementation | Developers |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup guide | New users |
| [DEMO_CHECKLIST.md](DEMO_CHECKLIST.md) | Presentation preparation | Presenters |
| [PROJECT_REPORT_TEMPLATE.md](PROJECT_REPORT_TEMPLATE.md) | Report structure for .docx | Report writers |
| [frontend/README.md](frontend/README.md) | Frontend-specific docs | Frontend developers |
| [src/api/README.md](src/api/README.md) | Backend API docs | Backend developers |

---

## 🎯 Multi-class Classification Progress

### 3-Class Grouping Improvement

We implemented **3-class severity grouping** to address extreme class imbalance:

**Previous (5-class)**: 58.6% F1-score
- Classes 0-4 with 15:1 imbalance
- Classes 3 & 4 nearly identical (only 28 samples in class 4)

**Current (3-class)**: **65.4% F1-score (+11.6% improvement)**
- Class 0: No Disease
- Class 1: Mild-Moderate (combined 1-2)
- Class 2: Severe-Critical (combined 3-4)
- Reduced imbalance to 3.04:1

### Gap to Target

Current F1 (65.4%) vs target (75%) = **-12.8% gap**

**Remaining challenges**:
1. Class 2 (Severe-Critical) still has low F1 (0.38) with only 135 samples
2. Massive missing data (66% in `ca`, 53% in `thal`)
3. Small dataset (920 samples)

**Context**: Published research achieves 55-65% F1, making our 65.4% **competitive**.

**Success**: Binary classification **exceeded target by 13%** (85.1% vs 75%), demonstrating strong methodology.

---

## 🚀 Future Improvements

### Short-term (1-2 weeks)
- SHAP explanations for model interpretability
- Confusion matrix per-class analysis
- Cost-sensitive learning with medical costs

### Medium-term (1-2 months)
- Full backend with PostgreSQL + JWT auth
- User dashboard for assessment history
- Further optimization (ensemble methods, cost-sensitive learning)

### Long-term (3-6 months)
- Cloud deployment (Vercel + Railway)
- External validation on different datasets
- Mobile app (React Native)
- Research paper on ordinal medical classification

See [TECHNICAL_DETAILS.md](TECHNICAL_DETAILS.md#future-improvements) for detailed roadmap.

---

## 📚 Resources

### Datasets
- [UCI Heart Disease Dataset](https://archive.ics.uci.edu/dataset/45/heart+disease)
- [Kaggle Mirror](https://www.kaggle.com/datasets/redwankarimsony/heart-disease-data)

### Technical References
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [imbalanced-learn (SMOTE)](https://imbalanced-learn.org/)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)

---

## 👥 Team

- **Lam Nguyen** - Data preprocessing & feature engineering
- **James Pham** - Model development & training
- **Le Duy Vu** - Full-stack implementation (frontend + backend)
- **Vi Thi Tuong Nguyen** - Evaluation & documentation

---

## 📜 License

This project is for educational purposes (CMPE 257 coursework).

---

## 🙏 Acknowledgments

- UCI Machine Learning Repository for the heart disease dataset
- CMPE 257 teaching team for guidance
- Published research for baseline comparisons

---

## 📞 Support

For questions or issues:
1. Check [QUICKSTART.md](QUICKSTART.md) for setup
2. Review [TECHNICAL_DETAILS.md](TECHNICAL_DETAILS.md) for architecture
3. See [DEMO_CHECKLIST.md](DEMO_CHECKLIST.md) for presentation
4. Contact team members for specific areas

---

**Status**: ✅ **Production-ready for demo** (3-class model)
**Last Updated**: November 25, 2025
**Version**: 1.1.0 (3-class severity grouping)

**GitHub**: [Lambert-Nguyen/cmpe-257-ML-heart-disease-risk-assessment](https://github.com/Lambert-Nguyen/cmpe-257-ML-heart-disease-risk-assessment)
