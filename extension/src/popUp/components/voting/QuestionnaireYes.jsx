import React, { useState } from "react";
import "../../css/components/voting/Questionnaire.css";

const QuestionnaireYes = ({ onSubmit, onBack }) => {
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [otherReason, setOtherReason] = useState("");

    const handleReasonSelect = (reason) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(selectedReasons.filter((r) => r !== reason));
        } else {
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    const handleSubmit = () => {
        if (selectedReasons.includes("Other") && otherReason.trim() === "") {
            alert("Please specify the reason for selecting 'Other'.");
            return;
        }

        const reasonsToSubmit = selectedReasons.includes("Other")
            ? [...selectedReasons.filter((r) => r !== "Other"), `Other: ${otherReason}`]
            : selectedReasons;

        onSubmit(reasonsToSubmit);
    };

    return (
        <div className="questionnaire-container">
            <div className="question-header">
                <button className="question-back-button" onClick={onBack}>Back</button>
                <p className="question-text">Reason?</p>
            </div>

            {["Inconsistency", "Unnatural posting patterns", "Lacking quality and uniqueness", "Lack of engagement", "Other"].map((reason) => (
                <label key={reason} className="option-label">
                    <input
                        type="checkbox"
                        checked={selectedReasons.includes(reason)}
                        onChange={() => handleReasonSelect(reason)}
                    />
                    {reason}
                </label>
            ))}

            {selectedReasons.includes("Other") && (
                <input
                    className="other-input"
                    type="text"
                    placeholder="Please specify the reason..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                />
            )}

            <button className="submit-button" onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default QuestionnaireYes;
