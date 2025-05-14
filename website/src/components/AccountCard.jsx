import React from 'react';
import '../css/AccountCard.css';
import ActionButtons from './ActionButtons';

const AccountCard = ({ username, userId, role }) => {
    return (
        <div className="account-card">
            <div className="account-profile">
                <span className="username">@{username}</span>
            </div>
            <ActionButtons username={username} userId={userId} role={role} />
        </div>
    );
};

export default AccountCard;