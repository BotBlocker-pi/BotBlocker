import React, { useState, useEffect } from "react";
import Navbar from "../components/global/Navbar.jsx";
import SocialMediaProfile from "../components/profile/SocialMediaProfileInfo.jsx";
import AiAnalysis from "../components/profile/AiAnalysis.jsx";
import VotingSection from "../components/voting/VotingSection.jsx";
import Login from "../components/global/Login.jsx";
import {
  getProfileData,
  sendEvaluationToBackend,
  sendAvatarToBackend,
  getUserWasVote,
} from "../../api/data.jsx";
import { checkAuth } from "../../api/loginApi.jsx";
import { extractPerfilNameAndPlatformOfURL } from "../../utils/utils.jsx";
import "../css/pages/HomePage.css";

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

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatus = await checkAuth();
        setIsAuthenticated(authStatus);
        localStorage.setItem("isAuthenticated", JSON.stringify(authStatus));
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth) {
      setIsAuthenticated(JSON.parse(storedAuth));
    }

    checkAuthStatus();
  }, []);

  const handleAuthChange = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem("isAuthenticated", JSON.stringify(status));
    if (status) {
      setSuccessMessage("Successfully authenticated!");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleVote = (voteValue) => {
    setShowQuestionnaire(true);
    setVote(voteValue);
  };

  const handleBackToVote = () => {
    setVote(null);
    setShowQuestionnaire(false);
  };

  const handleSubmitReason = (reason) => {
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
    setSuccessMessage("Thank you for your contribution!");
    setShowSuccessMessage(true);
    setHasVoted(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleLoginClick = (signUpMode = false) => {
    setIsSignUpMode(signUpMode);
    setShowLoginPage(true);
  };

  const handleBackToMain = () => setShowLoginPage(false);
  const handleSignUpClick = () => handleLoginClick(true);

  useEffect(() => {
    if (!showLoginPage) {
      setIsLoading(true);
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0) {
          const currentUrl = tabs[0].url;

          if (
              currentUrl.includes("/home") ||
              currentUrl === "https://www.instagram.com/" ||
              currentUrl === "https://instagram.com/" ||
              currentUrl === "https://www.facebook.com/" ||
              currentUrl === "https://facebook.com/"
          ) {
            setIsLoading(false);
            setData(null);
            return;
          }

          try {
            setUrl(currentUrl);
            const profileData = await getProfileData(currentUrl);
            setData(profileData || extractPerfilNameAndPlatformOfURL(currentUrl));
          } catch (error) {
            console.error("Error fetching profile data:", error);
          } finally {
            setIsLoading(false);
          }
        }
      });
    }
  }, [showLoginPage, showQuestionnaire]);

  useEffect(() => {
    chrome.storage.local.get("avatarUrl", (result) => {
      if (result.avatarUrl) setImg(result.avatarUrl);
    });

    const listener = (changes, area) => {
      if (area === "local" && changes.avatarUrl) {
        setImg(changes.avatarUrl.newValue);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    if (img && url && data && !data.avatar_url) {
      sendAvatarToBackend({ url, avatar: img });
    }
  }, [img, url, data]);

  useEffect(() => {
    if (data && isAuthenticated) {
      const checkUserVote = async () => {
        try {
          const voted = await getUserWasVote({
            username: data.perfil_name,
            platform: data.plataform,
          });
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
        <div className="container">
          <Navbar onBack={handleBackToMain} showBackButton={true} />
          <Login
              onBackToHome={handleBackToMain}
              onAuthChange={handleAuthChange}
              initialMode={isSignUpMode}
          />
        </div>
    );
  }

  return (
      <div className="container">
        <Navbar
            onLoginClick={() => handleLoginClick(false)}
            isAuthenticated={isAuthenticated}
        />

        {showSuccessMessage && (
            <div className="success-message">{successMessage}</div>
        )}

        <div className="content-wrapper">
          {isLoading ? (
              <div className="loading-placeholder">Loading profile data...</div>
          ) : (
              data && (
                  <>
                    <SocialMediaProfile
                        imageUrl={img || "https://via.placeholder.com/50"}
                        accountType={data.plataform}
                        username={data.perfil_name}
                    />
                    <AiAnalysis
                        botPercentage={data.probability}
                        numberVotes={data.numberOfEvaluations}
                        badge={data.badge}
                    />
                  </>
              )
          )}

          {isAuthenticated && url && !url.includes("/home") ? (
              <VotingSection
                  vote={vote}
                  showQuestionnaire={showQuestionnaire}
                  onVote={handleVote}
                  onSubmitReason={handleSubmitReason}
                  hasVoted={hasVoted}
                  handleBackToVote={handleBackToVote}
              />
          ) : !isAuthenticated ? (
              <div style={{ textAlign: "center", margin: "24px 0" }}>
                <button className="login-button" onClick={() => handleLoginClick(false)}>
                  Log In to Vote
                </button>
              </div>
          ) : null}
        </div>
      </div>
  );
};

export default HomePage;
