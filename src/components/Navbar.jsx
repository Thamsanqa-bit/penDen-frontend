import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Clear form data
  const clearForm = () => {
    setFormData({
      username: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    });
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.username.trim()) {
      setMessage({ text: "Username is required", type: "error" });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ text: "Email is required", type: "error" });
      return false;
    }
    if (!validateEmail(formData.email)) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      return false;
    }
    if (!formData.password) {
      setMessage({ text: "Password is required", type: "error" });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters", type: "error" });
      return false;
    }
    return true;
  };

  //LOGIN HANDLER
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
        localStorage.setItem("username", formData.username);
        setIsLoggedIn(true);
        setUser({ username: formData.username });
        setMessage({ text: "Login successful!", type: "success" });
        setTimeout(() => {
          setShowLogin(false);
          clearForm();
        }, 1000);
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

  //REGISTER HANDLER - UPDATED TO HANDLE SPECIFIC ERROR FORMAT
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const res = await API.post("register/", formData);
      if (res.status === 201 || res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", formData.username);
        setIsLoggedIn(true);
        setUser({ username: formData.username });
        setMessage({ text: "Registration successful!", type: "success" });
        setTimeout(() => {
          setShowRegister(false);
          clearForm();
        }, 1500);
      } else {
        setMessage({
          text: res.data.message || "Registration failed",
          type: "error",
        });
      }
    } catch (error) {
      // Handle the specific error response format
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        
        // Check for username already exists error
        if (errorData.username && Array.isArray(errorData.username) && 
            errorData.username[0] === "A user with that username already exists.") {
          setMessage({
            text: "A user with that username already exists. Please choose a different username.",
            type: "error",
          });
        }
        // Check for email already exists error
        else if (errorData.email && Array.isArray(errorData.email) && 
                 errorData.email[0] === "A user with this email already exists.") {
          setMessage({
            text: "A user with this email already exists. Please use a different email.",
            type: "error",
          });
        }
        // Handle multiple errors (both username and email exist)
        else if (errorData.username && errorData.email && 
                 Array.isArray(errorData.username) && Array.isArray(errorData.email) &&
                 errorData.username[0] === "A user with that username already exists." &&
                 errorData.email[0] === "A user with this email already exists.") {
          setMessage({
            text: "Both username and email already exist. Please choose different ones.",
            type: "error",
          });
        }
        // Handle other validation errors
        else {
          // Extract all error messages and combine them
          const errorMessages = [];
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              errorMessages.push(...errorData[key]);
            } else if (typeof errorData[key] === 'string') {
              errorMessages.push(errorData[key]);
            }
          });
          
          setMessage({
            text: errorMessages.join(' ') || "Registration failed. Please check your details.",
            type: "error",
          });
        }
      } else {
        setMessage({
          text: "Registration failed. Please check your details.",
          type: "error",
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setMessage({ text: "", type: "" });
    
    try {
      const response = await API.get(`products/?search=${encodeURIComponent(searchQuery)}`);
      
      // FIXED: Access the correct data structure from Django backend
      const products = response.data.products || [];
      
      setSearchResults(products);
      setShowResults(true);
      
      if (products.length === 0) {
        setMessage({ text: "No products found matching your search", type: "info" });
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setMessage({ text: "Search failed. Please try again.", type: "error" });
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const closeSearchResults = () => {
    setShowResults(false);
  };

  // Close modals and clear form
  const closeLoginModal = () => {
    setShowLogin(false);
    clearForm();
    setMessage({ text: "", type: "" });
  };

  const closeRegisterModal = () => {
    setShowRegister(false);
    clearForm();
    setMessage({ text: "", type: "" });
  };

  // Navigate to search results page
  const navigateToSearchPage = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");

    if (token) {
      setIsLoggedIn(true);
      if (savedUsername) {
        setUser({ username: savedUsername });
      } else {
        API.get("profile/", {
          headers: { Authorization: `Token ${token}` },
        })
          .then((res) => setUser(res.data))
          .catch(() => setUser(null));
      }
    }
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showResults && !event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* 🌿 Logo */}
        <div onClick={() => navigate("/")} className="cursor-pointer flex items-center">
          <img
            src="https://penden-s3.s3.us-east-2.amazonaws.com/logo.png"
            alt="PenDen Logo"
            className="h-[100px] w-[60px] object-contain hover:opacity-90 transition"
          />
        </div>

        {/* 🔍 Search bar with results */}
        <div className="hidden sm:flex flex-1 mx-6 relative search-container">
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-0 top-0 bg-[#969195] hover:bg-[#7e7a7e] text-white px-4 py-2 rounded-r-lg transition disabled:opacity-50"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Search Results */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 max-h-96 overflow-y-auto z-50">
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* <button
                      onClick={navigateToSearchPage}
                      className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                    >
                      View All
                    </button> */}
                    <button
                      onClick={closeSearchResults}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setShowResults(false);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image || "/placeholder-image.jpg"}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-green-600 font-semibold">
                              R{Number(product.price).toFixed(2)}
                            </p>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No products found</p>
                    <button
                      onClick={closeSearchResults}
                      className="mt-2 text-sm text-green-600 hover:text-green-700"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
            <>
              <span className="text-gray-700 font-medium">
                👋 Hi, {user?.username || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-green-700 transition"
              >
                Logout
              </button>
            </>
          )}
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
          <div className="flex w-11/12 relative search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Go'
              )}
            </button>
          </div>

          {/* Mobile Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="w-11/12 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 max-h-96 overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Results ({searchResults.length})
                  </h3>
                  <button
                    onClick={closeSearchResults}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-3">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        setShowResults(false);
                        setMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image || "/placeholder-image.jpg"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {product.name}
                          </h4>
                          <p className="text-green-600 font-semibold">
                            R{Number(product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showResults && searchResults.length === 0 && (
            <div className="w-11/12 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">No products found</p>
                <button
                  onClick={closeSearchResults}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

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
            <>
              <span className="text-gray-700 font-medium">
                👋 Hi, {user?.username}
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-gray-700 hover:text-green-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
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
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Login
            </button>
            <button
              onClick={closeLoginModal}
              type="button"
              className="w-full text-gray-600 mt-3"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
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
                  required={field !== "phone" && field !== "address"}
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
              onClick={closeRegisterModal}
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