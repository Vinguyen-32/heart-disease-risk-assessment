/**
 * Assessment page - Multi-step form for heart disease risk assessment
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import api from '../services/api';
import type { Assessment as AssessmentType } from '../types';

export default function Assessment() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionId, setSessionId] = useState('');
  const [assessment, setAssessment] = useState<AssessmentType | null>(null);
  const [loading, setLoading] = useState(false);
  const totalPages = 5;

  useEffect(() => {
    const storedSessionId = localStorage.getItem('current_session_id');
    if (!storedSessionId) {
      navigate('/');
      return;
    }
    setSessionId(storedSessionId);
    initializeAssessment(storedSessionId);
  }, []);

  const initializeAssessment = async (sid: string) => {
    try {
      const data = await api.startAssessment(sid, true);
      setAssessment(data);
    } catch (error) {
      console.error('Failed to start assessment:', error);
    }
  };

  const saveProgress = async (data: Partial<AssessmentType>) => {
    if (!sessionId) return;
    try {
      const updated = await api.updateAssessment(sessionId, {
        ...data,
        current_page: currentPage,
      });
      setAssessment(updated);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleNext = async (data: any) => {
    await saveProgress(data);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleComplete = async (data: any) => {
    setLoading(true);
    try {
      // Complete assessment
      const completed = await api.completeAssessment(sessionId, data);
      
      // Generate prediction
      await api.createPrediction(completed.id);
      
      // Navigate to results
      navigate(`/results/${sessionId}`);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to complete assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Heart Health Assessment</h1>
            </div>
            <span className="text-sm text-gray-600">
              Step {currentPage} of {totalPages}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Pages */}
        <div className="bg-white rounded-xl shadow-md p-8">
          {currentPage === 1 && (
            <DemographicsForm
              defaultValues={assessment || {}}
              onNext={handleNext}
            />
          )}
          {currentPage === 2 && (
            <SymptomsForm
              defaultValues={assessment || {}}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentPage === 3 && (
            <VitalsForm
              defaultValues={assessment || {}}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentPage === 4 && (
            <DiagnosticForm
              defaultValues={assessment || {}}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentPage === 5 && (
            <ReviewForm
              assessment={assessment}
              onBack={handleBack}
              onSubmit={handleComplete}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Page 1: Demographics
function DemographicsForm({ defaultValues, onNext }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
      
      <div>
        <label className="label">Age *</label>
        <input
          type="number"
          {...register('age', { required: true, min: 1, max: 120 })}
          className="input"
          placeholder="Enter your age"
        />
        {errors.age && <p className="text-red-500 text-sm mt-1">Age is required (1-120)</p>}
      </div>

      <div>
        <label className="label">Sex *</label>
        <select {...register('sex', { required: true })} className="input">
          <option value="">Select...</option>
          <option value="0">Female</option>
          <option value="1">Male</option>
        </select>
        {errors.sex && <p className="text-red-500 text-sm mt-1">Sex is required</p>}
      </div>

      <div>
        <label className="label">Smoking Status</label>
        <select {...register('smoking_status')} className="input">
          <option value="">Select...</option>
          <option value="never">Never smoked</option>
          <option value="former">Former smoker</option>
          <option value="current">Current smoker</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" {...register('diabetes')} className="w-5 h-5" />
        <label>Do you have diabetes?</label>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" {...register('family_history')} className="w-5 h-5" />
        <label>Family history of heart disease?</label>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary flex items-center gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

// Page 2: Symptoms
function SymptomsForm({ defaultValues, onNext, onBack }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Symptoms & Activity</h2>
      
      <div>
        <label className="label">Chest Pain Type *</label>
        <select {...register('chest_pain_type', { required: true })} className="input">
          <option value="">Select...</option>
          <option value="0">Typical angina (pressure/discomfort with exertion)</option>
          <option value="1">Atypical angina (similar but not typical pattern)</option>
          <option value="2">Non-anginal pain (not heart-related)</option>
          <option value="3">Asymptomatic (no chest pain)</option>
        </select>
        {errors.chest_pain_type && <p className="text-red-500 text-sm mt-1">Required</p>}
      </div>

      <div>
        <label className="label">Exercise Induced Angina *</label>
        <select {...register('exercise_angina', { required: true })} className="input">
          <option value="">Select...</option>
          <option value="0">No</option>
          <option value="1">Yes</option>
        </select>
        {errors.exercise_angina && <p className="text-red-500 text-sm mt-1">Required</p>}
      </div>

      <div>
        <label className="label">Exercise Frequency</label>
        <select {...register('exercise_frequency')} className="input">
          <option value="">Select...</option>
          <option value="none">None or rarely</option>
          <option value="light">1-2 times per week</option>
          <option value="moderate">3-4 times per week</option>
          <option value="regular">5+ times per week</option>
        </select>
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn btn-secondary flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button type="submit" className="btn btn-primary flex items-center gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

// Page 3: Vitals
function VitalsForm({ defaultValues, onNext, onBack }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Vital Signs</h2>
      
      <div>
        <label className="label">Resting Blood Pressure (mm Hg) *</label>
        <input
          type="number"
          {...register('resting_bp', { required: true, min: 50, max: 250 })}
          className="input"
          placeholder="e.g., 120"
        />
        {errors.resting_bp && <p className="text-red-500 text-sm mt-1">Required (50-250)</p>}
      </div>

      <div>
        <label className="label">Cholesterol (mg/dl) *</label>
        <input
          type="number"
          {...register('cholesterol', { required: true, min: 50, max: 600 })}
          className="input"
          placeholder="e.g., 200"
        />
        {errors.cholesterol && <p className="text-red-500 text-sm mt-1">Required (50-600)</p>}
      </div>

      <div>
        <label className="label">Fasting Blood Sugar &gt; 120 mg/dl? *</label>
        <select {...register('fasting_bs', { required: true })} className="input">
          <option value="">Select...</option>
          <option value="0">No (≤ 120 mg/dl)</option>
          <option value="1">Yes (&gt; 120 mg/dl)</option>
        </select>
        {errors.fasting_bs && <p className="text-red-500 text-sm mt-1">Required</p>}
      </div>

      <div>
        <label className="label">Maximum Heart Rate Achieved *</label>
        <input
          type="number"
          {...register('max_heart_rate', { required: true, min: 60, max: 220 })}
          className="input"
          placeholder="e.g., 150"
        />
        {errors.max_heart_rate && <p className="text-red-500 text-sm mt-1">Required (60-220)</p>}
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn btn-secondary flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button type="submit" className="btn btn-primary flex items-center gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

// Page 4: Diagnostic Tests
function DiagnosticForm({ defaultValues, onNext, onBack }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Diagnostic Test Results</h2>
      
      <div>
        <label className="label">Resting ECG Result *</label>
        <select {...register('resting_ecg', { required: true })} className="input">
          <option value="">Select...</option>
          <option value="0">Normal</option>
          <option value="1">ST-T wave abnormality</option>
          <option value="2">Left ventricular hypertrophy</option>
        </select>
        {errors.resting_ecg && <p className="text-red-500 text-sm mt-1">Required</p>}
      </div>

      <div>
        <label className="label">ST Depression (Oldpeak) *</label>
        <input
          type="number"
          step="0.1"
          {...register('oldpeak', { required: true, min: 0, max: 10 })}
          className="input"
          placeholder="e.g., 1.5"
        />
        <p className="text-sm text-gray-600 mt-1">Depression induced by exercise relative to rest</p>
        {errors.oldpeak && <p className="text-red-500 text-sm mt-1">Required (0-10)</p>}
      </div>

      <div>
        <label className="label">ST Slope *</label>
        <select {...register('st_slope', { required: true })} className="input">
          <option value="">Select...</option>
          <option value="0">Upsloping</option>
          <option value="1">Flat</option>
          <option value="2">Downsloping</option>
        </select>
        {errors.st_slope && <p className="text-red-500 text-sm mt-1">Required</p>}
      </div>

      <div>
        <label className="label">Number of Major Vessels (0-3) *</label>
        <input
          type="number"
          {...register('num_major_vessels', { required: true, min: 0, max: 3 })}
          className="input"
          placeholder="0, 1, 2, or 3"
        />
        <p className="text-sm text-gray-600 mt-1">Colored by fluoroscopy</p>
        {errors.num_major_vessels && <p className="text-red-500 text-sm mt-1">Required (0-3)</p>}
      </div>

      <div>
        <label className="label">Thalassemia *</label>
        <select {...register('thalassemia', { required: true })} className="input">
          <option value="">Select...</option>
          <option value="1">Normal</option>
          <option value="2">Fixed defect</option>
          <option value="3">Reversible defect</option>
        </select>
        {errors.thalassemia && <p className="text-red-500 text-sm mt-1">Required</p>}
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="btn btn-secondary flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button type="submit" className="btn btn-primary flex items-center gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

// Page 5: Review & Submit
function ReviewForm({ assessment, onBack, onSubmit, loading }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Review Your Information</h2>
      <p className="text-gray-600 mb-6">Please review your information before submitting.</p>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <p><strong>Age:</strong> {assessment?.age}</p>
        <p><strong>Sex:</strong> {assessment?.sex === 1 ? 'Male' : 'Female'}</p>
        <p><strong>Blood Pressure:</strong> {assessment?.resting_bp} mm Hg</p>
        <p><strong>Cholesterol:</strong> {assessment?.cholesterol} mg/dl</p>
        <p><strong>Max Heart Rate:</strong> {assessment?.max_heart_rate} bpm</p>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} disabled={loading} className="btn btn-secondary flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={() => onSubmit(assessment)} disabled={loading} className="btn btn-primary">
          {loading ? 'Processing...' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  );
}