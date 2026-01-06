import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import FramesPage from "./components/SideBar";
import StationeryPage from "./components/SideBar";
import PrintingPage from "./components/SideBar";
import MirrorsPage from "./components/SideBar";
import Footer from "./components/Footer"; // Import your custom Footer

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
        
        {/* Replace the existing footer with your custom Footer component */}
        <Footer />
      </div>
    </Router>
  );
}

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";
// import Checkout from "./pages/Checkout";
// import FramesPage from "./components/SideBar";
// import StationeryPage from "./components/SideBar";
// import PrintingPage from "./components/SideBar";
// import MirrorsPage from "./components/SideBar";



// export default function App() {
//   // In your main App.js or index.js
// if (window.location.hostname.includes('penden.store')) {
//   // Clear old localStorage if migrating
//   const oldKeys = Object.keys(localStorage).filter(key => 
//     key.includes('penden.online') || 
//     localStorage.getItem(key)?.includes('penden.online')
//   );
//   oldKeys.forEach(key => localStorage.removeItem(key));
// }
//   return (
//     <Router>
//       <div className="min-h-screen flex flex-col bg-gray-50">
//         <Navbar />
//         <main className="flex-grow">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/frames" element={<FramesPage />} />
//             <Route path="/stationery" element={<StationeryPage />} />
//             <Route path="/printing" element={<PrintingPage />} />
//             <Route path="/mirrors" element={<MirrorsPage />} />
//             {/* 🏠 Home Page */}
//             <Route path="/" element={<Home />} />

//             {/* 💳 Checkout Page */}
//             <Route path="/checkout" element={<Checkout />} />

//             {/* 🚫 404 Fallback - Add this for better UX */}
//             <Route path="*" element={
//               <div className="flex items-center justify-center min-h-[60vh]">
//                 <div className="text-center">
//                   <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
//                   <p className="text-xl text-gray-600">Page not found</p>
//                 </div>
//               </div>
//             } />
//           </Routes>
//         </main>
        
//         {/* Optional: Add footer */}
//         <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
//           <div className="container mx-auto px-4 text-center text-gray-500">
//             <p>&copy; 2025 PenDen. All rights reserved.</p>
//           </div>
//         </footer>
//       </div>
//     </Router>
//   );
// }