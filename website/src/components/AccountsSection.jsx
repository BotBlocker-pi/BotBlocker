import React, { useEffect, useState } from 'react';
import AccountCard from './AccountCard';
import axios from 'axios';
import '../css/AccountSection.css';

const AccountsSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

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
    }, []);

    const filteredAccounts = accounts.filter(account =>
        account.user &&
        account.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AccountsSection;
