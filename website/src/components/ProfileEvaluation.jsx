import React, { useState } from 'react';
import '../css/ProfileEvaluation.css';

const ProfileEvaluation = ({ evaluations = [] }) => {
    // Use the provided evaluations
    const allEvaluations = evaluations;

    // State to track how many evaluations to show
    const [visibleCount, setVisibleCount] = useState(6);
    // Track if user has expanded the list at least once
    const [hasExpanded, setHasExpanded] = useState(false);

    // Function to load more evaluations
    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + 6);
        setHasExpanded(true);
    };

    // Function to show fewer evaluations (6 at a time)
    const handleShowLess = () => {
        // Reduce by 6, but never go below 6
        setVisibleCount(prevCount => Math.max(6, prevCount - 6));
    };

    // Get only the evaluations to display based on current count
    const displayEvaluations = allEvaluations.slice(0, visibleCount);

    // Check if there are more evaluations to load
    const hasMoreToLoad = visibleCount < allEvaluations.length;

    // Check if we can show less (if we're showing more than 6)
    const canShowLess = visibleCount > 6;

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
        <div className="profile-evaluation-wrapper">
            <div className="profile-evaluation-container">
                {displayEvaluations.map(evaluation => (
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

                        {/* Show reasons list if no notas but has reasons array */}
                        {!evaluation.notas && evaluation.reasons && evaluation.reasons.length > 0 && (
                            <div className="evaluation-reasons">
                                <span className="reasons-label">Reason(s):</span>
                                <ul className="reasons-list">
                                    {evaluation.reasons.map((reason, index) => (
                                        <li key={index}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="load-more-container">
                {canShowLess && (
                    <button
                        className="load-less-button"
                        onClick={handleShowLess}
                    >
                        See Less
                    </button>
                )}

                {hasMoreToLoad && (
                    <button
                        className="load-more-button"
                        onClick={handleLoadMore}
                    >
                        See More
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProfileEvaluation;