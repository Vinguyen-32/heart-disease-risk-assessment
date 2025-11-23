// import { Link } from 'react-router-dom';
// import { Heart, Menu, X } from 'lucide-react';
// import { useState } from 'react';

// export default function Header() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <header className="bg-white shadow-sm sticky top-0 z-50">
//       <nav className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between">
//           {/* Logo */}
//           <Link to="/" className="flex items-center gap-2 text-blue-600">
//             <Heart className="w-8 h-8" />
//             <span className="text-xl font-bold">HeartCare AI</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center gap-6">
//             <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
//               Home
//             </Link>
//             <Link to="/assessment" className="text-gray-700 hover:text-blue-600 transition-colors">
//               Assessment
//             </Link>
//             <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">
//               About
//             </a>
//             <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
//               Contact
//             </a>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="md:hidden p-2 text-gray-700 hover:text-blue-600"
//           >
//             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>

//         {/* Mobile Navigation */}
//         {mobileMenuOpen && (
//           <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
//             <div className="flex flex-col gap-4">
//               <Link
//                 to="/"
//                 className="text-gray-700 hover:text-blue-600 transition-colors"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Home
//               </Link>
//               <Link
//                 to="/assessment"
//                 className="text-gray-700 hover:text-blue-600 transition-colors"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Assessment
//               </Link>
//               <a
//                 href="#about"
//                 className="text-gray-700 hover:text-blue-600 transition-colors"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 About
//               </a>
//               <a
//                 href="#contact"
//                 className="text-gray-700 hover:text-blue-600 transition-colors"
//                 onClick={() => setMobileMenuOpen(false)}
//               >
//                 Contact
//               </a>
//             </div>
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// }

/**
 * FILE: src/components/layout/Header.tsx
 * Updated to match Good Samaritan Hospital style
 */

import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('current_session_id', sessionId);
    navigate('/assessment');
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Top section with logo and CTA button */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <Heart className="w-10 h-10 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">HeartCare AI</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Heart Disease Risk Assessment</span>
              </div>
            </Link>

            {/* CTA Button */}
            <button
              onClick={handleStartAssessment}
              className="hidden md:flex bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Take Our Heart Health Assessment
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sticky top-0 z-50 bg-white">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 py-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/assessment" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Assessment
            </Link>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </a>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/assessment"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Assessment
                </Link>
                <a
                  href="#about"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                {/* Mobile CTA Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleStartAssessment();
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-left"
                >
                  Take Our Heart Health Assessment
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}