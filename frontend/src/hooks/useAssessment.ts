import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Assessment } from '../types';

export function useAssessment(sessionId: string | null) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      loadAssessment(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const loadAssessment = async (sid: string) => {
    try {
      setLoading(true);
      const data = await api.getAssessment(sid);
      setAssessment(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load assessment');
      console.error('Failed to load assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAssessment = async (data: Partial<Assessment>) => {
    if (!sessionId) return;

    try {
      const updated = await api.updateAssessment(sessionId, data);
      setAssessment(updated);
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update assessment');
      throw err;
    }
  };

  const completeAssessment = async (data: Partial<Assessment>) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const completed = await api.completeAssessment(sessionId, data);
      
      // Generate prediction
      await api.createPrediction(completed.id);
      
      // Navigate to results
      navigate(`/results/${sessionId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    assessment,
    loading,
    error,
    updateAssessment,
    completeAssessment,
    reload: () => sessionId && loadAssessment(sessionId),
  };
}