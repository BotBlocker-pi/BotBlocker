import React from 'react';
import '../css/ProfileEvaluation.css';

const ProfileEvaluation = ({ evaluations = [] }) => {
    // Function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Function to format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="profile-evaluation-container">
            {evaluations.map(evaluation => (
                <div key={evaluation.id} className="evaluation-item">
                    <div className="evaluation-header">
                        <span className="evaluator-name">{evaluation.user}</span>
                    </div>

                    <div className="evaluation-conclusion">
                        <span className={`conclusion-text ${evaluation.is_bot ? 'bot' : 'human'}`}>
                            Considered this profile {evaluation.is_bot ? 'a bot' : 'a human'}.
                        </span>
                    </div>

                    <div className="evaluation-date-time">
                        On {formatDate(evaluation.created_at)} · {formatTime(evaluation.created_at)}
                    </div>

                    {/* {evaluation.reasons && evaluation.reasons.length > 0 && (
                        <div className="evaluation-reasons">
                            <span className="reasons-label">Reason(s):</span>
                            <ul className="reasons-list">
                                {evaluation.reasons.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    )} */}
                    {evaluation.notas && (
                        <div className="evaluation-reasons">
                            <span className="reasons-label">Reason(s):</span>
                            <ul className="reasons-list">
                                <li>{evaluation.notas.replace(/Other:*/i, "")}</li>

                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProfileEvaluation;