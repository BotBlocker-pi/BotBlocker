import React, { useState } from 'react';
import '../../css/search/ProfileEvaluation.css';

const ProfileEvaluation = ({ evaluations = [] }) => {
    // State to track visible evaluations (9 at a time)
    const [visibleEvaluations, setVisibleEvaluations] = useState(9);

    // Function to show more evaluations
    const handleSeeMore = () => {
        setVisibleEvaluations(prevCount => prevCount + 9);
    };

    // Function to show fewer evaluations
    const handleSeeLess = () => {
        // Reduce visible evaluations by 9, but never below 9
        setVisibleEvaluations(prevCount => Math.max(9, prevCount - 9));
    };

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

    // Check if there are more evaluations to show
    const hasMoreEvaluations = evaluations.length > visibleEvaluations;

    return (
        <div className="profile-evaluation-wrapper">
            <div className="profile-evaluation-container">
                {evaluations.slice(0, visibleEvaluations).map(evaluation => (
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

            {(hasMoreEvaluations || visibleEvaluations > 9) && (
                <div className="actions-container">
                    {visibleEvaluations > 9 && (
                        <button className="action-button see-less-button" onClick={handleSeeLess}>
                            See Less
                        </button>
                    )}
                    {hasMoreEvaluations && (
                        <button className="action-button see-more-button" onClick={handleSeeMore}>
                            See More
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileEvaluation;