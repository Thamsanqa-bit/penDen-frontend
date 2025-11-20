import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";

// Fixed API base URL configuration
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://penden-backend.onrender.com' 
  : 'http://localhost:3001'; // Add development server URL

// Optional: Add API_BASE to global context if needed across components
export { API_BASE };

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* 🏠 Home Page */}
            <Route path="/" element={<Home />} />

            {/* 💳 Checkout Page */}
            <Route path="/checkout" element={<Checkout />} />

            {/* 🚫 404 Fallback - Add this for better UX */}
            <Route path="*" element={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600">Page not found</p>
                </div>
              </div>
            } />
          </Routes>
        </main>
        
        {/* Optional: Add footer */}
        <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>&copy; 2024 PenDen. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}