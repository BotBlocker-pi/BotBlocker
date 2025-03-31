import React, { useState } from 'react';
import styled from 'styled-components';

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

const AccountItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: white;
    border-radius: 8px;
    padding: 12px 16px;
`;

const AccountInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const AccountDetails = styled.div`
    display: flex;
    flex-direction: column;
`;

const AccountType = styled.span`
    color: #777;
    font-size: 14px;
`;

const AccountName = styled.span`
    font-weight: 500;
    font-size: 16px;
`;

const UnblockButton = styled.button`
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const XIcon = styled.span`
    font-weight: bold;
`;

const BlockList = ({ blockedAccounts: propBlockedAccounts = [] }) => {
    // Use provided blockedAccounts prop or fallback to sample data
    const [blockedAccounts, setBlockedAccounts] = useState(propBlockedAccounts.length > 0 ? propBlockedAccounts : [
        { id: 1, username: 'JohnDoeOnInsta', type: 'Instagram account' },
        { id: 2, username: 'JohnDoeOnFB', type: 'Facebook account' },
        { id: 3, username: 'JohnDoeOnTwitter', type: 'X account' },
        { id: 4, username: 'JaneDoeOnInsta', type: 'Instagram account' },
        { id: 5, username: 'JaneDoeOnFB', type: 'Instagram account' },
    ]);

    // Handle unblocking an account
    const handleUnblock = (id) => {
        setBlockedAccounts(blockedAccounts.filter(account => account.id !== id));
    };

    return (
        <BlockListContainer>
            <Title>Blocking List</Title>

            <ListContainer>
                {blockedAccounts.map(account => (
                    <AccountItem key={account.id}>
                        <AccountInfo>
                            <AccountDetails>
                                <AccountType>{account.type}</AccountType>
                                <AccountName>@{account.username}</AccountName>
                            </AccountDetails>
                        </AccountInfo>
                        <UnblockButton>
                            <XIcon>✕</XIcon>
                            Unblock
                        </UnblockButton>
                    </AccountItem>
                ))}
            </ListContainer>
        </BlockListContainer>
    );
};

export default BlockList;