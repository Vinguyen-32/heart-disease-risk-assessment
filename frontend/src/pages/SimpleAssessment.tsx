/**
 * SimpleAssessment - Single-page form that works with the current /api/predict endpoint
 * This is a streamlined version that directly calls the backend without database/auth
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Heart, AlertCircle, Loader, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface FormData {
  // Required fields
  age: number;
  sex: string;
  cp: string;
  exang: string;

  // Optional fields
  trestbps?: number;
  chol?: number;
  fbs?: string;
  thalch?: number;
  restecg?: string;
  oldpeak?: number;
  slope?: string;
  ca?: string;
  thal?: string;
}

interface PredictionResponse {
  success: boolean;
  data: {
    prediction: number;  // 0-2 (3 classes)
    confidence: number;
    probabilities: {
      '0': number;
      '1': number;
      '2': number;
    };
    risk_category: string;  // "No Disease", "Mild-Moderate", "Severe-Critical"
    risk_color: string;     // Color hex code
    action_items: string[];
  };
}

export default function SimpleAssessment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const age = watch('age', 50);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      // Transform form data to match backend API expectations
      // Only include fields that have values (non-empty)
      const payload: any = {
        age: Number(data.age),
        sex: data.sex,
        cp: data.cp,
        exang: data.exang === 'true',
      };

      // Add optional fields only if provided
      if (data.trestbps) payload.trestbps = Number(data.trestbps);
      if (data.chol) payload.chol = Number(data.chol);
      if (data.fbs !== undefined && data.fbs !== '') payload.fbs = data.fbs === 'true';
      if (data.thalch) payload.thalch = Number(data.thalch);
      if (data.restecg) payload.restecg = data.restecg;
      if (data.oldpeak !== undefined && data.oldpeak !== null) payload.oldpeak = Number(data.oldpeak);
      if (data.slope) payload.slope = data.slope;
      if (data.ca !== undefined && data.ca !== '') payload.ca = Number(data.ca);
      if (data.thal) payload.thal = data.thal;

      const response = await axios.post<PredictionResponse>(
        `${API_BASE_URL}/api/predict`,
        payload
      );

      setPrediction(response.data);

      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      console.error('Prediction error:', err);
      setError(
        err.response?.data?.error ||
        'Failed to get prediction. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Heart Disease Risk Assessment</h1>
              <p className="text-gray-600">Complete the form below to get your risk assessment</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only 4 fields are required. Optional fields can be skipped - defaults will be used.
              This is a screening tool only and not a medical diagnosis. Always consult with qualified healthcare professionals.
            </p>
          </div>
        </div>

        {/* Assessment Form */}
        {!prediction && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md p-8 mb-6">
          {/* Demographics Section - REQUIRED */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              About You
            </h2>
            <p className="text-gray-600 text-sm mb-4">Basic information (all fields required)</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your age? * <span className="text-gray-500 text-xs">(18-120 years)</span>
                </label>
                <input
                  type="number"
                  {...register('age', { required: true, min: 18, max: 120 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 30"
                />
                <p className="text-xs text-gray-500 mt-1">Please enter your current age in years</p>
                {errors.age && <p className="text-red-500 text-sm mt-1">Age is required (18-120 years)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your biological sex? *
                </label>
                <select
                  {...register('sex', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Select your biological sex as recorded in medical records</p>
                {errors.sex && <p className="text-red-500 text-sm mt-1">Sex is required</p>}
              </div>
            </div>
          </div>

          {/* Symptoms Section - REQUIRED */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Symptoms
            </h2>
            <p className="text-gray-600 text-sm mb-4">Information about any chest pain or discomfort (all fields required)</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of chest discomfort do you experience, if any? *
                </label>
                <select
                  {...register('cp', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="typical angina">Typical angina - Pressure/squeezing during activity, relieved by rest</option>
                  <option value="atypical angina">Atypical angina - Chest discomfort that doesn't follow a clear pattern</option>
                  <option value="non-anginal">Non-anginal pain - Sharp or stabbing, not related to exertion</option>
                  <option value="asymptomatic">Asymptomatic - No chest pain or discomfort</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Describe any chest discomfort you've experienced</p>
                {errors.cp && <p className="text-red-500 text-sm mt-1">Please select a chest pain type</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you experience chest pain during exercise or physical activity? *
                </label>
                <select
                  {...register('exang', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Does physical activity or exercise trigger chest pain or discomfort?</p>
                {errors.exang && <p className="text-red-500 text-sm mt-1">This field is required</p>}
              </div>
            </div>
          </div>

          {/* Vitals Section - OPTIONAL */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Basic Health Metrics
            </h2>
            <p className="text-gray-600 text-sm mb-4">Optional - Skip if you don't know these values. Defaults will be used.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your resting blood pressure? <span className="text-gray-500 text-xs">(Systolic/Top Number, mm Hg)</span>
                </label>
                <input
                  type="number"
                  {...register('trestbps', { min: 70, max: 250 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 130"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The top/first number from your blood pressure reading (e.g., if your BP is 120/80, enter 120).
                  If you don't know, we'll use a median value of 130.
                </p>
                {errors.trestbps && <p className="text-red-500 text-sm mt-1">Must be between 70-250 mm Hg</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your total cholesterol level? <span className="text-gray-500 text-xs">(mg/dL)</span>
                </label>
                <input
                  type="number"
                  {...register('chol', { min: 100, max: 600 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your total cholesterol from a recent blood test in mg/dL. If you don't know, we'll use a median value of 200.
                </p>
                {errors.chol && <p className="text-red-500 text-sm mt-1">Must be between 100-600 mg/dL</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is your fasting blood sugar greater than 120 mg/dL?
                </label>
                <select
                  {...register('fbs')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">I don't know (will assume No)</option>
                  <option value="false">No</option>
                  <option value="true">Yes (or I have diabetes)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Fasting blood sugar from a blood test after not eating for 8+ hours. Normal is below 100 mg/dL.
                  If you have diabetes or prediabetes, select 'Yes'. If you don't know, we'll assume normal (No).
                </p>
              </div>
            </div>
          </div>

          {/* Heart Tests Section - OPTIONAL */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              Heart Tests
            </h2>
            <p className="text-gray-600 text-sm mb-4">Optional - Skip if you haven't had these tests. Defaults will be used.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum heart rate during exercise or stress test <span className="text-gray-500 text-xs">(bpm)</span>
                </label>
                <input
                  type="number"
                  {...register('thalch', { min: 60, max: 220 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g. ${220 - (age || 50)}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  From a stress test or exercise test. If you don't know, we'll estimate it as 220 minus your age (≈{220 - (age || 50)} for you).
                </p>
                {errors.thalch && <p className="text-red-500 text-sm mt-1">Must be between 60-220 bpm</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resting ECG/EKG results</label>
                <select
                  {...register('restecg')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">I haven't had one (will assume Normal)</option>
                  <option value="normal">Normal</option>
                  <option value="st-t abnormality">ST-T wave abnormality (minor irregularities)</option>
                  <option value="lv hypertrophy">Left ventricular hypertrophy (heart muscle thickening)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  If you've had an ECG/EKG (heart rhythm test), select your most recent result.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ST depression value from exercise test
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('oldpeak', { min: -3.0, max: 10.0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 0.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  From an exercise stress test. Negative values indicate ST elevation. If you haven't had a stress test, leave blank.
                </p>
                {errors.oldpeak && <p className="text-red-500 text-sm mt-1">Must be between -3.0 and 10.0</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ST Slope (from stress test)</label>
                <select
                  {...register('slope')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">I haven't had this test (will assume Upsloping)</option>
                  <option value="upsloping">Upsloping (generally favorable)</option>
                  <option value="flat">Flat (possibly concerning)</option>
                  <option value="downsloping">Downsloping (more concerning)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">From an exercise stress test.</p>
              </div>
            </div>
          </div>

          {/* Advanced Tests Section - OPTIONAL */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
              Advanced Tests
            </h2>
            <p className="text-gray-600 text-sm mb-4">Optional - Most users can skip this section. Only complete if you've had these specialized tests.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of major heart vessels with blockage (from angiography)
                </label>
                <select
                  {...register('ca')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">I haven't had this test (will assume 0)</option>
                  <option value="0">0 - No blockages</option>
                  <option value="1">1 vessel</option>
                  <option value="2">2 vessels</option>
                  <option value="3">3 vessels</option>
                  <option value="4">4 vessels</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  From a cardiac catheterization or angiogram. This test uses dye to visualize blood vessels.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thalassemia or blood flow test result
                </label>
                <select
                  {...register('thal')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">I haven't had this test (will assume Normal)</option>
                  <option value="normal">Normal - Normal blood flow</option>
                  <option value="fixed defect">Fixed defect - Permanent blood flow problem</option>
                  <option value="reversable defect">Reversible defect - Temporary blood flow problem</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  From a nuclear stress test or similar imaging.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Get My Risk Assessment
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </form>
        )}

        {/* Results Section */}
        {prediction && (
          <div id="results" className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Heart className="w-10 h-10 text-blue-600" />
              Your Assessment Results
            </h2>

            {/* Risk Level Card */}
            <div
              className="border-l-4 rounded-lg p-6 mb-6"
              style={{
                backgroundColor: `${prediction.data.risk_color}15`,
                borderColor: prediction.data.risk_color
              }}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ color: prediction.data.risk_color }}>
                {prediction.data.risk_category}
              </h3>
              <div className="flex gap-6 text-sm mt-4">
                <div>
                  <span className="text-gray-600">Risk Level:</span>
                  <strong className="ml-2">{['Low Risk', 'Moderate Risk', 'High Risk'][prediction.data.prediction]}</strong>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <strong className="ml-2">{(prediction.data.confidence * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* Probability Distribution */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Probability Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'No Disease', key: '0', color: '#4CAF50' },
                  { label: 'Mild-Moderate', key: '1', color: '#FF9800' },
                  { label: 'Severe-Critical', key: '2', color: '#E91E63' }
                ].map((item, index) => {
                  const probability = prediction.data.probabilities[item.key as '0' | '1' | '2'];
                  const percentage = (probability * 100);

                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-36 text-sm font-medium">{item.label}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-semibold transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color
                            }}
                          >
                            {percentage > 10 && `${percentage.toFixed(1)}%`}
                          </div>
                          {percentage <= 10 && percentage > 0 && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                              {percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Recommended Actions</h3>
              <div
                className="border-l-4 rounded-lg p-4"
                style={{ borderColor: prediction.data.risk_color }}
              >
                <ul className="space-y-2">
                  {prediction.data.action_items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setPrediction(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Take Another Assessment
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Print Results
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Important Medical Disclaimer</h3>
              <p className="text-sm text-yellow-700 mb-2">
                This heart disease risk assessment tool is for <strong>informational and educational purposes only</strong>.
                It is NOT a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Results are AI predictions and may not be 100% accurate</li>
                <li>This tool does not diagnose heart disease</li>
                <li>Always consult qualified healthcare professionals for medical advice</li>
                <li>If experiencing chest pain or serious symptoms, seek emergency care immediately (call 911)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
