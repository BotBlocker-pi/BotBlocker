import React, { useState, useEffect } from 'react';
import '../css/ActionButton.css';
import { banUser,unbanUser } from "../api/data";
const ActionButtons = ({ username, userId, role, status, onTimeoutClick  }) => {
    const [localStatus, setLocalStatus] = useState(status);
      useEffect(() => {
            setLocalStatus(status);
    }, [status]);

    const handleEvaluations = () => {
        console.log(`View evaluations for ${username}`);
    };

    const handleTimeout = () => {
        console.log(`Timeout triggered for ${username}`);
    };


  const handleBanToggle = async () => {
    try {
      if (localStatus === 'banned') {
        const res = await unbanUser(userId);
        if (res) {
          alert(`✅ ${username} has been unbanned.`);
          setLocalStatus('active');
        }
      } else {
        const res = await banUser(userId, 'Manual action from UI');
        if (res) {
          alert(`🚫 ${username} has been banned.`);
          setLocalStatus('banned');
        }
      }
    } catch (err) {
      console.error('Error toggling ban:', err);
      alert(`⚠️ Failed to ${localStatus === 'banned' ? 'unban' : 'ban'} ${username}.`);
    } finally {
    }
  };

    const handlePromote = async () => {
        if (role === 'admin' || role === 'verifier') {
            alert(`${role.charAt(0).toUpperCase() + role.slice(1)}s cannot be promoted.`);
            return;
        }

        try {
            const response = await fetch(`http://localhost/api/update_user/${userId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: 'admin' }),
            });

            if (!response.ok) {
                throw new Error('Failed to promote user.');
            }

            const data = await response.json();
            alert(`✅ ${username} has been promoted to admin.`);
        } catch (err) {
            console.error('Error promoting user:', err);
            alert('⚠️ An error occurred while promoting the user.');
        }
    };


    return (
        <div className="action-buttons">
            <button onClick={handleEvaluations} className="eval-button">
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
                onClick={() => handleBanToggle()}
                className={`ban-button ${localStatus === 'timeout' ? 'disabled' : ''}`}
                disabled={localStatus === 'timeout'}
            >
                {localStatus === 'banned' ? '♻️ Unban' : '🚫 Ban'}
            </button>

            <button
                onClick={handlePromote}
                className={`promote-button ${localStatus !== 'active' || role === 'admin' || role === 'verifier' ? 'disabled' : ''}`}
                disabled={localStatus !== 'active' || role === 'admin' || role === 'verifier'}
            >
                ⭐ Promote
            </button>

            <div className="moderation-status">
                {localStatus === 'banned' && <p style={{ color: 'red' }}>Banned</p>}
                {localStatus === 'timeout' && <p style={{ color: 'orange' }}>Timeout active</p>}
                {localStatus === 'active' && <p style={{ color: 'green' }}>Active</p>}
            </div>

        </div>
    );
};

export default ActionButtons;
