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
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("login/", {
        username: formData.username,
        password: formData.password,
      });

      if (res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        setIsLoggedIn(true);
        setShowLogin(false);
        alert("Login successful!");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid credentials");
    }
  };

  //REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
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
        setShowRegister(false);
        alert("Registration successful!");
      } else {
        alert("Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Registration failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  //(Optional) Check token validity on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <nav className="bg-white border-b shadow-sm flex items-center justify-between px-6 py-3">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-green-700">PenDen.com</h1>
      </div>

      <div className="flex-1 mx-6">
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full border rounded-md px-4 py-2"
        />
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

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <form
            onSubmit={handleLogin}
            className="bg-white p-6 rounded-md shadow-md w-96"
          >
            <h2 className="text-xl font-semibold mb-4">Login</h2>
            <input
              name="username"
              type="text"
              placeholder="Username"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange}
            />
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <form
            onSubmit={handleRegister}
            className="bg-white p-6 rounded-md shadow-md w-96"
          >
            <h2 className="text-xl font-semibold mb-4">Register</h2>
            <input
              name="username"
              type="text"
              placeholder="Username"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="phone"
              type="text"
              placeholder="Phone"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="address"
              type="text"
              placeholder="Address"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleChange}
            />
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      )}
    </nav>
  );
}
