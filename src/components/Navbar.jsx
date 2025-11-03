import React, { useState, useEffect } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate(); // ✅ for redirect

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      const res = await API.post("login/", {
        username: formData.username,
        password: formData.password,
      });
      if (res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        setIsLoggedIn(true);
        setMessage({ text: "Login successful!", type: "success" });
        setTimeout(() => setShowLogin(false), 1000);
      } else {
        setMessage({
          text: res.data.message || "Login failed",
          type: "error",
        });
      }
    } catch {
      setMessage({ text: "Invalid credentials", type: "error" });
    }
  };

  // ✅ REGISTER HANDLER
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      const res = await API.post("register/", formData);
      if (res.status === 201 || res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        setIsLoggedIn(true);
        setMessage({ text: "Registration successful!", type: "success" });
        setTimeout(() => setShowRegister(false), 1500);
      } else {
        setMessage({
          text: res.data.message || "Registration failed",
          type: "error",
        });
      }
    } catch {
      setMessage({
        text: "Registration failed. Please check your details.",
        type: "error",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      await API.get(`products/?search=${searchQuery}`);
    } catch {
      setMessage({ text: "Search failed", type: "error" });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* 🌿 Logo now redirects to Home */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-extrabold text-green-700 cursor-pointer hover:text-green-800 transition"
        >
          PenDen.com
        </h1>

        {/* 🔍 Search bar (hidden on small screens) */}
        <div className="hidden sm:flex flex-1 mx-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            onClick={handleSearch}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-lg transition"
          >
            Search
          </button>
        </div>

        {/* 👤 Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="text-gray-700 hover:text-green-700 transition"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="text-gray-700 hover:text-green-700 transition"
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-green-700 transition"
            >
              Logout
            </button>
          )}
          <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition">
            <ShoppingCart size={18} /> <span>0</span>
          </button>
        </div>

        {/* 📱 Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* 📱 Mobile Dropdown */}
      {menuOpen && (
        <div className="flex flex-col items-center bg-white border-t py-4 space-y-3 md:hidden">
          <div className="flex w-11/12">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              className="bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700 transition"
            >
              Go
            </button>
          </div>

          {!isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setShowLogin(true);
                  setMenuOpen(false);
                }}
                className="text-gray-700 hover:text-green-700"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setShowRegister(true);
                  setMenuOpen(false);
                }}
                className="text-gray-700 hover:text-green-700"
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="text-gray-700 hover:text-green-700"
            >
              Logout
            </button>
          )}

          <button className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            <ShoppingCart size={18} /> Cart (0)
          </button>
        </div>
      )}

      {/* ✅ Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <form
            onSubmit={handleLogin}
            className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-center text-green-700">
              Login
            </h2>
            {message.text && (
              <p
                className={`text-center mb-3 ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message.text}
              </p>
            )}
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 mb-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 mb-4"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              type="button"
              className="w-full text-gray-600 mt-3"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* ✅ Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <form
            onSubmit={handleRegister}
            className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-center text-green-700">
              Register
            </h2>
            {message.text && (
              <p
                className={`text-center mb-3 ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message.text}
              </p>
            )}

            {["username", "email", "phone", "address", "password"].map(
              (field) => (
                <input
                  key={field}
                  type={
                    field === "email"
                      ? "email"
                      : field === "password"
                      ? "password"
                      : "text"
                  }
                  name={field}
                  placeholder={
                    field.charAt(0).toUpperCase() + field.slice(1)
                  }
                  value={formData[field]}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2 mb-2"
                />
              )
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Register
            </button>
            <button
              onClick={() => setShowRegister(false)}
              type="button"
              className="w-full text-gray-600 mt-3"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </header>
  );
}


// import React, { useState, useEffect } from "react";
// import { Menu, X, ShoppingCart } from "lucide-react";
// import API from "../services/api";

// export default function Navbar() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showLogin, setShowLogin] = useState(false);
//   const [showRegister, setShowRegister] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     phone: "",
//     address: "",
//     password: "",
//   });
//   const [searchQuery, setSearchQuery] = useState("");
//   const [message, setMessage] = useState({ text: "", type: "" });

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   // ✅ LOGIN HANDLER
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setMessage({ text: "", type: "" });
//     try {
//       const res = await API.post("login/", {
//         username: formData.username,
//         password: formData.password,
//       });
//       if (res.data.status === "success") {
//         localStorage.setItem("token", res.data.token);
//         setIsLoggedIn(true);
//         setMessage({ text: "Login successful!", type: "success" });
//         setTimeout(() => setShowLogin(false), 1000);
//       } else {
//         setMessage({
//           text: res.data.message || "Login failed",
//           type: "error",
//         });
//       }
//     } catch {
//       setMessage({ text: "Invalid credentials", type: "error" });
//     }
//   };

//   // ✅ REGISTER HANDLER
//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setMessage({ text: "", type: "" });
//     try {
//       const res = await API.post("register/", formData);
//       if (res.status === 201 || res.data.status === "success") {
//         localStorage.setItem("token", res.data.token);
//         setIsLoggedIn(true);
//         setMessage({ text: "Registration successful!", type: "success" });
//         setTimeout(() => setShowRegister(false), 1500);
//       } else {
//         setMessage({
//           text: res.data.message || "Registration failed",
//           type: "error",
//         });
//       }
//     } catch {
//       setMessage({
//         text: "Registration failed. Please check your details.",
//         type: "error",
//       });
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setIsLoggedIn(false);
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;
//     try {
//       await API.get(`products/?search=${searchQuery}`);
//     } catch {
//       setMessage({ text: "Search failed", type: "error" });
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) setIsLoggedIn(true);
//   }, []);

//   return (
//     <header className="bg-white border-b shadow-sm sticky top-0 z-50">
//       <nav className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
//         {/* 🌿 Logo */}
//         <h1 className="text-2xl font-extrabold text-green-700">PenDen.com</h1>

//         {/* 🔍 Search bar (hidden on small screens) */}
//         <div className="hidden sm:flex flex-1 mx-6">
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
//           />
//           <button
//             onClick={handleSearch}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-lg transition"
//           >
//             Search
//           </button>
//         </div>

//         {/* 👤 Desktop Actions */}
//         <div className="hidden md:flex items-center space-x-4">
//           {!isLoggedIn ? (
//             <>
//               <button
//                 onClick={() => setShowLogin(true)}
//                 className="text-gray-700 hover:text-green-700 transition"
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => setShowRegister(true)}
//                 className="text-gray-700 hover:text-green-700 transition"
//               >
//                 Register
//               </button>
//             </>
//           ) : (
//             <button
//               onClick={handleLogout}
//               className="text-gray-700 hover:text-green-700 transition"
//             >
//               Logout
//             </button>
//           )}
//           <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition">
//             <ShoppingCart size={18} /> <span>0</span>
//           </button>
//         </div>

//         {/* 📱 Mobile Menu Toggle */}
//         <button
//           className="md:hidden text-gray-700"
//           onClick={() => setMenuOpen(!menuOpen)}
//         >
//           {menuOpen ? <X size={26} /> : <Menu size={26} />}
//         </button>
//       </nav>

//       {/* 📱 Mobile Dropdown */}
//       {menuOpen && (
//         <div className="flex flex-col items-center bg-white border-t py-4 space-y-3 md:hidden">
//           <div className="flex w-11/12">
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
//             />
//             <button
//               onClick={handleSearch}
//               className="bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700 transition"
//             >
//               Go
//             </button>
//           </div>

//           {!isLoggedIn ? (
//             <>
//               <button
//                 onClick={() => {
//                   setShowLogin(true);
//                   setMenuOpen(false);
//                 }}
//                 className="text-gray-700 hover:text-green-700"
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => {
//                   setShowRegister(true);
//                   setMenuOpen(false);
//                 }}
//                 className="text-gray-700 hover:text-green-700"
//               >
//                 Register
//               </button>
//             </>
//           ) : (
//             <button
//               onClick={() => {
//                 handleLogout();
//                 setMenuOpen(false);
//               }}
//               className="text-gray-700 hover:text-green-700"
//             >
//               Logout
//             </button>
//           )}

//           <button className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
//             <ShoppingCart size={18} /> Cart (0)
//           </button>
//         </div>
//       )}

//       {/* ✅ Login Modal */}
//       {showLogin && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
//           <form
//             onSubmit={handleLogin}
//             className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-6"
//           >
//             <h2 className="text-2xl font-semibold mb-4 text-center text-green-700">
//               Login
//             </h2>
//             {message.text && (
//               <p
//                 className={`text-center mb-3 ${
//                   message.type === "success" ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {message.text}
//               </p>
//             )}
//             <input
//               name="username"
//               placeholder="Username"
//               value={formData.username}
//               onChange={handleChange}
//               className="border rounded-lg w-full p-2 mb-2"
//             />
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               className="border rounded-lg w-full p-2 mb-4"
//             />
//             <button
//               type="submit"
//               className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
//             >
//               Login
//             </button>
//             <button
//               onClick={() => setShowLogin(false)}
//               type="button"
//               className="w-full text-gray-600 mt-3"
//             >
//               Cancel
//             </button>
//           </form>
//         </div>
//       )}

//       {/* ✅ Register Modal */}
//       {showRegister && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
//           <form
//             onSubmit={handleRegister}
//             className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6"
//           >
//             <h2 className="text-2xl font-semibold mb-4 text-center text-green-700">
//               Register
//             </h2>
//             {message.text && (
//               <p
//                 className={`text-center mb-3 ${
//                   message.type === "success" ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {message.text}
//               </p>
//             )}

//             {["username", "email", "phone", "address", "password"].map(
//               (field) => (
//                 <input
//                   key={field}
//                   type={
//                     field === "email"
//                       ? "email"
//                       : field === "password"
//                       ? "password"
//                       : "text"
//                   }
//                   name={field}
//                   placeholder={
//                     field.charAt(0).toUpperCase() + field.slice(1)
//                   }
//                   value={formData[field]}
//                   onChange={handleChange}
//                   className="border rounded-lg w-full p-2 mb-2"
//                 />
//               )
//             )}

//             <button
//               type="submit"
//               className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
//             >
//               Register
//             </button>
//             <button
//               onClick={() => setShowRegister(false)}
//               type="button"
//               className="w-full text-gray-600 mt-3"
//             >
//               Cancel
//             </button>
//           </form>
//         </div>
//       )}
//     </header>
//   );
// }

