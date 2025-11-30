# Frontend - Heart Disease Risk Assessment

**React + TypeScript + Vite Application**

This is the frontend application for the Heart Disease Risk Assessment System. It provides a user-friendly interface for patients to complete health assessments and view their risk predictions.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20.x)
- npm or yarn

### Installation

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Start development server
npm run dev
```

The application will be available at **http://localhost:3000** (or 5173 depending on your Vite configuration).

---

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.6.2 | Type safety |
| **Vite** | 7.2.2 | Build tool & dev server |
| **TailwindCSS** | 3.4.18 | Styling |
| **React Hook Form** | 7.66.0 | Form handling & validation |
| **Axios** | 1.13.2 | API client |
| **Recharts** | 3.4.1 | Data visualization |
| **React Router** | 7.1.3 | Navigation |
| **Lucide React** | 0.468.0 | Icons |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx                    # Landing page
│   │   └── SimpleAssessment.tsx        # ⭐ Main assessment form
│   │
│   ├── components/
│   │   ├── Header.tsx                  # Navigation header
│   │   ├── Footer.tsx                  # Footer component
│   │   ├── TermsModal.tsx              # Terms & conditions modal
│   │   └── ResultsDisplay.tsx          # Risk results visualization
│   │
│   ├── services/
│   │   └── api.ts                      # API client (Axios)
│   │
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   │
│   ├── App.tsx                         # Main app component
│   ├── main.tsx                        # Entry point
│   └── index.css                       # Global styles (Tailwind)
│
├── public/                             # Static assets
├── package.json                        # Dependencies
├── vite.config.ts                      # Vite configuration
├── tsconfig.json                       # TypeScript configuration
├── tailwind.config.js                  # TailwindCSS configuration
└── .env                                # Environment variables
```

---

## 🎨 Key Features

### 1. Landing Page (`Home.tsx`)

- Clean, professional hero section
- Feature highlights (Accurate AI Predictions, Instant Results, Confidential)
- "Start Your Assessment" CTA button
- Medical disclaimer and educational notice

### 2. Assessment Form (`SimpleAssessment.tsx`)

**Single-page form with 4 sections**:

1. **Demographics** (age, sex)
2. **Symptoms** (chest pain type, exercise-induced angina)
3. **Vitals** (blood pressure, cholesterol, heart rate, etc.)
4. **Diagnostics** (resting ECG, ST depression, slope, vessels, thalassemia)

**Features**:
- Real-time validation with React Hook Form
- Required field indicators
- Type-safe form data with TypeScript
- Terms & conditions acceptance
- Loading states during API calls
- Error handling with user-friendly messages

### 3. Results Display (`ResultsDisplay.tsx`)

- **Color-coded severity levels**:
  - Class 0 (No Disease): Green
  - Class 1 (Mild-Moderate): Orange
  - Class 2 (Severe-Critical): Red

- **Probability chart** using Recharts (bar chart)
- **Confidence score** with percentage
- **Personalized action items** based on severity
- **Medical disclaimer** emphasizing professional consultation

---

## 🔌 API Integration

### Service Layer (`services/api.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictHeartDisease = async (formData: FormData) => {
  const response = await api.post('/api/predict', formData);
  return response.data;
};

export const getModelInfo = async () => {
  const response = await api.get('/api/info');
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};
```

### Request Format

```typescript
interface AssessmentFormData {
  age: number;
  sex: 'male' | 'female';
  cp: 'typical angina' | 'atypical angina' | 'non-anginal pain' | 'asymptomatic';
  trestbps: number;
  chol: number;
  fbs: boolean;
  restecg: 'normal' | 'ST-T abnormality' | 'left ventricular hypertrophy';
  thalch: number;
  exang: boolean;
  oldpeak: number;
  slope: 'upsloping' | 'flat' | 'downsloping';
  ca: '0' | '1' | '2' | '3';
  thal: 'normal' | 'fixed defect' | 'reversible defect';
}
```

### Response Format

```typescript
interface PredictionResponse {
  success: boolean;
  data: {
    prediction: number;              // 0-2 (3 classes)
    confidence: number;               // 0.0-1.0
    probabilities: {
      '0': number;
      '1': number;
      '2': number;
    };
    risk_category: string;            // "No Disease", "Mild-Moderate", "Severe-Critical"
    risk_color: string;               // hex color code
    action_items: string[];
  };
}
```

---

## 🎨 Styling

### TailwindCSS Configuration

Custom colors defined in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',      // Blue
        secondary: '#64748b',    // Gray
        success: '#10b981',      // Green
        warning: '#f59e0b',      // Yellow
        danger: '#ef4444',       // Red
      },
    },
  },
};
```

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- All components fully responsive

---

## 🧪 Development

### Available Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check without building
npm run type-check

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

For production:

```env
VITE_API_URL=https://your-production-api.com
```

---

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory:
- Minified JavaScript/CSS
- Tree-shaking for smaller bundle size
- Asset optimization

### Deployment Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option 3: Static Hosting

Upload the `dist/` folder to any static hosting service (AWS S3, GitHub Pages, etc.).

---

## 🔧 Configuration Files

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🧩 Component Details

### SimpleAssessment.tsx (Main Form)

**State Management**:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<AssessmentFormData>();
const [results, setResults] = useState<PredictionResponse | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [termsAccepted, setTermsAccepted] = useState(false);
```

**Form Submission**:
```typescript
const onSubmit = async (data: AssessmentFormData) => {
  if (!termsAccepted) {
    setError('Please accept the terms and conditions');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await predictHeartDisease(data);
    setResults(response);
  } catch (err) {
    setError('Failed to get prediction. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Validation Rules**:
- Age: Required, min 20, max 100
- Blood Pressure: Required, min 80, max 200
- Cholesterol: Required, min 100, max 600
- Max Heart Rate: Required, min 60, max 220
- ST Depression: Required, min 0, max 10

---

## 🎯 User Flow

1. **Landing Page** → User clicks "Start Your Assessment"
2. **Assessment Form** → User fills out 13 clinical fields
3. **Terms & Conditions** → User accepts terms
4. **Submit** → Loading indicator while API processes
5. **Results Page** → Display prediction with:
   - Risk level (color-coded)
   - Confidence score
   - Probability distribution chart
   - Action items
6. **New Assessment** → User can reset and start over

---

## 🐛 Common Issues

### Issue 1: API Connection Error

**Error**: `Network Error` or `Failed to fetch`

**Solution**:
1. Ensure backend is running on port 8000
2. Check `.env` file has correct `VITE_API_URL`
3. Verify CORS is enabled in Flask backend

### Issue 2: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
server: { port: 5173 }
```

### Issue 3: Type Errors

**Error**: TypeScript compilation errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Additional Resources

### React + TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Documentation](https://react.dev/)

### TailwindCSS
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TailwindUI Components](https://tailwindui.com/)

### Vite
- [Vite Guide](https://vite.dev/guide/)
- [Vite Config Reference](https://vite.dev/config/)

### React Hook Form
- [React Hook Form Docs](https://react-hook-form.com/)
- [Validation Examples](https://react-hook-form.com/get-started#applyvalidation)

---

## 🤝 Contributing

### Code Style

- Use TypeScript for all new components
- Follow React best practices (functional components, hooks)
- Use TailwindCSS utility classes (avoid inline styles)
- Implement proper error handling
- Add PropTypes or TypeScript types for all props

### Component Guidelines

```typescript
// Good: Functional component with TypeScript
interface MyComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
  return <div>{title}</div>;
};

// Bad: Any types, no interface
export const MyComponent = ({ title, onSubmit }: any) => {
  return <div>{title}</div>;
};
```

---

## 📞 Support

For frontend-specific issues:
1. Check browser console for errors
2. Verify backend is running (`http://localhost:8000/api/health`)
3. Check `.env` file configuration
4. Review network tab in browser DevTools

For general project questions, see [main README.md](../README.md).

---

**Status**: ✅ Production-ready
**Last Updated**: November 24, 2025
**Version**: 1.0.0
