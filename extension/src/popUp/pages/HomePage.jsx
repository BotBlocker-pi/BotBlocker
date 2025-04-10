import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Navbar from "../components/global/Navbar.jsx";
import SocialMediaProfile from "../components/SocialMediaProfileInfo.jsx";
import AiAnalysis from "../components/AiAnalysis.jsx";
import { getProfileData, sendEvaluationToBackend, sendAvatarToBackend, getUserWasVote} from "../../api/data.jsx";
import QuestionnaireYes from "../components/voting/QuestionnaireYes.jsx";
import QuestionnaireNo from "../components/voting/QuestionnaireNo.jsx";
import Login from "./Login.jsx";
import { checkAuth, logoutUser } from "../../api/loginApi.jsx";

// Enhanced colors and theme
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

// Styled components (using your existing styles)
const Container = styled.div`
  background-color: ${theme.background};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
  padding-bottom: 24px;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  transition: ${theme.transition};
`;

const LoginButton = styled.button`
  background-color: ${theme.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin: 24px auto;
  display: block;
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

const WebsiteLink = styled.p`
  font-size: 14px;
  color: ${theme.primary};
  text-decoration: underline;
  margin: 0;
  text-align: center;
  padding: 16px 0;
  cursor: pointer;
  transition: ${theme.transition};

  &:hover {
    color: ${theme.primaryHover};
  }
`;

const VotingContainer = styled.div`
  text-align: center;
  margin: 24px 16px;
  padding: 16px;
  background-color: ${theme.backgroundSecondary};
  border-radius: ${theme.borderRadius};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: ${theme.text};
  background-color: transparent;
  border: 2px solid ${props => props.$vote === "Yes" ? theme.secondary : theme.primary};
  border-radius: 100px;
  cursor: pointer;
  width: 120px;
  transition: ${theme.transition};

  &:hover {
    background-color: ${props => props.$vote === "Yes" ? theme.secondary : theme.primary};
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TextContainer = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${theme.text};
  margin-bottom: 8px;
`;

const ContentWrapper = styled.div`
  padding: 0 16px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e9ecef;
  margin: 12px 0;
`;

const LoadingPlaceholder = styled.div`
  padding: 20px;
  text-align: center;
  color: ${theme.lightText};
`;

const LogoutButton = styled.button`
  background-color: ${theme.error};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin: 12px auto 0;
  display: block;
  transition: ${theme.transition};
  box-shadow: 0 4px 10px rgba(239, 71, 111, 0.3);

  &:hover {
    background-color: #e5364d;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(239, 71, 111, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const UserStatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
  padding: 8px;
  border-radius: ${theme.borderRadius};
  background-color: ${theme.backgroundSecondary};
`;

const UserStatus = styled.div`
  font-size: 14px;
  color: ${theme.text};
  margin-bottom: 8px;
  font-weight: 500;
`;

const SuccessMessage = styled.div`
  background-color: rgba(6, 214, 160, 0.1);
  color: ${theme.success};
  padding: 12px;
  margin: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
`;

const HomePage = () => {
  const [data, setData] = useState(null);
  const [img, setImg] = useState(null);
  const [url, setUrl] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [vote, setVote] = useState(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus);
        localStorage.setItem('isAuthenticated', JSON.stringify(authStatus));
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // First check localStorage
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth) {
      setIsAuthenticated(JSON.parse(storedAuth));
    }

    // Then verify with the server
    checkAuthStatus();
  }, []);

  const handleAuthChange = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem('isAuthenticated', JSON.stringify(status));

    if (status) {
      // Show success message when user logs in or signs up
      setSuccessMessage("Successfully authenticated!");
      setShowSuccessMessage(true);

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  const handleVote = (voteValue) => {
    console.log(`User voted: ${voteValue}`);
    setShowQuestionnaire(true);
    setVote(voteValue);
  };

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const handleSubmitReason = (reason) => {
    console.log(`Selected reason: ${reason}`);

    const evaluationData = {
      profile: data.perfil_name,
      rede_social: data.plataform,
      is_bot: vote === "Yes",
      notas: reason.join(", "),
      created_at: new Date().toISOString(),
    };

    sendEvaluationToBackend(evaluationData);
    setShowQuestionnaire(false);
    setVote(null);

    // Show feedback message
    setSuccessMessage("Thank you for your contribution!");
    setShowSuccessMessage(true);
    setHasVoted(true);
    // Hide the message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleLoginClick = (signUpMode = false) => {
    setIsSignUpMode(signUpMode);
    setShowLoginPage(true);
  };

  const handleBackToMain = () => {
    setShowLoginPage(false);
  };

  const handleSignUpClick = () => {
    handleLoginClick(true); // Open login page in signup mode
  };

  useEffect(() => {
    if (!showLoginPage) {
      setIsLoading(true);
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0) {
          console.log("Current URL:", tabs[0].url);

          // Adicione esta verificação para ignorar a página inicial
          if (tabs[0].url.includes("/home")) {
            setIsLoading(false);
            setData(null);
            return;
          }

          try {
            console.log("Fazendo requisição para obter dados do perfil...");
            setUrl(tabs[0].url);
            const profileData = await getProfileData(tabs[0].url);
            console.log("Data received from API:", profileData);
            setData(profileData);
          } catch (error) {
            console.error("Error fetching profile data:", error);
            setData(null);
          } finally {
            setIsLoading(false);
          }
        }
      });
    }
  }, [showLoginPage, showQuestionnaire]);

  useEffect(() => {
    chrome.storage.local.get("avatarUrl", (result) => {
      if (result.avatarUrl) {
        setImg(result.avatarUrl);
      }
    });
  
    const listener = (changes, area) => {
      if (area === "local" && changes.avatarUrl) {
        const newUrl = changes.avatarUrl.newValue;
        setImg(newUrl);
      }
    };
  
    chrome.storage.onChanged.addListener(listener);
  
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);
  
  useEffect(() => {
    console.log(1,img,url);
    
    if (img && url && data) {
      if (data.avatar_url) return;
      sendAvatarToBackend({
        url: url,
        avatar: img,
      });
    }
  }, [img,url,data]);

  useEffect(() => {
    if (data && isAuthenticated) {
      const checkUserVote = async () => {
        try {
          const voted = await getUserWasVote({username:data.perfil_name, platform:data.plataform});
          setHasVoted(voted);
        } catch (error) {
          console.error("Error checking if user has voted:", error);
        }
      };
  
      checkUserVote();
    }
  }, [data, isAuthenticated]);
  

  if (showLoginPage) {
    return (
        <Container>
          <Navbar
              onBack={handleBackToMain}
              showBackButton={true}
          />
          <Login
              onBackToHome={handleBackToMain}
              onAuthChange={handleAuthChange}
              initialMode={isSignUpMode}
          />
        </Container>
    );
  }

  return (
      <Container>
        <Navbar onSignUpClick={handleSignUpClick} />

        {showSuccessMessage && (
            <SuccessMessage>
              {successMessage}
            </SuccessMessage>
        )}

        <WebsiteLink>
          Visit our website for more details on this account.
        </WebsiteLink>

        <ContentWrapper>
          {isLoading ? (
              <LoadingPlaceholder>Loading profile data...</LoadingPlaceholder>
          ) : (
              data && (
                  <>
                    <SocialMediaProfile
                        imageUrl={img||"https://via.placeholder.com/50"}
                        accountType={data.plataform}
                        username={data.perfil_name}
                    />
                    <Divider />
                    <AiAnalysis
                        botPercentage={data.probability}
                        numberVotes={data.numberOfEvaluations}
                        badge={data.badge}
                    />
                  </>
              )
          )}

          {isAuthenticated ? (
              url && !url.includes("/home") ? (
                  // Lógica para páginas de perfil
                  <>
                    {/* Componentes de perfil existentes */}
                    {hasVoted ? (
                        <VotingContainer>
                          <TextContainer>
                            You have already voted for this profile.
                          </TextContainer>
                        </VotingContainer>
                    ) : !showQuestionnaire ? (
                        <VotingContainer>
                          <TextContainer>Is this profile AI?</TextContainer>
                          <ButtonContainer>
                            <Button $vote="Yes" onClick={() => handleVote("Yes")}>
                              Yes
                            </Button>
                            <Button $vote="No" onClick={() => handleVote("No")}>
                              No
                            </Button>
                          </ButtonContainer>
                        </VotingContainer>
                    ) : vote === "Yes" ? (
                        <QuestionnaireYes onSubmit={handleSubmitReason} />
                    ) : (
                        <QuestionnaireNo onSubmit={handleSubmitReason} />
                    )}

                    {/* Adicione o UserStatusContainer aqui para perfis */}
                    <UserStatusContainer>
                      <UserStatus>✓ You are currently logged in</UserStatus>
                      <LogoutButton onClick={handleLogout}>
                        Logout
                      </LogoutButton>
                    </UserStatusContainer>
                  </>
              ) : (
                  // Se estiver na página home, apenas mostra o status de login
                  <UserStatusContainer>
                    <UserStatus>✓ You are currently logged in</UserStatus>
                    <LogoutButton onClick={handleLogout}>
                      Logout
                    </LogoutButton>
                  </UserStatusContainer>
              )
          ) : (
              <div style={{ textAlign: 'center', margin: '24px 0' }}>
                <LoginButton onClick={() => handleLoginClick(false)}>
                  Login to Continue
                </LoginButton>
              </div>
          )}
        </ContentWrapper>
      </Container>
  );
};

export default HomePage;