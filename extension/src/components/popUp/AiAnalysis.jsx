import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import BotBadge from '../../assets/badges/botBadge.png';
import HumanBadge from '../../assets/badges/humanBadge.png';
import UnknownBadge from '../../assets/badges/unknownBadge.png';

const AiAnalysisContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 5px;
    margin: 0;
`;

const TextContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const Percentage = styled.span`
    font-size: 24px;
    font-weight: bold;
    color: #333;
`;

const Votes = styled.span`
    font-size: 14px;
    color: #666;
`;

const BadgeContainer = styled.div`
    position: relative;
    display: inline-block;
`;

const Badge = styled.img`
    width: 50px;
    height: 50px;
    cursor: pointer; 
`;

const Tooltip = styled.div`
    visibility: hidden;
    width: 120px;
    background-color: #566C98;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 90%;
    left: 50%;
    transform: translateX(-70%); 
    opacity: 0;
    transition: opacity 0.3s;

    ${BadgeContainer}:hover & {
        visibility: visible;
        opacity: 1;
    }
`;

const AiAnalysis = ({ botPercentage, numberVotes, badge }) => {
    let badgeSrc, tooltipMessage;
    switch (badge) {
        case 'bot':
            badgeSrc = BotBadge;
            tooltipMessage = "Our specialists verified this account as a bot.";
            break;
        case 'human':
            badgeSrc = HumanBadge;
            tooltipMessage = "Our specialists verified this account as a human.";
            break;
        case 'empty':
            badgeSrc = UnknownBadge;
            tooltipMessage = "The status of this account is unknown.";
            break;
        default:
            badgeSrc = UnknownBadge;
            tooltipMessage = "The status of this account is unknown.";
    }

    return (
        <AiAnalysisContainer>
            {/* Textos: Porcentagem e votos */}
            <TextContainer>
                <Percentage>{botPercentage}% chance of being AI</Percentage>
                <Votes>({numberVotes} votes)</Votes>
            </TextContainer>

            {/* Badge com tooltip personalizado */}
            <BadgeContainer>
                <Badge src={badgeSrc} alt="Badge" />
                <Tooltip>{tooltipMessage}</Tooltip>
            </BadgeContainer>
        </AiAnalysisContainer>
    );
};

export default AiAnalysis;