import React from 'react';
import '../../css/search/AIAnalysis.css';
// Import placeholder paths - replace these with your actual paths
import BotBadge from '../../assets/badges/botBadge.png';
import HumanBadge from '../../assets/badges/humanBadge.png';
import UnknownBadge from '../../assets/badges/unknownBadge.png';

const AIAnalysis = ({ aiPercentage, votes, badge, username, socialMedia}) => {
    // Frontend-only logic for badge selection
    let badgeSrc, badgeMessage;

    switch (badge) {
        case 'bot':
            badgeSrc = BotBadge;
            badgeMessage = "Our specialists verified this account as a bot.";
            break;
        case 'human':
            badgeSrc = HumanBadge;
            badgeMessage = "Our specialists verified this account as a human";
            break;
        default:
            badgeSrc = UnknownBadge;
            badgeMessage = "The status of this account is unknown.";
    }

    return (
        <div className="ai-analysis-container">
            <h2 className="ai-analysis-title">AI analysis</h2>

            <div className="social-username">
                <span className="social-platform">{socialMedia}</span>
                <span className="username-display">@{username}</span>
            </div>

            <div className="ai-analysis-content">
                <div className="left-section">
                    <div className="percentage-row">
                        <span className="percentage-text">{aiPercentage}%</span>
                        <span className="chance-text">chance of being AI</span>
                    </div>
                    <div className="votes-count">({votes} votes)</div>
                </div>

                <div className="verification-container">
                    <div className="badge-icon">
                        <img src={badgeSrc} alt={`${badge} badge`} className="badge-image" />
                    </div>
                    <div className="verification-text">
                        <p>{badgeMessage}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAnalysis;