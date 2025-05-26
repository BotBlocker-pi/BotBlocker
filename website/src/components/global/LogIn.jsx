import React, { useState } from 'react';
import SignUp from './SignUp.jsx';
import { loginUser } from '../../api/loginApi.jsx';
import '../../css/global/LogIn.css';

const Login = ({ onAuthChange, onClose, initialMode = false }) => {
    const [isRegisterMode, setIsRegisterMode] = useState(initialMode);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const data = await loginUser(username, password);

            if (data) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('role', data.role);

                setMessage('✅ Log in successful!');
                onAuthChange(true);
            } else {
                setMessage('❌ Invalid credentials.');
            }
        } catch (error) {
            setMessage(error.message || '❌ Authentication failed.');
            console.error('Login error:', error);
        }
    };

    const toggleFormMode = () => {
        setIsRegisterMode(true);
        setMessage('');
        setUsername('');
        setPassword('');
    };

    if (isRegisterMode) {
        return (
            <SignUp
                onClose={onClose}
                onSignUpSuccess={() => onAuthChange(true)}
                onToggleMode={() => setIsRegisterMode(false)}
            />
        );
    }

    return (
        <div className="login-form-container">
            <h2 className="form-title">Log In</h2>

            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
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
                        required
                    />
                </div>

                <div className="form-buttons">
                    <button type="button" onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="submit-button">
                        Log In
                    </button>
                </div>

                <div className="form-toggle">
                    <span style={{ color: '#222' }}>Don't have an account?</span>
                    <button type="button" onClick={toggleFormMode} className="toggle-mode-button">
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;