import React, { useState } from 'react';
import { loginUser, registerUser } from '../api/loginApi';
import '../css/SignUpComponent.css';

const SignUpComponent = ({ onClose, onSignUpSuccess }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation checks
        if (!username || !email || !password) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return;
        }

        // Attempt registration
        try {
            const registrationResponse = await registerUser(username, email, password);

            if (registrationResponse && registrationResponse.access) {
                // If registration is successful, automatically log in
                const loginResponse = await loginUser(username, password);

                if (loginResponse && loginResponse.access) {
                    // Store tokens
                    localStorage.setItem('access_token', loginResponse.access);
                    localStorage.setItem('refresh_token', loginResponse.refresh);

                    // Notify parent component of successful signup
                    onSignUpSuccess && onSignUpSuccess();
                } else {
                    setError('Registration successful, but login failed');
                }
            } else {
                // Handle registration errors
                setError(registrationResponse?.error || 'Registration failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Signup error:', err);
        }
    };

    const handleLogInClick = () => {
        // Assuming there's a way to switch to login mode
        onClose && onClose('login');
    };

    return (
        <div className="signup-container">
            <h2>Account Login</h2>

            <form onSubmit={handleSubmit} className="signup-form">
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Create Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-signup"
                    >
                        Sign Up
                    </button>
                </div>

                <div className="login-link">
                    Already have an account?
                    <button
                        type="button"
                        onClick={handleLogInClick}
                        className="btn-login-link"
                    >
                        Log In
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUpComponent;