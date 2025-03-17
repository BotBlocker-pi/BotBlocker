import React from 'react';
import Navbar from '../components/popUp/Navbar.jsx';
import styled from "styled-components";
import SocialMediaProfile from "../components/popUp/SocialMediaProfileInfo.jsx";
import AiAnalysis from "../components/popUp/AiAnalysis.jsx";

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
    return (
        <div>
            <Navbar />

            <WebsiteLink>Visit our website for more details on this account.</WebsiteLink>

            <SocialMediaProfile
                imageUrl="https://via.placeholder.com/50"
                accountType="Type Account"
                username="@username"
            />

            <AiAnalysis
                botPercentage={88}
                numberVotes={97}
                badge="bot"
            />
        </div>
    );
};

export default HomePage;