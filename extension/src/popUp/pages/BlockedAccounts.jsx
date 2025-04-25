import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BotBadge from '../../assets/badges/botBadge.png';
import HumanBadge from '../../assets/badges/humanBadge.png';
import UnknownBadge from '../../assets/badges/unknownBadge.png';
import Navbar from '../components/global/Navbar';
import '../index.css';

const BlockedAccountsContainer = styled.div`
    padding: 20px;
`;

const Title = styled.h1`
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    margin-top: -0.5rem;
`;

const AccountList = styled.div`
    margin-top: 0.5rem;
`;

const AccountItem = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
`;

const ProfileImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
`;

const AccountInfo = styled.div`
    flex: 1;
`;

const Username = styled.div`
    font-weight: bold;
`;

const BadgeContainer = styled.div`
    position: relative;
    display: inline-block;
    margin-left: 10px;
`;

const Badge = styled.img`
    width: 20px;
    height: 20px;
    cursor: pointer;
`;

const Tooltip = styled.div`
    visibility: hidden;
    width: 120px;
    background-color: #566C98;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 10px;
    opacity: 0;
    transition: opacity 0.3s;

    ${BadgeContainer}:hover & {
        visibility: visible;
        opacity: 1;
    }
`;

const BlockedAccounts = () => {
    const [blockedAccounts, setBlockedAccounts] = useState({
        profilesBlockedAutomatically: [],
        profilesBlockedManually: [],
        profilesBlockedByBadge: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get blocked accounts from storage
        chrome.storage.local.get(['blockedAccounts'], (result) => {
            if (result.blockedAccounts) {
                setBlockedAccounts(result.blockedAccounts);
            }
            setIsLoading(false);
        });

        // Listen for changes in storage
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

    const getBadgeInfo = (badge) => {
        switch (badge) {
            case 'bot':
                return {
                    src: BotBadge,
                    message: "Our specialists verified this account as a bot."
                };
            case 'human':
                return {
                    src: HumanBadge,
                    message: "Our specialists verified this account as a human."
                };
            default:
                return {
                    src: UnknownBadge,
                    message: "The status of this account is unknown."
                };
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
                        <AccountItem key={index}>
                            <ProfileImage 
                                src={account.profileImage || 'default-avatar.png'} 
                                alt={`${account.username}'s profile`}
                            />
                            <AccountInfo>
                                <Username>@{account.username}</Username>
                                {account.percentage !== null && (
                                    <div>{account.percentage}% chance of being AI</div>
                                )}
                            </AccountInfo>
                            <BadgeContainer>
                                <Badge src={badgeInfo.src} alt="Badge" />
                                <Tooltip>{badgeInfo.message}</Tooltip>
                            </BadgeContainer>
                        </AccountItem>
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <BlockedAccountsContainer>
                    <Title>Blocked accounts on your timeline</Title>
                    <AccountList>
                        {renderAccountList(blockedAccounts.profilesBlockedAutomatically, "Automatically Blocked")}
                        {renderAccountList(blockedAccounts.profilesBlockedManually, "Manually Blocked")}
                        {renderAccountList(blockedAccounts.profilesBlockedByBadge, "Blocked by Badge")}
                    </AccountList>
                </BlockedAccountsContainer>
            </div>
        </div>
    );
};

export default BlockedAccounts; 