import React, { useState, useEffect } from 'react';
import Navbar from '../components/global/Navbar';
import Login from '../components/global/Login';
import BotBadge from '../../assets/badges/botBadge.png';
import HumanBadge from '../../assets/badges/humanBadge.png';
import UnknownBadge from '../../assets/badges/unknownBadge.png';
import { checkAuth } from '../../api/loginApi.jsx';
import '../css/pages/BlockedAccounts.css';

const BlockedAccounts = () => {
    const [blockedAccounts, setBlockedAccounts] = useState({
        profilesBlockedAutomatically: [],
        profilesBlockedManually: [],
        profilesBlockedByBadge: []
    });

    const [isLoading, setIsLoading] = useState(true);
    const [showLoginPage, setShowLoginPage] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        chrome.storage.local.get(['blockedAccounts'], (result) => {
            if (result.blockedAccounts) {
                setBlockedAccounts(result.blockedAccounts);
            }
            setIsLoading(false);
        });

        const handleStorageChange = (changes) => {
            if (changes.blockedAccounts) {
                setBlockedAccounts(changes.blockedAccounts.newValue || {
                    profilesBlockedAutomatically: [],
                    profilesBlockedManually: [],
                    profilesBlockedByBadge: []
                });
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const authStatus = await checkAuth();
                setIsAuthenticated(authStatus);
            } catch (error) {
                console.error("Error checking auth status:", error);
            }
        };
        checkAuthStatus();
    }, []);

    const handleLoginClick = () => setShowLoginPage(true);
    const handleBackToMain = () => setShowLoginPage(false);

    const getBadgeInfo = (badge) => {
        switch (badge) {
            case 'bot':
                return { src: BotBadge, message: "Our specialists verified this account as a bot." };
            case 'human':
                return { src: HumanBadge, message: "Our specialists verified this account as a human." };
            default:
                return { src: UnknownBadge, message: "The status of this account is unknown." };
        }
    };

    const renderAccountList = (accounts, title) => {
        if (accounts.length === 0) return null;
        return (
            <div>
                <h3>{title}</h3>
                {accounts.map((account, index) => {
                    const badgeInfo = getBadgeInfo(account.badge);
                    return (
                        <div className="account-item" key={index}>
                            <img
                                className="profile-image"
                                src={account.profileImage || 'default-avatar.png'}
                                alt="Profile"
                            />
                            <div className="account-info">
                                <div className="username">@{account.username}</div>
                                {account.percentage !== null && (
                                    <div>{account.percentage}% chance of being AI</div>
                                )}
                            </div>
                            <div className="badge-container">
                                <img className="badge" src={badgeInfo.src} alt="Badge" />
                                <div className="tooltip">{badgeInfo.message}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (showLoginPage) {
        return (
            <div className="page-wrapper">
                <Navbar onBack={handleBackToMain} showBackButton={true} />
                <Login
                    onBackToHome={handleBackToMain}
                    onAuthChange={(authStatus) => setIsAuthenticated(authStatus)}
                    initialMode={false}
                />
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Navbar
                onLoginClick={handleLoginClick}
                isAuthenticated={isAuthenticated}
            />
            <div className="blocked-container">
                <h1 className="title">Blocked accounts on your timeline</h1>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="account-list">
                        {renderAccountList(blockedAccounts.profilesBlockedAutomatically, "Automatically Blocked")}
                        {renderAccountList(blockedAccounts.profilesBlockedManually, "Manually Blocked")}
                        {renderAccountList(blockedAccounts.profilesBlockedByBadge, "Blocked by Badge")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlockedAccounts;