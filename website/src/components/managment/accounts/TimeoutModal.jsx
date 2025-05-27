import React, { useEffect, useState } from 'react';
import { applyTimeout, revokeTimeout, getUserTimeouts } from '../../../api/data.jsx';
import '../../../css/managment/accounts/TimeoutModal.css';

const TimeoutModal = ({ userId, username, onClose, onFeedback }) => {
    const [timeouts, setTimeouts] = useState([]);
    const [duration, setDuration] = useState(3600);
    const [loading, setLoading] = useState(false);

    const timeoutOptions = [
        { label: '1 hour', seconds: 3600 },
        { label: '6 hours', seconds: 21600 },
        { label: '24 hours', seconds: 86400 },
        { label: '30 days', seconds: 30 * 86400 },
    ];

    const fetchTimeouts = async () => {
        const data = await getUserTimeouts(userId);
        if (data) {
        setTimeouts(data);
        }
    };

    useEffect(() => {
        fetchTimeouts();
    }, [userId]);

    const activeTimeout = timeouts.find(t => t.is_active);
    const recentTimeouts = timeouts.slice(0, 4);

    const handleApply = async () => {
        setLoading(true);
        try {
            await applyTimeout(userId, duration);
            onFeedback({ type: 'success', text: '⏱️ Timeout applied successfully.' });
            fetchTimeouts();
        } catch {
            onFeedback({ type: 'error', text: '⚠️ Failed to apply timeout.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async () => {
        setLoading(true);
        try {
            await revokeTimeout(userId);
            onFeedback({ type: 'success', text: '✅ Timeout revoked successfully.' });
            fetchTimeouts();
        } catch {
            onFeedback({ type: 'error', text: '❌ Failed to revoke timeout.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="timeout-popup-overlay" onClick={onClose}>
            <div className="timeout-popup" onClick={e => e.stopPropagation()}>
                <div className="popup-header">
                    <h3>Timeout: @{username}</h3>
                    <button onClick={onClose}>×</button>
                </div>

                {activeTimeout ? (
                    <div>
                        <p><strong>Active Timeout</strong></p>
                        <p>Ends at: {new Date(activeTimeout.end_time).toLocaleString()}</p>
                        <button className="revoke-button" onClick={handleRevoke} disabled={loading}>Revoke</button>
                    </div>
                ) : (
                    <div>
                        <p><strong>No active timeout</strong></p>
                        <div className="duration-options">
                            {timeoutOptions.map(opt => (
                                <button
                                    key={opt.seconds}
                                    onClick={() => setDuration(opt.seconds)}
                                    className={duration === opt.seconds ? "selected" : ""}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <button className="apply-button" onClick={handleApply} disabled={loading}>Apply</button>
                    </div>
                )}

                <div className="timeout-history">
                    <h4>Recent Timeouts</h4>
                    {recentTimeouts.length === 0 ? (
                        <p style={{ fontStyle: 'italic' }}>No timeouts applied yet.</p>
                    ) : (
                        <ul>
                            {recentTimeouts.map(t => (
                                <li key={t.id}>
                                    <strong>{new Date(t.start_time).toLocaleString()}</strong> — {Math.floor(t.duration / 60)} min — {t.is_active ? '🟢 Active' : '⚪ Inactive'}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeoutModal;
