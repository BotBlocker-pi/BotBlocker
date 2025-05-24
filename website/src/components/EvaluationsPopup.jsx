import React, { useEffect, useState } from 'react';
import '../css/VerificationSection.css';
import { getUserEvaluations } from '../api/data';

const EvaluationsPopup = ({ userId, username, onClose }) => {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleEvaluations, setVisibleEvaluations] = useState(6);

    useEffect(() => {
        const fetchEvaluations = async () => {
            const data = await getUserEvaluations(userId);
            setEvaluations(data);
            setLoading(false);
        };

        fetchEvaluations();
    }, [userId]);


    const handleSeeMore = () => setVisibleEvaluations(prev => prev + 6);
    const handleSeeLess = () => setVisibleEvaluations(prev => Math.max(6, prev - 6));

    const formattedEvaluations = evaluations.map(ev => {
        const date = new Date(ev.created_at);
        return {
            ...ev,
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    });

    return (
        <div className="evaluations-popup-overlay" onClick={onClose}>
            <div className="profile-container" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>

                <div className="profile-header">
                    <h1>Evaluations by @{username}</h1>
                    <p className="subtitle">These are evaluations submitted by this user</p>
                </div>

                {loading ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Loading evaluations...</p>
                    </div>
                ) : evaluations.length === 0 ? (
                    <div className="error-message">This user has not submitted any evaluations yet.</div>
                ) : (
                    <>
                        <div className="evaluations-section">
                            <h2 className="evaluations-title">Recent Evaluations</h2>
                            <div className="evaluations-grid">
                                {formattedEvaluations.slice(0, visibleEvaluations).map((evaluation, index) => (
                                    <div key={index} className="evaluation-card">
                                        <div className="evaluator-name">Profile: {evaluation.profile_username}</div>
                                        <div className={`evaluation-result ${evaluation.is_bot ? 'bot' : 'human'}`}>
                                            Marked as {evaluation.is_bot ? 'Bot' : 'Human'}
                                        </div>
                                        <div className="evaluation-date">
                                            On {evaluation.date} at {evaluation.time}
                                        </div>
                                        <div className="evaluation-reason">
                                            <div>Reason(s):</div>
                                            <ul>
                                                {evaluation.notas.split('\n').map((r, i) => (
                                                    <li key={i}>{r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="actions-container">
                                {visibleEvaluations > 6 && (
                                    <button className="action-button see-less-button" onClick={handleSeeLess}>
                                        See Less
                                    </button>
                                )}
                                {visibleEvaluations < evaluations.length && (
                                    <button className="action-button see-more-button" onClick={handleSeeMore}>
                                        See More
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EvaluationsPopup;
