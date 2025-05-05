import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AccountItem from './AccountItem';
import { getStorage,getSettingsAndBlacklist } from '../../utils/cacheLogic';
import {sendUpdatedSettings } from '../../api/data'

// Styled components
const BlockListContainer = styled.div`
    background-color: #f5f7fd;
    border-radius: 8px;
    padding: 24px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
`;

const Title = styled.h2`
    color: #000;
    font-size: 32px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 24px;
`;

const ListContainer = styled.div`
    background-color: #93a3c1;
    border-radius: 8px;
    padding: 15px;
    height: 500px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
        background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #7889ad;
        border-radius: 10px;
    }
`;

const EmptyMessage = styled.div`
    color: white;
    text-align: center;
    padding: 20px;
    font-size: 16px;
`;

const BlockList = () => {
    const [blockedAccounts, setBlockedAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carregar a lista de bloqueios do armazenamento local
        const loadBlockedAccounts = async () => {
            try {
                const { blackList = [] } = await getStorage(['blackList']);

                // Converter o formato do blackList para o formato utilizado pelo componente
                const formattedAccounts = blackList.map(([username, platform], index) => {
                    let accountType = 'X account';

                    // Determinar o tipo com base na plataforma
                    if (platform === 'instagram') {
                        accountType = 'Instagram account';
                    } else if (platform === 'linkedin') {
                        accountType = 'LinkedIn account';
                    } else if (platform === 'facebook' || platform === 'fb') {
                        accountType = 'Facebook account';
                    }

                    return {
                        id: index,
                        username,
                        platform,
                        type: accountType
                    };
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

    // Handle unblocking an account
    const handleUnblock = async (account) => {
        try {
            // Send unblock request to background script
            const response = await new Promise(resolve => {
                chrome.runtime.sendMessage({
                    action: 'unblockProfile',
                    username: account.username,
                    platform: account.platform
                }, resolve);
            });

            if (response) {
                setBlockedAccounts(prev => prev.filter(item => item.id !== account.id));
                console.log(`Unblocked profile: ${account.username}`);
                const { blackList } = await getSettingsAndBlacklist();
                      
                        const isSynced = localStorage.getItem("is_Sync") === "true";
                        if (isSynced) {
                          const result = await sendUpdatedSettings({
                            blocklist: blackList.map(([username, social]) => ({
                              username,
                              social,
                            }))
                          });
                        console.log("Synchronize blacklist. ",result);
                        
                        }
            } else {
                console.error('Failed to unblock profile:', response?.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error unblocking profile:', error);
        }
    };

    return (
        <BlockListContainer>
            <Title>Your Blacklist</Title>

            <ListContainer>
                {loading ? (
                    <EmptyMessage>Loading blocked accounts...</EmptyMessage>
                ) : blockedAccounts.length > 0 ? (
                    blockedAccounts.map(account => (
                        <AccountItem
                            key={account.id}
                            account={account}
                            onUnblock={() => handleUnblock(account)}
                        />
                    ))
                ) : (
                    <EmptyMessage>No blocked accounts found</EmptyMessage>
                )}
            </ListContainer>
        </BlockListContainer>
    );
};

export default BlockList;