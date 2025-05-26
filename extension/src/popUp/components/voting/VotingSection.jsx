import React from "react";
import QuestionnaireYes from "./QuestionnaireYes";
import QuestionnaireNo from "./QuestionnaireNo";
import "../../css/components/voting/VotingSection.css";

const VotingSection = ({
                           vote,
                           showQuestionnaire,
                           onVote,
                           onSubmitReason,
                           hasVoted,
                           handleBackToVote
                       }) => {
    if (hasVoted) {
        return (
            <div className="voting-container">
                <div className="text-container">You have already voted for this profile.</div>
            </div>
        );
    }

    if (!showQuestionnaire) {
        return (
            <div className="voting-container">
                <div className="text-container">Is this profile AI?</div>
                <div className="button-container">
                    <button className="vote-button yes" onClick={() => onVote("Yes")}>Yes</button>
                    <button className="vote-button no" onClick={() => onVote("No")}>No</button>
                </div>
            </div>
        );
    }

    return (
        <div className="voting-container">
            {vote === "Yes" ? (
                <QuestionnaireYes onSubmit={onSubmitReason} onBack={handleBackToVote} />
            ) : (
                <QuestionnaireNo onSubmit={onSubmitReason} onBack={handleBackToVote} />
            )}
        </div>
    );
};

export default VotingSection;