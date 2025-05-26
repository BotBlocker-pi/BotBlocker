import React from 'react';
import '../../css/search/ProfileInfo.css';
import AIAnalysis from './AIAnalysis.jsx';
import ProfileEvaluation from './ProfileEvaluation.jsx';

const ProfileInfo = ({
                         aiPercentage = 15,
                         votes = 105,
                         badge = 'human',
                         username = "elonmusk",
                         socialMedia = "Twitter",
                         evaluations = [],
                         onClose
                     }) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="profile-container">
            <button className="close-button" onClick={handleClose}>×</button>

            <div className="profile-header">
                <h1>Profile Found</h1>
                <p className="subtitle">Check its analysis</p>
            </div>

            <AIAnalysis
                aiPercentage={aiPercentage}
                votes={votes}
                badge={badge}
                username={username}
                socialMedia={socialMedia}
            />

            <div className="evaluations-section">
                <h2 className="evaluations-title">Latest evaluations</h2>
                <ProfileEvaluation evaluations={evaluations} />
            </div>
        </div>
    );
};

export default ProfileInfo;