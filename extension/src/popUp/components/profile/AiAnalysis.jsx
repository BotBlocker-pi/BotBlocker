import React from 'react';
import '../../css/components/profile/AIAnalysis.css';
import BotBadge from '../../../assets/badges/botBadge.png';
import HumanBadge from '../../../assets/badges/humanBadge.png';
import UnknownBadge from '../../../assets/badges/unknownBadge.png';

const AiAnalysis = ({ botPercentage, numberVotes, badge }) => {
    const formattedPercentage = parseFloat(botPercentage).toFixed(2);

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
        default:
            badgeSrc = UnknownBadge;
            tooltipMessage = "The status of this account is unknown.";
    }

    return (
        <>
            <div className="ai-analysis-container">
                <div className="ai-text-container">
                    <span className="ai-percentage">{formattedPercentage}% chance of being AI</span>
                    <span className="ai-votes">({numberVotes} votes)</span>
                </div>
                <div className="ai-badge-container">
                    <img className="ai-badge" src={badgeSrc} alt="Badge" />
                    <div className="ai-tooltip">{tooltipMessage}</div>
                </div>
            </div>
            <p className="ai-analysis-note">Visit our website for more details on this account.</p>
        </>
    );
};

export default AiAnalysis;
