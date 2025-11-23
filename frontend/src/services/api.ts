import axios, {AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { 
  Assessment, 
  Prediction, 
  ChatSession, 
  ChatMessage, 
  ChatHistory,
  AuthTokens,
  User
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);
              
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout();
            window.location.href = '/';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTH ENDPOINTS ====================
  async register(userData: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    terms_accepted: boolean;
  }): Promise<AuthTokens> {
    const response = await this.api.post<AuthTokens>('/api/auth/register', userData);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.api.post<AuthTokens>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.api.post<AuthTokens>(
      '/api/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/api/auth/me');
    return response.data;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // ==================== ASSESSMENT ENDPOINTS ====================
  async startAssessment(sessionId: string, termsAccepted: boolean): Promise<Assessment> {
    const response = await this.api.post<Assessment>('/api/assessments/start', {
      session_id: sessionId,
      accepted: termsAccepted,
    });
    return response.data;
  }

  async getAssessment(sessionId: string): Promise<Assessment> {
    const response = await this.api.get<Assessment>(`/api/assessments/${sessionId}`);
    return response.data;
  }

  async updateAssessment(sessionId: string, data: Partial<Assessment>): Promise<Assessment> {
    const response = await this.api.put<Assessment>(`/api/assessments/${sessionId}`, data);
    return response.data;
  }

  async completeAssessment(sessionId: string, data: Partial<Assessment>): Promise<Assessment> {
    const response = await this.api.post<Assessment>(
      `/api/assessments/${sessionId}/complete`,
      data
    );
    return response.data;
  }

  async getUserAssessments(skip = 0, limit = 10): Promise<Assessment[]> {
    const response = await this.api.get<Assessment[]>('/api/assessments/user/history', {
      params: { skip, limit },
    });
    return response.data;
  }

  // ==================== PREDICTION ENDPOINTS ====================
  async createPrediction(assessmentId: number): Promise<Prediction> {
    const response = await this.api.post<Prediction>('/api/predictions/predict', {
      assessment_id: assessmentId,
    });
    return response.data;
  }

  async getPrediction(predictionId: number): Promise<Prediction> {
    const response = await this.api.get<Prediction>(`/api/predictions/${predictionId}`);
    return response.data;
  }

  async getPredictionByAssessment(assessmentId: number): Promise<Prediction> {
    const response = await this.api.get<Prediction>(
      `/api/predictions/assessment/${assessmentId}`
    );
    return response.data;
  }

  // ==================== CHAT ENDPOINTS ====================
  async createChatSession(assessmentId: number): Promise<ChatSession> {
    const response = await this.api.post<ChatSession>('/api/chat/sessions', {
      assessment_id: assessmentId,
    });
    return response.data;
  }

  async sendChatMessage(sessionToken: string, content: string): Promise<ChatMessage> {
    const response = await this.api.post<ChatMessage>(
      `/api/chat/sessions/${sessionToken}/messages`,
      { content }
    );
    return response.data;
  }

  async getChatHistory(sessionToken: string): Promise<ChatHistory> {
    const response = await this.api.get<ChatHistory>(`/api/chat/sessions/${sessionToken}`);
    return response.data;
  }

  async endChatSession(sessionToken: string): Promise<void> {
    await this.api.post(`/api/chat/sessions/${sessionToken}/end`);
  }

  // ==================== HEALTH CHECK ====================
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const api = new ApiService();
export default api;