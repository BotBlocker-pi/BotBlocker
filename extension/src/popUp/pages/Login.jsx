import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { loginUser, checkAuth, logoutUser } from "../../api/loginApi.jsx";

// Using the same theme from HomePage for consistency
const theme = {
  primary: "#4361ee",
  primaryHover: "#3a56d4",
  secondary: "#f72585",
  error: "#ef476f",
  success: "#06d6a0",
  background: "#ffffff",
  backgroundSecondary: "#f8f9fa",
  text: "#2b2d42",
  lightText: "#6c757d",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",
  borderRadius: "12px",
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
  font-family: "Arial", sans-serif;
`;

const LoginContainer = styled.div`
  background-color: ${theme.background};
  border-radius: ${theme.borderRadius};
  width: 100%;
  overflow: hidden;
`;

const AuthContainer = styled(LoginContainer)`
  text-align: center;
  padding: 24px;
`;

const Title = styled.h2`
  color: ${theme.text};
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
  font-size: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px 24px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.$error ? theme.error : "#e9ecef"};
  font-size: 16px;
  background-color: ${theme.backgroundSecondary};
  transition: ${theme.transition};
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const ButtonBase = styled.button`
  padding: 14px 24px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transition};

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoginButton = styled(ButtonBase)`
  padding: 14px;
  background-color: ${theme.primary};
  color: white;
  margin-top: 8px;
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3);

  &:hover {
    background-color: ${theme.primaryHover};
    box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4);
  }
`;

const LogoutButton = styled(ButtonBase)`
  background-color: ${theme.error};
  color: white;
  margin-top: 16px;
  box-shadow: 0 4px 10px rgba(239, 71, 111, 0.3);

  &:hover {
    background-color: #e5364d;
    box-shadow: 0 6px 15px rgba(239, 71, 111, 0.4);
  }
`;

const BackButton = styled(ButtonBase)`
  background-color: ${theme.primary};
  color: white;
  margin-top: 16px;
  margin-right: 12px;
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3);

  &:hover {
    background-color: ${theme.primaryHover};
    box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

const Message = styled.div`
  text-align: center;
  padding: 12px;
  margin: 16px;
  border-radius: 8px;
  font-weight: 500;
  background-color: ${props => props.$success ? "rgba(6, 214, 160, 0.1)" : "rgba(239, 71, 111, 0.1)"};
  color: ${props => props.$success ? theme.success : theme.error};
`;

const AuthMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: ${theme.success};
  margin-bottom: 16px;
`;

const StatusIcon = styled.span`
  font-size: 22px;
  color: ${theme.success};
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e9ecef;
  margin: 8px 0;
`;

const UserInfoBox = styled.div`
  background-color: ${theme.backgroundSecondary};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const Login = ({ onBackToHome, onAuthChange  }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await checkAuth();
      setIsAuthenticated(authenticated);
    };
    checkAuthentication();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const data = await loginUser(username, password);
    if (data) {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("is_new_login", "true");
      setMessage("✅ Login successful!");
      setIsAuthenticated(true);
      // Call the function to update parent state
      if (onAuthChange) onAuthChange(true);
    } else {
      setMessage("❌ Invalid credentials.");
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    logoutUser();
    setIsAuthenticated(false);
    // Update parent state on logout too
    if (onAuthChange) onAuthChange(false);
    setUsername("");
    setPassword("");
  };

  const handleBackToHome = (e) => {
    e.preventDefault();
    if (onBackToHome && typeof onBackToHome === 'function') {
      onBackToHome();
    }
  };

  return (
      <Container>
        {isAuthenticated ? (
            <AuthContainer>
              <AuthMessage>
                <StatusIcon>✓</StatusIcon>
                Authenticated User
              </AuthMessage>

              <UserInfoBox>
                You are currently logged in to your account.
              </UserInfoBox>

              <Divider />

              <ButtonGroup>
                <BackButton onClick={handleBackToHome}>
                  Back to Home
                </BackButton>
                <LogoutButton onClick={handleLogout}>
                  Logout
                </LogoutButton>
              </ButtonGroup>
            </AuthContainer>
        ) : (
            <LoginContainer>
              <Title>Account Login</Title>

              {message && (
                  <Message $success={message.includes("✅")}>
                    {message}
                  </Message>
              )}

              <Form onSubmit={handleLogin}>
                <InputGroup>
                  <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      $error={message.includes("❌")}
                  />
                </InputGroup>

                <InputGroup>
                  <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      $error={message.includes("❌")}
                  />
                </InputGroup>

                <LoginButton type="submit">
                  Sign In
                </LoginButton>
              </Form>
            </LoginContainer>
        )}
      </Container>
  );
};

export default Login;