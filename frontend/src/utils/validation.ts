import { z } from 'zod';

// Demographics validation schema
export const demographicsSchema = z.object({
  age: z.number().min(1).max(120),
  sex: z.number().min(0).max(1),
  smoking_status: z.string().optional(),
  diabetes: z.boolean().optional(),
  family_history: z.boolean().optional(),
});

// Symptoms validation schema
export const symptomsSchema = z.object({
  chest_pain_type: z.number().min(0).max(3),
  exercise_angina: z.number().min(0).max(1),
  exercise_frequency: z.string().optional(),
});

// Vitals validation schema
export const vitalsSchema = z.object({
  resting_bp: z.number().min(50).max(250),
  cholesterol: z.number().min(50).max(600),
  fasting_bs: z.number().min(0).max(1),
  max_heart_rate: z.number().min(60).max(220),
});

// Diagnostic validation schema
export const diagnosticSchema = z.object({
  resting_ecg: z.number().min(0).max(2),
  oldpeak: z.number().min(0).max(10),
  st_slope: z.number().min(0).max(2),
  num_major_vessels: z.number().min(0).max(3),
  thalassemia: z.number().min(1).max(3),
});

// Validation helper functions
export const validateAge = (age: number): boolean => {
  return age >= 1 && age <= 120;
};

export const validateBloodPressure = (bp: number): boolean => {
  return bp >= 50 && bp <= 250;
};

export const validateCholesterol = (cholesterol: number): boolean => {
  return cholesterol >= 50 && cholesterol <= 600;
};

export const validateHeartRate = (hr: number): boolean => {
  return hr >= 60 && hr <= 220;
};

// Format display text
export const formatChestPainType = (type: number): string => {
  const types = [
    'Typical angina',
    'Atypical angina',
    'Non-anginal pain',
    'Asymptomatic'
  ];
  return types[type] || 'Unknown';
};

export const formatECGResult = (result: number): string => {
  const results = [
    'Normal',
    'ST-T wave abnormality',
    'Left ventricular hypertrophy'
  ];
  return results[result] || 'Unknown';
};

export const formatSTSlope = (slope: number): string => {
  const slopes = ['Upsloping', 'Flat', 'Downsloping'];
  return slopes[slope] || 'Unknown';
};

export const formatThalassemia = (thal: number): string => {
  const types = ['', 'Normal', 'Fixed defect', 'Reversible defect'];
  return types[thal] || 'Unknown';
};

// Risk level utilities
export const getRiskLevelColor = (level: string): string => {
  const colors: { [key: string]: string } = {
    'low': 'green',
    'moderate': 'orange',
    'high': 'red',
    'critical': 'darkred',
  };
  return colors[level.toLowerCase()] || 'gray';
};

export const getRiskLevelBgColor = (level: string): string => {
  const colors: { [key: string]: string } = {
    'low': 'bg-green-100 border-green-500 text-green-800',
    'moderate': 'bg-orange-100 border-orange-500 text-orange-800',
    'high': 'bg-red-100 border-red-500 text-red-800',
    'critical': 'bg-red-200 border-red-700 text-red-900',
  };
  return colors[level.toLowerCase()] || 'bg-gray-100 border-gray-500 text-gray-800';
};

// Format numbers for display
export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals);
};

export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${(num * 100).toFixed(decimals)}%`;
};

// Session ID generator
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `session_${timestamp}_${random}`;
};

// Local storage helpers
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to get from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};