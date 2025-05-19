import React from 'react';
import '../css/AccountCard.css';
import ActionButtons from './ActionButtons';

const AccountCard = ({ username, userId, role, status, onTimeoutClick, onEvaluationsClick }) => {
    return (
        <div className="account-card">
            <div className="account-profile">
                <span className="username">@{username}</span>
            </div>
            <ActionButtons username={username} userId={userId} role={role} status={status}  onTimeoutClick={onTimeoutClick} onEvaluationsClick={onEvaluationsClick}/>
        </div>
    );
};

export default AccountCard;