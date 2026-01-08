import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import FramesPage from "./components/SideBar";
import StationeryPage from "./components/SideBar";
import PrintingPage from "./components/SideBar";
import MirrorsPage from "./components/SideBar";
import { FaFacebook } from "react-icons/fa";



export default function App() {
  // In your main App.js or index.js
if (window.location.hostname.includes('penden.store')) {
  // Clear old localStorage if migrating
  const oldKeys = Object.keys(localStorage).filter(key => 
    key.includes('penden.online') || 
    localStorage.getItem(key)?.includes('penden.online')
  );
  oldKeys.forEach(key => localStorage.removeItem(key));
}
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/frames" element={<FramesPage />} />
            <Route path="/stationery" element={<StationeryPage />} />
            <Route path="/printing" element={<PrintingPage />} />
            <Route path="/mirrors" element={<MirrorsPage />} />
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
        
        <div className="group">
  <footer className="
    bg-gray-50 
    border-t border-gray-300 
    py-8 mt-auto w-full
    transform transition-all duration-300 ease-in-out
    group-hover:-translate-y-1 group-hover:shadow-lg
  ">
    <div className="container mx-auto px-4 text-gray-900">

      {/* Centered Container for All Items */}
      <div className="flex flex-col items-center justify-center gap-6">

        {/* Powered By - Centered */}
        <div className="text-center">
          <p className="text-sm">
            Powered by{' '}
            <a 
              href="https://kgafatech.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors"
            >
              KGAFATECH
            </a>
          </p>
        </div>

        {/* Contact Information - Stacked and Centered */}
        <div className="flex flex-col items-center gap-4 text-center">

          {/* Phone Numbers */}
          <div className="text-sm">
            <p className="font-medium mb-1">
              <span className="inline-block mr-2">📞</span>
              <a 
                href="tel:0677854602"
                className="font-semibold text-black hover:text-gray-700 transition hover:underline"
              >
                067 785 4602
              </a>
            </p>
            <p className="font-medium">
              <span className="inline-block mr-2">☎️</span>
              <a 
                href="tel:0117644612"
                className="font-semibold text-black hover:text-gray-700 transition hover:underline"
              >
                011 764 4612
              </a>
            </p>
          </div>

          {/* Facebook Icon - Black */}
          <a
            href="#"
            aria-label="Facebook"
            className="text-black text-2xl hover:text-gray-700 transition transform group-hover:scale-110 duration-200"
          >
            <FaFacebook />
          </a>

        </div>

        {/* Address - Centered */}
        <div className="text-center">
          <p className="text-sm">
            <a
              href="https://maps.google.com/?q=31+CR+Swart+Drive+Wilpark"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-black hover:text-gray-700 transition hover:underline"
            >
              31 CR, Swart Drive, Wilpark
            </a>
          </p>
        </div>

        {/* Copyright - Centered */}
        <div className="text-center mt-2">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} PenDen. All rights reserved.
          </p>
        </div>

      </div>

    </div>
  </footer>
</div>
        {/* <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>&copy; 2025 PenDen. All rights reserved.</p>
          </div>
        </footer> */}
      </div>
    </Router>
  );
}