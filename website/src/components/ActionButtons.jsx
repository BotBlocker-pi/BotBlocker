import React from 'react';
import '../css/ActionButton.css';

const ActionButtons = ({ username, userId, role }) => {

    const handleEvaluations = () => {
        console.log(`View evaluations for ${username}`);
    };

    const handleTimeout = () => {
        console.log(`Timeout triggered for ${username}`);
    };

    const handleBan = () => {
        console.log(`Ban triggered for ${username}`);
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
            <button onClick={handleTimeout} className="timeout-button">
                ⏱️ Time-out
            </button>
            <button onClick={handleBan} className="ban-button">
                🚫 Ban
            </button>
            <button onClick={handlePromote} className="promote-button">
                ⭐ Promote
            </button>
        </div>
    );
};

export default ActionButtons;
