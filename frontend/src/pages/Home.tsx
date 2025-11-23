import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Shield, MessageCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleStartAssessment = () => {
    if (termsAccepted) {
      // Generate session ID and navigate to assessment
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('current_session_id', sessionId);
      navigate('/assessment');
    } else {
      setShowTerms(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">
              Heart Disease Risk Assessment
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Take control of your heart health with our AI-powered risk assessment tool. 
              Get personalized insights and recommendations in minutes.
            </p>
            <button
              onClick={handleStartAssessment}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Your Assessment
            </button>
            <p className="text-sm mt-4 text-blue-100">
              Takes approximately 5-10 minutes to complete
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Activity className="w-10 h-10 text-blue-600" />}
              title="Answer Questions"
              description="Provide basic health information including age, blood pressure, cholesterol levels, and symptoms."
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10 text-blue-600" />}
              title="AI Analysis"
              description="Our machine learning models analyze your data to predict heart disease risk on a scale from 0-4."
            />
            <FeatureCard
              icon={<MessageCircle className="w-10 h-10 text-blue-600" />}
              title="Get Guidance"
              description="Receive personalized recommendations and chat with our AI assistant about your results."
            />
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Understanding Your Risk
            </h2>
            <div className="space-y-4">
              <RiskLevelCard
                level="0 - No Disease"
                color="bg-green-100 border-green-500"
                textColor="text-green-800"
                description="No significant heart disease detected. Less than 50% artery blockage."
              />
              <RiskLevelCard
                level="1 - Mild"
                color="bg-yellow-100 border-yellow-500"
                textColor="text-yellow-800"
                description="Mild heart disease. Lifestyle changes recommended."
              />
              <RiskLevelCard
                level="2 - Moderate"
                color="bg-orange-100 border-orange-500"
                textColor="text-orange-800"
                description="Moderate heart disease. Medical consultation advised."
              />
              <RiskLevelCard
                level="3 - Severe"
                color="bg-red-100 border-red-500"
                textColor="text-red-800"
                description="Severe heart disease. Urgent medical attention needed."
              />
              <RiskLevelCard
                level="4 - Critical"
                color="bg-red-200 border-red-700"
                textColor="text-red-900"
                description="Critical condition. Immediate medical intervention required."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
            <div className="prose prose-sm mb-6">
              <h3>Important Disclaimer</h3>
              <p>
                This heart disease risk assessment tool is for informational and educational 
                purposes only. It is NOT a substitute for professional medical advice, diagnosis, 
                or treatment.
              </p>
              
              <h3>Please Note:</h3>
              <ul>
                <li>Results are predictions based on machine learning models and may not be 100% accurate</li>
                <li>This tool does not diagnose heart disease</li>
                <li>Always consult with qualified healthcare professionals for medical advice</li>
                <li>If you experience chest pain or other serious symptoms, seek emergency care immediately</li>
                <li>Your data is used only for generating your risk assessment</li>
              </ul>
              
              <h3>Data Privacy</h3>
              <p>
                We respect your privacy. Your health information is encrypted and stored securely. 
                We do not share your personal health data with third parties.
              </p>
              
              <h3>Consent</h3>
              <p>
                By accepting these terms, you acknowledge that you understand the limitations 
                of this tool and that it is not a replacement for medical care.
              </p>
            </div>
            
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms-checkbox" className="ml-3 text-sm text-gray-700">
                I have read and agree to the terms and conditions
              </label>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowTerms(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (termsAccepted) {
                    setShowTerms(false);
                    handleStartAssessment();
                  }
                }}
                disabled={!termsAccepted}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function RiskLevelCard({ level, color, textColor, description }: { level: string; color: string; textColor: string; description: string }) {
  return (
    <div className={`${color} border-l-4 rounded-lg p-4`}>
      <h4 className={`font-bold mb-1 ${textColor}`}>{level}</h4>
      <p className={`text-sm ${textColor}`}>{description}</p>
    </div>
  );
}