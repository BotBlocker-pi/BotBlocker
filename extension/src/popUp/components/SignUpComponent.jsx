import React, { useState } from 'react';
import styled from 'styled-components';
import { loginUser, registerUser } from '../../api/loginApi.jsx';

// Use the same theme as your extension
const theme = {
    primary: "#4361ee",
    primaryHover: "#3a56d4",
    secondary: "#f72585",
    error: "#ef476f",
    background: "#ffffff",
    backgroundSecondary: "#f8f9fa",
    text: "#2b2d42",
    lightText: "#6c757d",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    borderRadius: "12px",
};

const FormContainer = styled.div`
  padding: 0 24px 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${theme.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: ${theme.transition};

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.error};
  font-size: 14px;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: rgba(239, 71, 111, 0.1);
  border-radius: 6px;
  text-align: center;
`;

const SubmitButton = styled.button`
  background-color: ${theme.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  margin-top: 8px;
  transition: ${theme.transition};
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3);

  &:hover {
    background-color: ${theme.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CancelButton = styled.button`
  background-color: transparent;
  color: ${theme.lightText};
  border: 1px solid #e9ecef;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  margin-top: 8px;
  transition: ${theme.transition};

  &:hover {
    background-color: #f8f9fa;
  }
`;

const FormActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
`;

const LoginLinkContainer = styled.div`
  text-align: center;
  margin-top: 20px;
  color: ${theme.lightText};
  font-size: 14px;
`;

const LoginLink = styled.button`
  background: none;
  border: none;
  color: ${theme.primary};
  cursor: pointer;
  font-weight: 600;
  padding: 0 4px;
  font-size: 14px;
  transition: ${theme.transition};

  &:hover {
    color: ${theme.primaryHover};
    text-decoration: underline;
  }
`;

const SignUpComponent = ({ onClose, onSignUpSuccess, onSwitchToLogin }) => {
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
        // Switch to login mode
        onSwitchToLogin && onSwitchToLogin();
    };

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                {error && <ErrorMessage>{error}</ErrorMessage>}

                <FormGroup>
                    <Label htmlFor="username">Username</Label>
                    <Input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="password">Create Password</Label>
                    <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </FormGroup>

                <FormActions>
                    <CancelButton
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        type="submit"
                    >
                        Sign Up
                    </SubmitButton>
                </FormActions>

                <LoginLinkContainer>
                    Already have an account?{" "}
                    <LoginLink
                        type="button"
                        onClick={handleLogInClick}
                    >
                        Log In
                    </LoginLink>
                </LoginLinkContainer>
            </form>
        </FormContainer>
    );
};

export default SignUpComponent;