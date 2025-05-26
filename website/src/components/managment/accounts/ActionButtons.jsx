import React, { useState, useEffect } from 'react';
import { banUser, unbanUser, promoteUser } from "../../../api/data.jsx";
import '../../../css/managment/accounts/ActionButton.css';

const ActionButtons = ({
                           username,
                           userId,
                           role,
                           status,
                           onTimeoutClick,
                           onEvaluationsClick,
                           setMessage
                       }) => {
    const [localStatus, setLocalStatus] = useState(status);
    const [localRole, setLocalRole] = useState(role);

    useEffect(() => {
        setLocalStatus(status);
    }, [status]);

    const handleBanToggle = async () => {
        try {
            if (localStatus === 'banned') {
                const res = await unbanUser(userId);
                if (res) {
                    setLocalStatus('active');
                    setMessage({ type: 'success', text: `✅ ${username} has been unbanned.` });
                }
            } else {
                const res = await banUser(userId, 'Manual action from UI');
                if (res) {
                    setLocalStatus('banned');
                    setMessage({ type: 'success', text: `🚫 ${username} has been banned.` });
                }
            }
        } catch (err) {
            console.error('Error toggling ban:', err);
            setMessage({
                type: 'error',
                text: `❌ Failed to ${localStatus === 'banned' ? 'unban' : 'ban'} ${username}.`
            });
        }
    };

    const handlePromote = async () => {
        if (localRole === 'admin' || localRole === 'verifier') {
            setMessage({
                type: 'error',
                text: `⚠️ ${localRole.charAt(0).toUpperCase() + localRole.slice(1)}s cannot be promoted.`
            });
            return;
        }


        const res = await promoteUser(userId);

        if (res) {
            setLocalRole('verifier');
            setMessage({
                type: 'success',
                text: `⭐ ${username} has been promoted to verifier.`
            });
        } else {
            console.error(`❌ Error promoting user ${username}`);
            setMessage({
                type: 'error',
                text: `❌ Error promoting ${username}.`
            });
        }
    };

    return (
        <div className="action-buttons">
            <button onClick={() => onEvaluationsClick(userId, username)} className="eval-button">
                🧾 Evaluations History
            </button>

            <button
                onClick={() => onTimeoutClick(userId, username)}
                className={`timeout-button ${localStatus === 'banned' ? 'disabled' : ''}`}
                disabled={localStatus === 'banned'}
            >
                ⏱️ Time-out
            </button>

            <button
                onClick={handleBanToggle}
                className={`ban-button ${localStatus === 'timeout' ? 'disabled' : ''}`}
                disabled={localStatus === 'timeout'}
            >
                {localStatus === 'banned' ? '♻️ Unban' : '🚫 Ban'}
            </button>

            <button
                onClick={handlePromote}
                className={`promote-button ${localStatus !== 'active' || localRole === 'admin' || localRole === 'verifier' ? 'disabled' : ''}`}
                disabled={localStatus !== 'active' || localRole === 'admin' || localRole === 'verifier'}
            >
                ⭐ Promote
            </button>

            <div className="moderation-status">
                {localStatus === 'banned' && <p style={{ color: 'red' }}>Banned</p>}
                {localStatus === 'timeout' && <p style={{ color: 'orange' }}>Timeout active</p>}
                {localStatus === 'active' && <p style={{ color: 'green', marginTop: '3px' }}>Active</p>}
            </div>
        </div>
    );
};

export default ActionButtons;
