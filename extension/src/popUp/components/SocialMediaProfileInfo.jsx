import React from 'react';
import styled from 'styled-components';
import BlockIcon from '../../assets/buttons/blockButton.png';

const ProfileContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 10px 5px 10px;
    margin: 0;
`;

const LeftSection = styled.div`
    display: flex;
    align-items: center;
    padding-left: 15px;
`;

const MiddleSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    margin: 0 20px;
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    padding-right: 15px;
`;

const ProfileImage = styled.img`
    width: 70px; 
    height: 70px;
    border-radius: 50%; 
`;

const AccountType = styled.span`
    font-size: 16px;
    font-weight: bold;
    color: #666; 
    margin-bottom: 10px; 
`;

const Username = styled.span`
    font-size: 16px; 
    color: #666; 
`;

const BlockButton = styled.img`
    width: 50px; 
    height: 50px;
    cursor: pointer; 

    &:hover {
        opacity: 0.8; 
    }
`;

const SocialMediaProfileInfo = ({ imageUrl, accountType, username }) => {
    return (
        <ProfileContainer>
            <LeftSection>
                <ProfileImage src={imageUrl} alt="Profile" />
            </LeftSection>

            <MiddleSection>
                <AccountType>{accountType}</AccountType>
                <Username>{username}</Username>
            </MiddleSection>

            <RightSection>
                <BlockButton src={BlockIcon} alt="Block" />
            </RightSection>
        </ProfileContainer>
    );
};

export default SocialMediaProfileInfo;