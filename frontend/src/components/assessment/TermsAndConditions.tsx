import React from 'react';
import { X } from 'lucide-react';

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  accepted: boolean;
  setAccepted: (accepted: boolean) => void;
}

export default function TermsAndConditions({
  isOpen,
  onClose,
  onAccept,
  accepted,
  setAccepted,
}: TermsAndConditionsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>

        <div className="prose prose-sm mb-6 text-gray-700">
          <h3 className="text-lg font-semibold mt-4 mb-2">Important Disclaimer</h3>
          <p>
            This heart disease risk assessment tool is for informational and educational 
            purposes only. It is NOT a substitute for professional medical advice, diagnosis, 
            or treatment.
          </p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Please Note:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Results are predictions based on machine learning models and may not be 100% accurate</li>
            <li>This tool does not diagnose heart disease</li>
            <li>Always consult with qualified healthcare professionals for medical advice</li>
            <li>If you experience chest pain or other serious symptoms, seek emergency care immediately</li>
            <li>Your data is used only for generating your risk assessment</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Data Privacy</h3>
          <p>
            We respect your privacy. Your health information is encrypted and stored securely. 
            We do not share your personal health data with third parties.
          </p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Consent</h3>
          <p>
            By accepting these terms, you acknowledge that you understand the limitations 
            of this tool and that it is not a replacement for medical care.
          </p>
        </div>
        
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="terms-checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="terms-checkbox" className="ml-3 text-sm text-gray-700">
            I have read and agree to the terms and conditions
          </label>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={!accepted}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}