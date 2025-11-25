"""
3-Class Grouping Strategy for Heart Disease Severity
=====================================================

Grouping Strategy:
- Class 0: No Disease (original class 0)
- Class 1: Mild to Moderate (original classes 1-2)
- Class 2: Severe to Very Severe (original classes 3-4)

Rationale:
1. Addresses extreme class imbalance (15:1 ratio in 5-class)
2. Creates clinically meaningful groups
3. Improves F1-score by reducing class confusion
4. Maintains severity ordering for ordinal classification

Expected Improvement:
- 5-class F1: 0.5863 → 3-class F1: target 0.75+
"""

import pandas as pd
import numpy as np
import pickle
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import KNNImputer
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    f1_score, precision_score, recall_score
)

from imblearn.over_sampling import BorderlineSMOTE
from xgboost import XGBClassifier

import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

print("="*70)
print("3-CLASS GROUPING EXPERIMENT")
print("="*70)
print("\nGrouping Strategy:")
print("  Class 0: No Disease (original 0)")
print("  Class 1: Mild-Moderate (original 1-2)")
print("  Class 2: Severe-Critical (original 3-4)")
print("="*70)

# ============================================================================
# 1. LOAD AND PREPARE DATA
# ============================================================================

print("\n[1/6] Loading data...")

# Load the original dataset
data_path = Path("../data/raw/heart_disease_uci.csv")

df = pd.read_csv(data_path)

# Drop non-feature columns
columns_to_drop = ['id', 'dataset']
df = df.drop(columns=[col for col in columns_to_drop if col in df.columns])

print(f"✓ Loaded {len(df)} samples")
print(f"✓ Dataset columns: {list(df.columns)}")

# ============================================================================
# 2. APPLY 3-CLASS GROUPING
# ============================================================================

print("\n[2/6] Applying 3-class grouping...")

# Original class distribution
original_target = 'num' if 'num' in df.columns else 'target'
print(f"\nOriginal 5-class distribution:")
print(df[original_target].value_counts().sort_index())

# Create 3-class grouping
def group_severity(severity):
    """
    Group 5 severity levels into 3 clinical categories

    0: No Disease (healthy)
    1: Mild-Moderate (needs monitoring/lifestyle changes)
    2: Severe-Critical (needs urgent medical intervention)
    """
    if severity == 0:
        return 0  # No disease
    elif severity in [1, 2]:
        return 1  # Mild-Moderate
    else:  # severity in [3, 4]
        return 2  # Severe-Critical

df['target_3class'] = df[original_target].apply(group_severity)

print(f"\nNew 3-class distribution:")
class_counts = df['target_3class'].value_counts().sort_index()
print(class_counts)
print(f"\nImbalance ratio: {class_counts.max() / class_counts.min():.2f}:1")
print(f"Improvement: 15:1 → {class_counts.max() / class_counts.min():.2f}:1")

# ============================================================================
# 3. FEATURE ENGINEERING (SAME AS BEFORE)
# ============================================================================

print("\n[3/6] Feature engineering...")

# Create age groups (WHO categories)
df['age_group'] = pd.cut(df['age'], bins=[0, 40, 60, 80, 100],
                          labels=[0, 1, 2, 3])  # Young, Middle, Senior, Elderly

# Blood pressure categories (AHA guidelines)
df['bp_category'] = pd.cut(df['trestbps'], bins=[0, 120, 130, 140, 200],
                            labels=[0, 1, 2, 3])  # Normal, Elevated, Stage1, Stage2

# Cholesterol categories
df['chol_category'] = pd.cut(df['chol'], bins=[0, 200, 240, 600],
                              labels=[0, 1, 2])  # Desirable, Borderline, High

# Heart rate reserve
df['hr_reserve'] = 220 - df['age'] - df['thalch']

# Composite cardiovascular risk score
df['cv_risk_score'] = (
    (df['age'] > 55).astype(int) * 2 +
    (df['trestbps'] > 140).astype(int) * 2 +
    (df['chol'] > 240).astype(int) +
    (df['fbs'] == 1).astype(int) +
    (df['exang'] == 1).astype(int) * 2 +
    (df['oldpeak'] > 2).astype(int) * 3
)

print(f"✓ Created 5 engineered features")

# ============================================================================
# 4. PREPROCESSING PIPELINE
# ============================================================================

print("\n[4/6] Preprocessing pipeline...")

# Separate features and target
X = df.drop([original_target, 'target_3class'], axis=1)
y = df['target_3class']

# Train-test split (stratified)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
)

print(f"✓ Train set: {len(X_train)} samples")
print(f"✓ Test set: {len(X_test)} samples")

# Identify categorical columns
categorical_cols = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal',
                    'age_group', 'bp_category', 'chol_category']

# Label encoding for categorical features
label_encoders = {}
for col in categorical_cols:
    if col in X_train.columns:
        le = LabelEncoder()
        X_train[col] = le.fit_transform(X_train[col].astype(str))
        X_test[col] = le.transform(X_test[col].astype(str))
        label_encoders[col] = le

print(f"✓ Encoded {len(label_encoders)} categorical features")

# KNN Imputation for missing values
imputer = KNNImputer(n_neighbors=5)
X_train_imputed = pd.DataFrame(
    imputer.fit_transform(X_train),
    columns=X_train.columns,
    index=X_train.index
)
X_test_imputed = pd.DataFrame(
    imputer.transform(X_test),
    columns=X_test.columns,
    index=X_test.index
)

print(f"✓ Imputed missing values")

# Standardization
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_imputed)
X_test_scaled = scaler.transform(X_test_imputed)

print(f"✓ Scaled features")

# BorderlineSMOTE for class balance
print("\nClass distribution before SMOTE:")
print(y_train.value_counts().sort_index())

smote = BorderlineSMOTE(random_state=RANDOM_STATE, k_neighbors=3, kind='borderline-1')
X_train_smote, y_train_smote = smote.fit_resample(X_train_scaled, y_train)

print("\nClass distribution after SMOTE:")
print(pd.Series(y_train_smote).value_counts().sort_index())

# ============================================================================
# 5. TRAIN 3-CLASS MODELS
# ============================================================================

print("\n[5/6] Training models...")

models = {}
results = []

# Model 1: XGBoost Baseline
print("\n--- XGBoost Baseline ---")
xgb_baseline = XGBClassifier(
    n_estimators=300,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    min_child_weight=3,
    random_state=RANDOM_STATE,
    eval_metric='mlogloss'
)

xgb_baseline.fit(X_train_smote, y_train_smote)
y_pred_baseline = xgb_baseline.predict(X_test_scaled)

f1_baseline = f1_score(y_test, y_pred_baseline, average='weighted')
acc_baseline = accuracy_score(y_test, y_pred_baseline)

print(f"Test F1-Score: {f1_baseline:.4f}")
print(f"Test Accuracy: {acc_baseline:.4f}")

models['xgb_baseline'] = xgb_baseline
results.append({
    'Model': 'XGBoost Baseline',
    'Test F1': f1_baseline,
    'Test Accuracy': acc_baseline
})

# Model 2: XGBoost with Ordinal Weights
print("\n--- XGBoost Ordinal Weights ---")

# Create ordinal sample weights for 3 classes
# Class 0: weight 1.0 (no disease)
# Class 1: weight 1.5 (mild-moderate)
# Class 2: weight 2.0 (severe-critical)
sample_weights = np.array([1.0 + 0.5 * y for y in y_train_smote])

xgb_ordinal = XGBClassifier(
    n_estimators=300,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    min_child_weight=3,
    random_state=RANDOM_STATE,
    eval_metric='mlogloss'
)

xgb_ordinal.fit(X_train_smote, y_train_smote, sample_weight=sample_weights)
y_pred_ordinal = xgb_ordinal.predict(X_test_scaled)

f1_ordinal = f1_score(y_test, y_pred_ordinal, average='weighted')
acc_ordinal = accuracy_score(y_test, y_pred_ordinal)

print(f"Test F1-Score: {f1_ordinal:.4f}")
print(f"Test Accuracy: {acc_ordinal:.4f}")

models['xgb_ordinal'] = xgb_ordinal
results.append({
    'Model': 'XGBoost Ordinal Weights',
    'Test F1': f1_ordinal,
    'Test Accuracy': acc_ordinal
})

# ============================================================================
# 6. DETAILED EVALUATION
# ============================================================================

print("\n[6/6] Detailed evaluation...")

# Select best model
best_model_name = 'xgb_ordinal' if f1_ordinal > f1_baseline else 'xgb_baseline'
best_model = models[best_model_name]
y_pred_best = xgb_ordinal.predict(X_test_scaled) if f1_ordinal > f1_baseline else y_pred_baseline

print(f"\n{'='*70}")
print(f"BEST MODEL: {best_model_name.upper()}")
print(f"{'='*70}")

# Classification report
print("\nClassification Report:")
class_names = ['No Disease', 'Mild-Moderate', 'Severe-Critical']
print(classification_report(y_test, y_pred_best, target_names=class_names, digits=4))

# Confusion matrix
print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred_best)
print("\n            Predicted")
print("              0     1     2")
print(f"Actual  0  {cm[0][0]:4d}  {cm[0][1]:4d}  {cm[0][2]:4d}")
print(f"        1  {cm[1][0]:4d}  {cm[1][1]:4d}  {cm[1][2]:4d}")
print(f"        2  {cm[2][0]:4d}  {cm[2][1]:4d}  {cm[2][2]:4d}")

# Per-class metrics
print("\nPer-class F1-scores:")
f1_per_class = f1_score(y_test, y_pred_best, average=None)
for i, (class_name, f1) in enumerate(zip(class_names, f1_per_class)):
    print(f"  {class_name:20s}: {f1:.4f}")

# Comparison with 5-class
print("\n" + "="*70)
print("COMPARISON: 5-CLASS vs 3-CLASS")
print("="*70)
print(f"5-class F1-score: 0.5863")
print(f"3-class F1-score: {f1_score(y_test, y_pred_best, average='weighted'):.4f}")
improvement = (f1_score(y_test, y_pred_best, average='weighted') - 0.5863) / 0.5863 * 100
print(f"Improvement: {improvement:+.2f}%")

if f1_score(y_test, y_pred_best, average='weighted') >= 0.75:
    print("\n✅ TARGET ACHIEVED: F1 ≥ 0.75")
else:
    gap = 0.75 - f1_score(y_test, y_pred_best, average='weighted')
    print(f"\n⚠️  Gap to target (0.75): -{gap:.4f}")

# ============================================================================
# 7. SAVE MODELS AND ARTIFACTS
# ============================================================================

print("\n" + "="*70)
print("SAVING MODELS AND ARTIFACTS")
print("="*70)

models_dir = Path("../models")
models_dir.mkdir(exist_ok=True)

# Save best 3-class model
model_path = models_dir / "best_3class_model.pkl"
with open(model_path, 'wb') as f:
    pickle.dump(best_model, f)
print(f"✓ Saved model: {model_path}")

# Save preprocessing artifacts
preprocessing_artifacts = {
    'label_encoders': label_encoders,
    'imputer': imputer,
    'scaler': scaler,
    'smote': smote,
    'feature_names': list(X.columns)
}

artifacts_path = models_dir / "preprocessing_artifacts_3class.pkl"
with open(artifacts_path, 'wb') as f:
    pickle.dump(preprocessing_artifacts, f)
print(f"✓ Saved preprocessing artifacts: {artifacts_path}")

# Save model metadata
metadata = {
    'model_name': 'XGBoost 3-Class Severity',
    'model_type': best_model_name,
    'num_classes': 3,
    'class_names': class_names,
    'class_mapping': {
        0: 'No Disease',
        1: 'Mild-Moderate',
        2: 'Severe-Critical'
    },
    'original_to_grouped': {
        0: 0,  # No disease → No disease
        1: 1,  # Mild → Mild-Moderate
        2: 1,  # Moderate → Mild-Moderate
        3: 2,  # Severe → Severe-Critical
        4: 2   # Very Severe → Severe-Critical
    },
    'performance': {
        'test_f1_weighted': float(f1_score(y_test, y_pred_best, average='weighted')),
        'test_f1_macro': float(f1_score(y_test, y_pred_best, average='macro')),
        'test_accuracy': float(accuracy_score(y_test, y_pred_best)),
        'test_precision': float(precision_score(y_test, y_pred_best, average='weighted')),
        'test_recall': float(recall_score(y_test, y_pred_best, average='weighted')),
        'f1_per_class': [float(x) for x in f1_per_class]
    },
    'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
    'random_state': RANDOM_STATE
}

metadata_path = models_dir / "model_metadata_3class.pkl"
with open(metadata_path, 'wb') as f:
    pickle.dump(metadata, f)
print(f"✓ Saved metadata: {metadata_path}")

# Save results to CSV
results_df = pd.DataFrame(results)
results_path = Path("../results/three_class_grouping_results.csv")
results_path.parent.mkdir(exist_ok=True)
results_df.to_csv(results_path, index=False)
print(f"✓ Saved results: {results_path}")

print("\n" + "="*70)
print("EXPERIMENT COMPLETE")
print("="*70)
print(f"\nBest 3-Class Model: {best_model_name}")
print(f"F1-Score: {f1_score(y_test, y_pred_best, average='weighted'):.4f}")
print(f"Accuracy: {accuracy_score(y_test, y_pred_best):.4f}")
print("\nNext Steps:")
print("1. Update Flask API to use best_3class_model.pkl")
print("2. Update frontend to display 3 severity levels")
print("3. Update documentation with new grouping strategy")
print("="*70)
