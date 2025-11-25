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
  // Demographics
  age: number;
  sex: string;

  // Symptoms
  cp: string;
  exang: string;

  // Vitals
  trestbps: number;
  chol: number;
  fbs: string;
  thalch: number;

  // Diagnostic
  restecg: string;
  oldpeak: number;
  slope: string;
  ca: string;
  thal: string;
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
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      // Transform form data to match backend API expectations
      const payload = {
        age: Number(data.age),
        sex: data.sex,
        cp: data.cp,
        trestbps: Number(data.trestbps),
        chol: Number(data.chol),
        fbs: data.fbs === 'true',
        restecg: data.restecg,
        thalch: Number(data.thalch),
        exang: data.exang === 'true',
        oldpeak: Number(data.oldpeak),
        slope: data.slope,
        ca: data.ca,
        thal: data.thal,
      };

      const response = await axios.post<PredictionResponse>(
        `${API_BASE_URL}/api/predict`,
        payload
      );

      setPrediction(response.data);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      console.error('Prediction error:', err);
      setError(
        err.response?.data?.error?.message ||
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
              <strong>Note:</strong> This is a screening tool only and not a medical diagnosis.
              Always consult with qualified healthcare professionals for medical advice.
            </p>
          </div>
        </div>

        {/* Assessment Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md p-8 mb-6">
          {/* Demographics Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age * <span className="text-gray-500 text-xs">(1-120 years)</span>
                </label>
                <input
                  type="number"
                  {...register('age', { required: true, min: 1, max: 120 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 55"
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">Age is required (1-120)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sex *</label>
                <select
                  {...register('sex', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.sex && <p className="text-red-500 text-sm mt-1">Sex is required</p>}
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Symptoms
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chest Pain Type *</label>
                <select
                  {...register('cp', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="typical angina">Typical Angina (chest pressure with exertion)</option>
                  <option value="atypical angina">Atypical Angina (similar but irregular pattern)</option>
                  <option value="non-anginal">Non-Anginal Pain (not heart-related)</option>
                  <option value="asymptomatic">Asymptomatic (no chest pain)</option>
                </select>
                {errors.cp && <p className="text-red-500 text-sm mt-1">Chest pain type is required</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Induced Angina *
                </label>
                <select
                  {...register('exang', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="false">No (no chest pain during exercise)</option>
                  <option value="true">Yes (chest pain during exercise)</option>
                </select>
                {errors.exang && <p className="text-red-500 text-sm mt-1">This field is required</p>}
              </div>
            </div>
          </div>

          {/* Vitals Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Vital Signs
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resting Blood Pressure * <span className="text-gray-500 text-xs">(mm Hg)</span>
                </label>
                <input
                  type="number"
                  {...register('trestbps', { required: true, min: 50, max: 250 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 120"
                />
                {errors.trestbps && <p className="text-red-500 text-sm mt-1">BP required (50-250)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cholesterol * <span className="text-gray-500 text-xs">(mg/dl)</span>
                </label>
                <input
                  type="number"
                  {...register('chol', { required: true, min: 50, max: 600 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 200"
                />
                {errors.chol && <p className="text-red-500 text-sm mt-1">Cholesterol required (50-600)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasting Blood Sugar &gt; 120 mg/dl? *
                </label>
                <select
                  {...register('fbs', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="false">No (≤ 120 mg/dl)</option>
                  <option value="true">Yes (&gt; 120 mg/dl)</option>
                </select>
                {errors.fbs && <p className="text-red-500 text-sm mt-1">This field is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Heart Rate * <span className="text-gray-500 text-xs">(bpm)</span>
                </label>
                <input
                  type="number"
                  {...register('thalch', { required: true, min: 60, max: 220 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 150"
                />
                {errors.thalch && <p className="text-red-500 text-sm mt-1">Heart rate required (60-220)</p>}
              </div>
            </div>
          </div>

          {/* Diagnostic Tests Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              Diagnostic Test Results
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resting ECG *</label>
                <select
                  {...register('restecg', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="normal">Normal</option>
                  <option value="st-t abnormality">ST-T Wave Abnormality</option>
                  <option value="lv hypertrophy">Left Ventricular Hypertrophy</option>
                </select>
                {errors.restecg && <p className="text-red-500 text-sm mt-1">ECG result required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ST Depression (Oldpeak) * <span className="text-gray-500 text-xs">(0-10)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('oldpeak', { required: true, min: 0, max: 10 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1.5"
                />
                {errors.oldpeak && <p className="text-red-500 text-sm mt-1">Oldpeak required (0-10)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ST Slope *</label>
                <select
                  {...register('slope', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="upsloping">Upsloping</option>
                  <option value="flat">Flat</option>
                  <option value="downsloping">Downsloping</option>
                </select>
                {errors.slope && <p className="text-red-500 text-sm mt-1">ST Slope required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Major Vessels * <span className="text-gray-500 text-xs">(colored by fluoroscopy)</span>
                </label>
                <select
                  {...register('ca', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="0.0">0 vessels</option>
                  <option value="1.0">1 vessel</option>
                  <option value="2.0">2 vessels</option>
                  <option value="3.0">3 vessels</option>
                </select>
                {errors.ca && <p className="text-red-500 text-sm mt-1">Number of vessels required</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Thalassemia *</label>
                <select
                  {...register('thal', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="normal">Normal</option>
                  <option value="fixed defect">Fixed Defect</option>
                  <option value="reversable defect">Reversible Defect</option>
                </select>
                {errors.thal && <p className="text-red-500 text-sm mt-1">Thalassemia result required</p>}
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
