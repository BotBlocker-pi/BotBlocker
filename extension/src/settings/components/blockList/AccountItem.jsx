import React, { useState } from 'react';
import '../../css/components/blocklist/AccountItem.css';

const AccountItem = ({ account, onUnblock }) => {
    const [isUnblocking, setIsUnblocking] = useState(false);

    const handleUnblock = async () => {
        if (isUnblocking) return;

        try {
            setIsUnblocking(true);
            await onUnblock();
        } catch (error) {
            console.error('Error unblocking account:', error);
        } finally {
            setIsUnblocking(false);
        }
    };

    return (
        <div className="account-item-container">
            <div className="account-info">
                <div className="account-details">
                    <span className="account-type">{account.type}</span>
                    <span className="account-name">@{account.username}</span>
                </div>
            </div>
            <button
                className={`unblock-button ${isUnblocking ? 'disabled' : ''}`}
                onClick={handleUnblock}
                disabled={isUnblocking}
            >
                <span className="x-icon">✕</span>
                {isUnblocking ? 'Unblocking...' : 'Unblock'}
            </button>
        </div>
    );
};

export default AccountItem;
