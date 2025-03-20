import React, { useState, useEffect } from "react";
import Navbar from "../components/popUp/Navbar.jsx";
import styled from "styled-components";
import SocialMediaProfile from "../components/popUp/SocialMediaProfileInfo.jsx";
import AiAnalysis from "../components/popUp/AiAnalysis.jsx";
import getProfileData from "../api/api.jsx";
import QuestionnaireYes from "../components/popUp/voting/QuestionnaireYes.jsx";
import QuestionnaireNo from "../components/popUp/voting/QuestionnaireNo.jsx";

const Container = styled.div`
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding-bottom: 20px;
`;

const WebsiteLink = styled.p`
  font-size: 14px;
  color: #007bff;
  text-decoration: underline;
  margin: 0;
  text-align: center;
  padding-top: 20px;
  cursor: pointer;

  &:hover {
    color: #0056b3;
  }
`;

const VotingContainer = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 15px;
`;

const Button = styled.button`
  padding: 10px 40px;
  font-size: 16px;
  color: black;
  border: 1px solid black;
  border-radius: 100px;
  cursor: pointer;
  width: 120px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:active {
    background-color: #004080;
  }
`;

const TextContainer = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 20px;
`;

const HomePage = () => {
  const [data, setData] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [vote, setVote] = useState(null);

  const handleVote = (vote) => {
    console.log(`[handleVote] User voted: ${vote}`);
    setShowQuestionnaire(true); // Show the questionnaire after voting
    setVote(vote); // Set the user's vote
  };

  const sendEvaluationToBackend = async (evaluationData) => {
    console.log("[sendEvaluationToBackend] Sending evaluation data:", evaluationData);
    try {
      const response = await fetch("http://localhost:8000/avaliacao/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evaluationData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit evaluation");
      }

      const result = await response.json();
      console.log("[sendEvaluationToBackend] Evaluation submitted successfully:", result);
    } catch (error) {
      console.error("[sendEvaluationToBackend] Error submitting evaluation:", error);
    }
  };

  const handleSubmitReason = (reason) => {
    console.log(`[handleSubmitReason] Selected reason: ${reason}`);

    // Prepare the evaluation data
    const evaluationData = {
      user: "current_user_name", // Replace with the actual user name or ID
      profile: data.perfil_name, // Use the profile name from the data
      rede_social: data.plataform, // Use the platform from the data
      is_bot: vote === "Yes", // Set is_bot to true if the user voted "Yes"
      notas: reason.join(", "), // Convert the array of reasons to a string
      created_at: new Date().toISOString(), // Add the current timestamp
    };

    // Send the evaluation data to the backend
    sendEvaluationToBackend(evaluationData);

    // Reset the state
    setShowQuestionnaire(false);
    setVote(null);
  };

  const fetchProfileData = async (url) => {
    console.log("[fetchProfileData] Fetching profile data for URL:", url);
    try {
      const profileData = await getProfileData(url);
      console.log("[fetchProfileData] Profile data fetched:", profileData);
      setData(profileData);
    } catch (error) {
      console.error("[fetchProfileData] Error getting profile data:", error);
    }
  };

  const hideProfilePosts = (profileName) => {
    console.log(`[hideProfilePosts] Hiding posts for profile: ${profileName}`);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        console.log(`[hideProfilePosts] Injecting script into tab ${tabId}`);
        chrome.scripting.executeScript({
          target: { tabId },
          func: (profileName) => {
            console.log(`[hideProfilePosts - Injected Script] Hiding posts for profile: ${profileName}`);
            // Lógica para ocultar os posts do perfil
            const posts = document.querySelectorAll('[data-testid="tweet"]'); // Seleciona todos os tweets
            console.log(`[hideProfilePosts - Injected Script] Found ${posts.length} posts`);
            posts.forEach((post) => {
              const postAuthor = post.querySelector('[data-testid="User-Name"]'); // Seleciona o autor do tweet
              if (postAuthor && postAuthor.innerText.includes(profileName)) {
                console.log(`[hideProfilePosts - Injected Script] Removing post by ${profileName}`);
                post.remove(); // Remove o post do DOM
              }
            });
          },
          args: [profileName], // Passa o nome do perfil como argumento
        });
      } else {
        console.error("[hideProfilePosts] No active tab found");
      }
    });
  };

  useEffect(() => {
    console.log("[useEffect] Setting up tab update listener");
    const handleTabUpdate = (tabId, changeInfo, tab) => {
      console.log(`[handleTabUpdate] Tab updated - Tab ID: ${tabId}, Change Info:`, changeInfo);
      // Verifica se o URL mudou e se a aba está ativa
      if (changeInfo.url && tab.active) {
        console.log(`[handleTabUpdate] URL changed to: ${changeInfo.url}`);
        fetchProfileData(changeInfo.url);

        // Verifica se o perfil é o que queremos ocultar (ex: elonmusk)
        const profileName = "elonmusk"; // Nome do perfil a ser ocultado
        const currentProfile = changeInfo.url.split("/")[3]; // Extrai o nome do perfil da URL
        console.log(`[handleTabUpdate] Current profile: ${currentProfile}`);
        if (currentProfile === profileName) {
          console.log(`[handleTabUpdate] Hiding posts for profile: ${profileName}`);
          hideProfilePosts(profileName); // Oculta os posts do perfil
        }
      }
    };

    // Busca os dados iniciais
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        console.log(`[useEffect] Initial tab URL: ${tabs[0].url}`);
        fetchProfileData(tabs[0].url);

        // Verifica se o perfil é o que queremos ocultar (ex: elonmusk)
        const profileName = "elonmusk"; // Nome do perfil a ser ocultado
        const currentProfile = tabs[0].url.split("/")[3]; // Extrai o nome do perfil da URL
        console.log(`[useEffect] Initial profile: ${currentProfile}`);
        if (currentProfile === profileName) {
          console.log(`[useEffect] Hiding posts for profile: ${profileName}`);
          hideProfilePosts(profileName); // Oculta os posts do perfil
        }
      } else {
        console.error("[useEffect] No active tab found");
      }
    });

    // Adiciona o listener para atualizações de URL
    chrome.tabs.onUpdated.addListener(handleTabUpdate);

    // Remove o listener quando o componente é desmontado
    return () => {
      console.log("[useEffect] Cleaning up tab update listener");
      chrome.tabs.onUpdated.removeListener(handleTabUpdate);
    };
  }, []);

  return (
    <Container>
      <Navbar />
      {data && (
        <>
          <SocialMediaProfile
            imageUrl="https://via.placeholder.com/50"
            accountType={data.plataform}
            username={data.perfil_name}
          />

          <AiAnalysis
            botPercentage={data.probability}
            numberVotes={data.numberOfEvaluations}
            badge={data.badge}
          />
        </>
      )}

      {!showQuestionnaire ? (
        <VotingContainer>
          <TextContainer>Is this profile AI?</TextContainer>
          <ButtonContainer>
            <Button onClick={() => handleVote("Yes")}>Yes</Button>
            <Button onClick={() => handleVote("No")}>No</Button>
          </ButtonContainer>
        </VotingContainer>
      ) : vote === "Yes" ? (
        <QuestionnaireYes onSubmit={handleSubmitReason} />
      ) : (
        <QuestionnaireNo onSubmit={handleSubmitReason} />
      )}

      <WebsiteLink>
        Visit our website for more details on this account.
      </WebsiteLink>
    </Container>
  );
};

export default HomePage;