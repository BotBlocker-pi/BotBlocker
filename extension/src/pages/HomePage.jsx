import React from "react";
import Navbar from "../components/popUp/Navbar.jsx";
import styled from "styled-components";
import SocialMediaProfile from "../components/popUp/SocialMediaProfileInfo.jsx";
import AiAnalysis from "../components/popUp/AiAnalysis.jsx";
import { useState, useEffect } from "react";
import getProfileData from "../api/api.jsx";

const WebsiteLink = styled.p`
    font-size: 14px;
    color: black;
    text-decoration: underline;
    margin: 0;
    text-align: center;
    padding-top: 15px;
    padding-bottom: 15px;
`;

const HomePage = () => {
  const [data, setData] = useState(null);

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


// Função para buscar dados protegidos da API
const fetchProtectedData = () => {
  // Obtém o token armazenado no Chrome
  chrome.storage.local.get("accessToken", (data) => {
    if (data.accessToken) {
      // Faz uma requisição GET à API protegida
      fetch("http://localhost:8000/api/v1/protected/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${data.accessToken}`, // Envia o token no cabeçalho
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json()) // Converte a resposta para JSON
      .then(data => console.log("✅ Dados protegidos:", data)) // Exibe os dados no console
      .catch(error => console.error("❌ Erro ao acessar a view protegida:", error)); // Captura e exibe erros
    } else {
      console.error("❌ Nenhum token encontrado.");
    }
  });
};

// Chama a função automaticamente ao abrir a extensão
// fetchProtectedData();

  
  return (
    <div>
      <Navbar />

      <WebsiteLink>
        Visit our website for more details on this account.
      </WebsiteLink>
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

    </div>
  );
};

export default HomePage;
