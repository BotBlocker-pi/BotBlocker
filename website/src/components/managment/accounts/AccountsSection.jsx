import React, { useEffect, useState } from 'react';
import '../../../css/managment/accounts/AccountSection.css';
import TimeoutModal from './TimeoutModal.jsx';
import EvaluationsPopup from './EvaluationsPopup.jsx';
import ActionButtons from './ActionButtons.jsx';
import { getUsersDetailed } from '../../../api/data.jsx';

const AccountsSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedEvaluationsUser, setSelectedEvaluationsUser] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const fetchedUsers = await getUsersDetailed();
            setAccounts(fetchedUsers);
            setLoading(false);
        };

        fetchUsers();
    }, [selectedUser]);

    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => {
                setActionMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [actionMessage]);

    const filteredAccounts = accounts.filter(account =>
        account.user &&
        account.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTimeoutClick = (userId, username) => {
        setSelectedUser({ userId, username });
    };

    const handleEvaluationsClick = (userId, username) => {
        setSelectedEvaluationsUser({ userId, username });
    };

    return (
        <div className="accounts-section">
            <h2 className="accounts-title">Search all BB_Accounts</h2>

            <div className="accounts-search-container">
                <span className="accounts-search-icon">🔍</span>
                <input
                    type="text"
                    className="accounts-search-input"
                    placeholder="Search for accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Loading accounts...</p>
            ) : (
                <div className="accounts-list">
                    {filteredAccounts.map((account) => (
                        <div className="accounts-card" key={account.id}>
                            <div className="accounts-card-profile">
                                <span className="accounts-username">@{account.user.username}</span>
                            </div>
                            <ActionButtons
                                username={account.user.username}
                                userId={account.id}
                                role={account.role}
                                status={account.status}
                                onTimeoutClick={handleTimeoutClick}
                                onEvaluationsClick={handleEvaluationsClick}
                                setMessage={setActionMessage}
                            />
                        </div>
                    ))}
                </div>
            )}

            {selectedUser && (
                <TimeoutModal
                    userId={selectedUser.userId}
                    username={selectedUser.username}
                    onClose={() => setSelectedUser(null)}
                    onFeedback={(msg) => setActionMessage(msg)}
                />
            )}

            {selectedEvaluationsUser && (
                <EvaluationsPopup
                    userId={selectedEvaluationsUser.userId}
                    username={selectedEvaluationsUser.username}
                    onClose={() => setSelectedEvaluationsUser(null)}
                />
            )}

            {actionMessage && (
                <div className={`toast-message ${actionMessage.type}`}>
                    {actionMessage.type === 'success' ? '✅' : '❌'} {actionMessage.text}
                </div>
            )}
        </div>
    );
};

export default AccountsSection;