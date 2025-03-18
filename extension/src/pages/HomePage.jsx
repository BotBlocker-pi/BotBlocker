import React, { useState, useEffect } from "react";
import Navbar from "../components/popUp/Navbar.jsx";
import styled from "styled-components";
import SocialMediaProfile from "../components/popUp/SocialMediaProfileInfo.jsx";
import AiAnalysis from "../components/popUp/AiAnalysis.jsx";
import getProfileData from "../api/api.jsx";
import QuestionnaireYes from "../components/popUp/voting/QuestionnaireYes.jsx";

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
  const [vote, setVote] = useState("Yes")

  const handleVote = (vote) => {
    console.log(`User voted: ${vote}`);
    setShowQuestionnaire(true); // Show the questionnaire after voting
    if (vote === "Yes"){
      setAnswerYes(true);
    }else{
      setAnswerNo(true)
    }
  };

  const handleSubmitReason = (reason) => {
    console.log(`Selected reason: ${reason}`);
    setShowQuestionnaire(false); // Hide the questionnaire after submission
    setAnswerNo(false);
    setAnswerYes(false)
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length > 0) {
        console.log(tabs[0].url);
        try {
          const profileData = await getProfileData(tabs[0].url);
          setData(profileData);
          console.log(profileData);
        } catch (error) {
          console.error("Error getting profile data:", error);
        }
      }
    });
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
        ) : (
            <QuestionnaireYes onSubmit={handleSubmitReason} />
        )}

        <WebsiteLink>
          Visit our website for more details on this account.
        </WebsiteLink>
      </Container>
  );
};

export default HomePage;