import React from 'react';
import styled from 'styled-components';

const AccountItemContainer = styled.div`
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

const AccountItem = ({ account }) => {
    return (
        <AccountItemContainer>
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
        </AccountItemContainer>
    );
};

export default AccountItem;