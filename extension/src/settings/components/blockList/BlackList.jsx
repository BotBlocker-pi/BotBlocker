import React, { useState, useEffect } from 'react';
import AccountItem from './AccountItem.jsx';
import { getStorage, getSettingsAndBlacklist } from '../../../utils/cacheLogic.jsx';
import { sendUpdatedSettings } from '../../../api/data.jsx';
import '../../css/components/blocklist/BlackList.css';

const BlackList = () => {
    const [blockedAccounts, setBlockedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlockedAccounts = async () => {
            try {
                const { blackList = [] } = await getStorage(['blackList']);
                const formattedAccounts = blackList.map(([username, platform], index) => {
                    let accountType = 'X account';
                    if (platform === 'instagram') accountType = 'Instagram account';
                    else if (platform === 'linkedin') accountType = 'LinkedIn account';
                    else if (platform === 'facebook' || platform === 'fb') accountType = 'Facebook account';
                    return { id: index, username, platform, type: accountType };
                });

                setBlockedAccounts(formattedAccounts);
            } catch (error) {
                console.error('Error loading blocked accounts:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBlockedAccounts();
    }, []);

    const handleUnblock = async (account) => {
        try {
            const response = await new Promise(resolve => {
                chrome.runtime.sendMessage({
                    action: 'unblockProfile',
                    username: account.username,
                    platform: account.platform
                }, resolve);
            });

            if (response) {
                setBlockedAccounts(prev => prev.filter(item => item.id !== account.id));
                const { blackList } = await getSettingsAndBlacklist();

                const isSynced = localStorage.getItem("is_Sync") === "true";
                if (isSynced) {
                    await sendUpdatedSettings({
                        blocklist: blackList.map(([username, social]) => ({ username, social }))
                    });
                }
            } else {
                console.error('Failed to unblock profile:', response?.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error unblocking profile:', error);
        }
    };

    return (
        <div className="blocklist-container">
            <h2 className="blocklist-title">Your Blacklist</h2>
            <div className="list-container">
                {loading ? (
                    <div className="empty-message">Loading blocked accounts...</div>
                ) : blockedAccounts.length > 0 ? (
                    blockedAccounts.map(account => (
                        <AccountItem
                            key={account.id}
                            account={account}
                            onUnblock={() => handleUnblock(account)}
                        />
                    ))
                ) : (
                    <div className="empty-message">No blocked accounts found</div>
                )}
            </div>
        </div>
    );
};

export default BlackList;
