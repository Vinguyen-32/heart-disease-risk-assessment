export interface User {
    id: number;
    email: string;
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    is_active: boolean;
    created_at: string;
    terms_accepted: boolean;
  }
  
  export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
  }
  
  export interface Assessment {
    id: number;
    user_id?: number;
    session_id: string;
    status: 'in_progress' | 'completed' | 'abandoned';
    started_at: string;
    completed_at?: string;
    current_page: number;
    total_pages: number;
    
    // Clinical data
    age?: number;
    sex?: number; // 0: female, 1: male
    chest_pain_type?: number;
    resting_bp?: number;
    cholesterol?: number;
    fasting_bs?: number;
    resting_ecg?: number;
    max_heart_rate?: number;
    exercise_angina?: number;
    oldpeak?: number;
    st_slope?: number;
    num_major_vessels?: number;
    thalassemia?: number;
    
    // Additional fields
    smoking_status?: string;
    exercise_frequency?: string;
    family_history?: boolean;
    diabetes?: boolean;
  }
  
  export interface Prediction {
    id: number;
    assessment_id: number;
    predicted_class: number;
    confidence_score: number;
    probabilities: {[key: number]: number};
    risk_level: string;
    risk_score: number;
    risk_description: string;
    risk_color: string;
    model_name: string;
    model_version: string;
    feature_importance: {[key: string]: number};
    created_at: string;
    recommendations?: Recommendation[];
  }
  
  export interface Recommendation {
    id: number;
    category: string;
    priority: string;
    title: string;
    description: string;
    action_items: string[];
  }
  
  export interface ChatSession {
    id: number;
    session_token: string;
    assessment_id: number;
    is_active: boolean;
    started_at: string;
    total_messages: number;
  }
  
  export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    references_prediction: boolean;
    references_assessment_data: boolean;
  }
  
  export interface ChatHistory {
    session: ChatSession;
    messages: ChatMessage[];
  }
  
  // Form data types for each assessment page
  export interface DemographicsFormData {
    age: number;
    sex: number;
    smoking_status?: string;
    family_history?: boolean;
    diabetes?: boolean;
  }
  
  export interface SymptomsFormData {
    chest_pain_type: number;
    exercise_angina: number;
    exercise_frequency?: string;
  }
  
  export interface VitalsFormData {
    resting_bp: number;
    cholesterol: number;
    fasting_bs: number;
    max_heart_rate: number;
  }
  
  export interface DiagnosticFormData {
    resting_ecg: number;
    oldpeak: number;
    st_slope: number;
    num_major_vessels: number;
    thalassemia: number;
  }
  
  // API Response types
  export interface ApiError {
    detail: string;
    error_code?: string;
  }
  
  export interface MessageResponse {
    message: string;
    success: boolean;
  }