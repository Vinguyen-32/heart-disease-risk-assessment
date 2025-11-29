# User-Friendly Questionnaire Guide
## For Heart Disease Risk Assessment Web Application

This guide helps translate clinical features into user-friendly questions for the web interface.

---

## Patient Information Form

### 1. Basic Demographics

#### Age
**Question**: "What is your age?"
**Input Type**: Number input (years)
**Range**: 18-120
**Help Text**: "Please enter your current age in years"
**Required**: Yes
**Example**: 45

---

#### Sex
**Question**: "What is your biological sex?"
**Input Type**: Radio buttons or dropdown
**Options**:
- Male
- Female
**Help Text**: "Select your biological sex as recorded in medical records"
**Required**: Yes
**Default**: None

---

### 2. Symptoms & Pain

#### Chest Pain Type (cp)
**Question**: "What type of chest discomfort do you experience, if any?"
**Input Type**: Radio buttons with descriptions
**Options**:
1. **"Typical angina"** 
   - *Description*: "Classic heart-related chest pain that occurs with exertion and is relieved by rest"
   - *User-friendly*: "Pressure or squeezing in the chest during physical activity, relieved by rest"

2. **"Atypical angina"** 
   - *Description*: "Chest pain that may be heart-related but doesn't follow the classic pattern"
   - *User-friendly*: "Chest discomfort that doesn't follow a clear pattern"

3. **"Non-anginal"** 
   - *Description*: "Chest pain unlikely to be from the heart"
   - *User-friendly*: "Sharp or stabbing chest pain, not related to exertion"

4. **"Asymptomatic"** 
   - *Description*: "No chest pain or discomfort"
   - *User-friendly*: "No chest pain or discomfort"

**Help Text**: "Describe any chest discomfort you've experienced. If unsure, select 'No chest pain'"
**Required**: Yes
**Icon/Visual**: Heart icon with pain indicators

---

### 3. Vital Signs

#### Resting Blood Pressure (trestbps)
**Question**: "What is your resting blood pressure? (Systolic/Top Number)"
**Input Type**: Number input (mm Hg)
**Range**: 70-250
**Help Text**: "The top/first number from your blood pressure reading (e.g., if your BP is 120/80, enter 120). If you don't know, we'll use a median value of 130."
**Required**: No
**Default Value**: 130.0 (median blood pressure)
**Example**: 120
**Visual Aid**: Blood pressure gauge showing categories:
- < 120: Normal (green)
- 120-129: Elevated (yellow)
- 130-139: High Stage 1 (orange)
- 140+: High Stage 2 (red)

---

#### Cholesterol (chol)
**Question**: "What is your total cholesterol level?"
**Input Type**: Number input (mg/dL)
**Range**: 100-600
**Help Text**: "Your total cholesterol from a recent blood test in mg/dL. If you don't know, we'll use a median value of 200."
**Required**: No
**Default Value**: 200.0 (median cholesterol)
**Example**: 200
**Visual Aid**: Cholesterol level chart:
- < 200: Desirable (green)
- 200-239: Borderline high (yellow)
- 240+: High (red)

---

### 4. Blood Sugar

#### Fasting Blood Sugar (fbs)
**Question**: "Is your fasting blood sugar greater than 120 mg/dL?"
**Input Type**: Radio buttons
**Options**:
- Yes (TRUE)
- No (FALSE)
- I don't know
**Help Text**: "Fasting blood sugar from a blood test after not eating for 8+ hours. Normal is below 100 mg/dL. If you have diabetes or prediabetes, select 'Yes'. If you don't know, we'll assume normal (No)."
**Required**: No
**Default Value**: No (FALSE) - assumes non-diabetic

---

### 5. Heart Tests

#### Resting ECG Results (restecg)
**Question**: "What were your resting ECG/EKG results?"
**Input Type**: Radio buttons with info tooltips
**Options**:
1. **"Normal"**
   - *Description*: "No abnormalities detected"

2. **"ST-T wave abnormality"**
   - *Description*: "Minor changes in heart rhythm, may indicate strain"
   - *User-friendly*: "Minor irregularities detected"

3. **"Left ventricular hypertrophy"**
   - *Description*: "Thickening of the heart's main pumping chamber"
   - *User-friendly*: "Heart muscle thickening detected"

**Help Text**: "If you've had an ECG/EKG (heart rhythm test), select your most recent result. If you haven't had one or don't know, we'll assume 'Normal'."
**Required**: No
**Default Value**: Normal
**Info Icon**: "What's an ECG?" tooltip

---

#### Maximum Heart Rate Achieved (thalch)
**Question**: "What was your maximum heart rate during exercise or a stress test?"
**Input Type**: Number input (beats per minute)
**Range**: 60-220
**Help Text**: "From a stress test or exercise test. If you don't know, we'll estimate it as 220 minus your age."
**Required**: No
**Default Value**: 220 - age (estimated using age-based formula)
**Example**: 150
**Auto-calculate option**: "Use estimated value (220 - age)"

---

#### Exercise-Induced Angina (exang)
**Question**: "Do you experience chest pain during exercise or physical activity?"
**Input Type**: Radio buttons
**Options**:
- Yes (TRUE)
- No (FALSE)
**Help Text**: "Does physical activity or exercise trigger chest pain or discomfort?"
**Required**: Yes

---

### 6. Exercise Test Results

#### ST Depression (oldpeak)
**Question**: "ST depression value from exercise test"
**Input Type**: Number input (decimal, can be negative)
**Range**: -3.0 to 10.0
**Help Text**: "This value comes from an exercise stress test and measures changes in your heart's electrical activity. Negative values indicate ST elevation. If you haven't had a stress test or don't know, we'll use 0."
**Required**: No
**Default Value**: 0.0 (no stress test done / normal result)
**Example**: 1.0
**Note**: Negative values are valid and clinically significant (ST elevation)

---

#### ST Slope (slope)
**Question**: "Slope of peak exercise ST segment (from stress test)"
**Input Type**: Radio buttons
**Options**:
1. **"Upsloping"** - Generally favorable
2. **"Flat"** - Possibly concerning
3. **"Downsloping"** - More concerning
4. **"I haven't had this test"** - Use default

**Help Text**: "From an exercise stress test. If you haven't had this test or don't know, we'll assume 'Upsloping' (most favorable)."
**Required**: No
**Default Value**: Upsloping (most favorable/common result)
**Note**: This is a technical feature - consider simplifying to "Have you had a stress test? Yes/No"

---

### 7. Advanced Cardiac Tests

#### Number of Major Vessels (ca)
**Question**: "Number of major heart vessels with blockage (from angiography)"
**Input Type**: Dropdown or radio buttons
**Options**:
- 0 - No blockages
- 1 - One vessel
- 2 - Two vessels
- 3 - Three vessels
- 4 - Four vessels
- I haven't had this test

**Help Text**: "From a cardiac catheterization or angiogram. This test uses dye to visualize blood vessels. If you haven't had this test or don't know, we'll assume no blockages (0)."
**Required**: No
**Default Value**: 0 (no test done / no blockages)
**Note**: Very technical - many users won't have this

---

#### Thalassemia Test (thal)
**Question**: "Thalassemia or blood flow test result"
**Input Type**: Radio buttons
**Options**:
1. **"Normal"** - Normal blood flow
2. **"Fixed defect"** - Permanent blood flow problem
3. **"Reversible defect"** - Temporary blood flow problem
4. **"I haven't had this test"** - Use default

**Help Text**: "From a nuclear stress test or similar imaging. If you haven't had this test or don't know, we'll assume 'Normal'."
**Required**: No
**Default Value**: Normal (no test done / normal result)
**Note**: Very technical - many users won't have this

---

## Form Design Recommendations

### Progressive Disclosure
Organize into sections that users complete step-by-step:

**Section 1: About You** (required)
- Age, Sex

**Section 2: Symptoms** (required)
- Chest pain type
- Exercise-induced chest pain

**Section 3: Basic Health Metrics** (optional - can skip if unknown)
- Blood pressure (default: 130)
- Cholesterol (default: 200)
- Blood sugar (default: No/FALSE)

**Section 4: Test Results** (optional - can skip if not tested)
- Heart rate (default: 220 - age)
- ECG results (default: normal)
- Exercise test results (default: 0.0 oldpeak)

**Section 5: Advanced Tests** (optional - most users can skip)
- ST slope (default: upsloping)
- Major vessels (default: 0)
- Thalassemia (default: normal)

**Note**: Only Sections 1 and 2 are required. Sections 3-5 can be skipped entirely if the user doesn't have medical test results.

### Visual Design
- **Color coding**: Use green/yellow/orange/red for risk levels
- **Progress indicator**: Show completion percentage
- **Help icons**: ? tooltip on every question
- **Examples**: Show sample values
- **Units**: Always display units (mg/dL, mm Hg, bpm)

### User Experience
- **Auto-save**: Save progress as user fills out form
- **Skip options**: Prominent "I don't know" or "Skip" buttons for optional fields
- **Default indicators**: Show what default value will be used if field is skipped
- **Validation**: Real-time feedback on valid ranges (only for provided values)
- **Mobile-friendly**: Large tap targets, single-column layout
- **Accessibility**: Screen reader compatible, keyboard navigation
- **Quick assessment**: Allow users to complete assessment with just 4 required fields

### Sample UI Flow
```
┌─────────────────────────────────────┐
│  Heart Disease Risk Assessment      │
│  Step 1 of 5: Basic Information    │
│  ●●●○○                              │
└─────────────────────────────────────┘

  Age: [45]  years

  Sex: ○ Male  ● Female

       [Continue →]

┌─────────────────────────────────────┐
│  Step 2 of 5: Symptoms             │
│  ●●●●○                              │
└─────────────────────────────────────┘

  Do you experience chest pain?
  
  ○ Pressure/squeezing during activity
  ○ Irregular chest discomfort  
  ○ Sharp/stabbing pain
  ● No chest pain
  
       [← Back]  [Continue →]
```

---

## Accessibility Considerations

1. **Screen readers**: Proper ARIA labels on all inputs
2. **Keyboard navigation**: Tab order follows logical flow
3. **Color blindness**: Don't rely solely on color (use icons + text)
4. **Language**: Provide translations for common languages
5. **Reading level**: Use 6th-8th grade reading level
6. **Error messages**: Clear, actionable error text

---

## Mobile-Specific Considerations

1. **Touch targets**: Minimum 44x44 pixels
2. **Input types**: Use `type="number"` for numeric fields
3. **Dropdowns**: Native mobile dropdowns work better than custom
4. **Layout**: Single column, vertical scrolling
5. **Keyboard**: Numeric keyboard for number inputs
6. **Autocomplete**: Disable where not applicable
