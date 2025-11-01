import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Messages
  const [loginMessage, setLoginMessage] = useState("");
  const [loginMessageType, setLoginMessageType] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerMessageType, setRegisterMessageType] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    try {
      const res = await API.post("login/", {
        username: formData.username,
        password: formData.password,
      });

      if (res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        setIsLoggedIn(true);
        setLoginMessage("Login successful!");
        setLoginMessageType("success");

        // Close modal after short delay
        setTimeout(() => {
          setShowLogin(false);
          setLoginMessage("");
        }, 1000);
      } else {
        setLoginMessage(res.data.message || "Login failed");
        setLoginMessageType("error");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginMessage("Invalid credentials");
      setLoginMessageType("error");
    }
  };

  // ✅ REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage("");
    try {
      const res = await API.post("register/", {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });

      if (res.status === 201 || res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        setIsLoggedIn(true);
        setRegisterMessage("Registration successful!");
        setRegisterMessageType("success");

        // Close register modal after showing message
        setTimeout(() => {
          setShowRegister(false);
          setRegisterMessage("");
        }, 1500);
      } else {
        setRegisterMessage(res.data.message || "Registration failed");
        setRegisterMessageType("error");
      }
    } catch (err) {
      console.error("Register error:", err);
      setRegisterMessage("Registration failed. Please check your details.");
      setRegisterMessageType("error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // ✅ SEARCH HANDLER
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter something to search.");
      return;
    }

    try {
      const res = await API.get(`products/?search=${searchQuery}`);
      if (res.data.length === 0) {
        setNoResults(true);
        setSearchResults([]);
      } else {
        setSearchResults(res.data);
        setNoResults(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setNoResults(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <div>
      <nav className="bg-white border-b shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-green-700">PenDen.com</h1>
        </div>

        {/* 🔍 Search Bar */}
        <div className="flex-1 mx-6 flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full border rounded-l-md px-4 py-2 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-4 rounded-r-md hover:bg-green-700"
          >
            Search
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {!isLoggedIn ? (
            <>
              <button onClick={() => setShowLogin(true)}>Login</button>
              <button onClick={() => setShowRegister(true)}>Register</button>
            </>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
          <button className="bg-green-600 text-white px-3 py-2 rounded-md">
            🛒 0
          </button>
        </div>
      </nav>

      {/* ✅ Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            onSubmit={handleLogin}
            className="bg-white p-6 rounded-lg shadow-lg w-80"
          >
            <h2 className="text-xl font-bold mb-4">Login</h2>

            {loginMessage && (
              <p
                className={`text-sm mb-3 ${
                  loginMessageType === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {loginMessage}
              </p>
            )}

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="border p-2 w-full mb-4"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="text-gray-600 mt-2 w-full"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* ✅ Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            onSubmit={handleRegister}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
          >
            <h2 className="text-xl font-bold mb-4">Register</h2>

            {registerMessage && (
              <p
                className={`text-sm mb-3 ${
                  registerMessageType === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {registerMessage}
              </p>
            )}

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="border p-2 w-full mb-4"
            />

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              className="text-gray-600 mt-2 w-full"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

