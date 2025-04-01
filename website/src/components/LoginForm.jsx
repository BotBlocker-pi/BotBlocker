import { useState } from "react";
import SignUpComponent from "./SIgnUpComponent.jsx"; // Import the new SignUp component
import { loginUser, registerUser } from '../api/loginApi';

const LoginForm = ({ onAuthChange, onClose, initialMode = false }) => {
    const [isRegisterMode, setIsRegisterMode] = useState(initialMode);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            if (isRegisterMode) {
                // Registration validation
                if (!username || !email || !password) {
                    setMessage("❌ All fields are required.");
                    return;
                }

                if (password !== confirmPassword) {
                    setMessage("❌ Passwords do not match.");
                    return;
                }

                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    setMessage("❌ Invalid email format.");
                    return;
                }

                // Registration logic
                const registrationData = await registerUser(username, email, password);

                if (registrationData) {
                    // Automatically log in after successful registration
                    localStorage.setItem("access_token", registrationData.access);
                    localStorage.setItem("refresh_token", registrationData.refresh);

                    setMessage("✅ Registration successful!");
                    onAuthChange(true);
                } else {
                    setMessage("❌ Registration failed. Please try again.");
                }
            } else {
                // Login logic
                const data = await loginUser(username, password);
                if (data) {
                    localStorage.setItem("access_token", data.access);
                    localStorage.setItem("refresh_token", data.refresh);

                    setMessage("✅ Login successful!");
                    onAuthChange(true);
                } else {
                    setMessage("❌ Invalid credentials.");
                }
            }
        } catch (error) {
            // Handle specific error messages from the backend
            const errorMessage = error.response?.data?.error ||
                "❌ Authentication failed. Please try again.";
            setMessage(errorMessage);

            console.error(isRegisterMode ? "Registration error:" : "Login error:", error);
        }
    };

    const toggleFormMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setMessage(""); // Clear any previous messages
        // Reset form fields when switching modes
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    // If in register mode, render the SignUp component
    if (isRegisterMode) {
        return (
            <SignUpComponent
                onClose={onClose}
                onSignUpSuccess={() => onAuthChange(true)}
                initialData={{
                    username,
                    email,
                    password,
                    confirmPassword
                }}
                onToggleMode={toggleFormMode}
            />
        );
    }

    return (
        <div className="login-form-container">
            {message && (
                <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={message.includes("❌") ? "error" : ""}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={message.includes("❌") ? "error" : ""}
                        required
                        minLength={8}
                    />
                </div>

                <div className="form-buttons">
                    <button type="button" onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="submit-button">
                        Sign In
                    </button>
                </div>

                <div className="form-toggle">
                    Don't have an account?
                    <button
                        type="button"
                        onClick={toggleFormMode}
                        className="toggle-mode-button"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;