import React, { useEffect, useState } from 'react';
import AccountCard from './AccountCard';
import axios from 'axios';
import '../css/AccountSection.css';
import TimeoutModal from '../components/TimeoutModal';
import EvaluationsPopup from '../components/EvaluationsPopup';

const AccountsSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedEvaluationsUser, setSelectedEvaluationsUser] = useState(null);
    useEffect(() => {
        axios.get('http://localhost/api/get_users_detailed/')
            .then((response) => {
                const fetchedUsers = response.data.users || [];
                setAccounts(fetchedUsers);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                setLoading(false);
            });
    }, [selectedUser]);

    const filteredAccounts = accounts.filter(account =>
        account.user &&
        account.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTimeoutClick = (userId, username) => {
        setSelectedUser({ userId, username });
    };

    const handleEvaluationsClick = (userId, username) => {
        console.log({ userId, username });
        
        setSelectedEvaluationsUser({ userId, username });
    };

    return (
        <div className="accounts-section">
            <h2 className="accounts-title">These are the most recently created BB_Accounts:</h2>

            <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="search-input"
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
                        <AccountCard
                            key={account.id}
                            username={account.user.username}
                            userId={account.id}
                            role={account.role}
                            status={account.status}
                            onTimeoutClick={handleTimeoutClick}
                            onEvaluationsClick={handleEvaluationsClick}
                        />
                    ))}
                </div>
            )}

              {selectedUser && (
                <TimeoutModal
                    userId={selectedUser.userId}
                    username={selectedUser.username}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {selectedEvaluationsUser && (
                <EvaluationsPopup
                    userId={selectedEvaluationsUser.userId}
                    username={selectedEvaluationsUser.username}
                    onClose={() => setSelectedEvaluationsUser(null)}
                />
            )}
        </div>
    );
};

export default AccountsSection;
