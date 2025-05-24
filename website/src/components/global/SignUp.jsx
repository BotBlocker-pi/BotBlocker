import React, { useState } from 'react';
import { loginUser, registerUser } from '../../api/loginApi.jsx';
import '../../css/global/SignUp.css';

const SignUp = ({ onClose, onSignUpSuccess, onToggleMode }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return;
        }

        try {
            const registrationResponse = await registerUser(username, email, password);

            if (registrationResponse && registrationResponse.access) {
                const loginResponse = await loginUser(username, password);

                if (loginResponse && loginResponse.access) {
                    localStorage.setItem('access_token', loginResponse.access);
                    localStorage.setItem('refresh_token', loginResponse.refresh);

                    onSignUpSuccess && onSignUpSuccess();
                } else {
                    setError('Registration successful, but login failed');
                }
            } else {
                setError(registrationResponse?.error || 'Registration failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Signup error:', err);
        }
    };

    return (
        <div className="signup-container">
            <h2 className="form-title">Sign Up</h2>

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
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-signup">
                        Sign Up
                    </button>
                </div>

                <div className="login-link">
                    Already have an account?
                    <button
                        type="button"
                        onClick={onToggleMode}
                        className="btn-login-link"
                    >
                        Log In
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;