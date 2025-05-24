import React, { useState } from 'react';
import { loginUser, registerUser } from '../../../api/loginApi.jsx';
import '../../css/components/global/SignUpComponent.css';

const SignUp = ({ onClose, onSignUpSuccess, onSwitchToLogin }) => {
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
                    onSignUpSuccess?.();
                } else {
                    setError('Registration successful, but login failed');
                }
            } else {
                setError(registrationResponse?.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('An unexpected error occurred');
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit} className="signup-form">
                {error && <div className="signup-error">{error}</div>}

                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Create Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                        Sign Up
                    </button>
                </div>

                <div className="signup-footer">
                    Already have an account?{' '}
                    <button type="button" className="login-link" onClick={onSwitchToLogin}>
                        Log In
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;
