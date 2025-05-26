import React, { useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  checkAuth,
  logoutUser,
} from "../../../api/loginApi.jsx";
import "../../css/components/global/Login.css";

const Login = ({ onBackToHome, onAuthChange, initialMode = false }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(initialMode);

  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
    };
    checkAuthentication();
  }, []);

  useEffect(() => {
    setIsSignUpMode(initialMode);
  }, [initialMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !password) {
      setMessage("❌ Username and password are required.");
      return;
    }

    try {
      const data = await loginUser(username, password);
      if (data && data.access) {
        localStorage.setItem("access_token", data.access);
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }
        setMessage("✅ Login successful!");
        setIsAuthenticated(true);
        onAuthChange?.(true);
        setTimeout(() => onBackToHome?.(), 1500);
      } else {
        setMessage("❌ Invalid credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ Login failed. Please try again.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !email || !password || !confirmPassword) {
      setMessage("❌ All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("❌ Invalid email format.");
      return;
    }

    try {
      const reg = await registerUser(username, email, password);
      if (reg && reg.access) {
        localStorage.setItem("access_token", reg.access);
        if (reg.refresh) {
          localStorage.setItem("refresh_token", reg.refresh);
        }
        setMessage("✅ Account created successfully!");
        setIsAuthenticated(true);
        onAuthChange?.(true);
        setTimeout(() => onBackToHome?.(), 1500);
      } else {
        const login = await loginUser(username, password);
        if (login && login.access) {
          localStorage.setItem("access_token", login.access);
          if (login.refresh) {
            localStorage.setItem("refresh_token", login.refresh);
          }
          setMessage("✅ Account created and logged in!");
          setIsAuthenticated(true);
          onAuthChange?.(true);
          setTimeout(() => onBackToHome?.(), 1500);
        } else {
          setMessage("✅ Account created! Please log in.");
          setIsSignUpMode(false);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("❌ Registration failed. Please try again.");
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setMessage("");
  };

  return (
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">
            {isSignUpMode ? "Create Account" : "Account Login"}
          </h2>

          {message && (
              <div
                  className={`login-message ${message.includes("✅") ? "success" : "error"}`}
              >
                {message}
              </div>
          )}

          <form
              className="login-form"
              onSubmit={isSignUpMode ? handleSignUp : handleLogin}
          >
            <div className="input-group">
              <label>Username</label>
              <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
              />
            </div>

            {isSignUpMode && (
                <div className="input-group">
                  <label>Email</label>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
                </div>
            )}

            <div className="input-group">
              <label>{isSignUpMode ? "Create Password" : "Password"}</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
              />
            </div>

            {isSignUpMode && (
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                  />
                </div>
            )}

            <button type="submit" className="login-button">
              {isSignUpMode ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="login-toggle">
            {isSignUpMode ? "Already have an account?" : "Don't have an account?"}
            <button className="toggle-link" onClick={toggleMode}>
              {isSignUpMode ? "Log In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
  );
};

export default Login;
