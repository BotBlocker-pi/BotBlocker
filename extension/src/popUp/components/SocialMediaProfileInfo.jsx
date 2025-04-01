import React, { useState, useEffect } from 'react';
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
    opacity: ${props => props.isBlocking ? '0.5' : '1'};
    transition: opacity 0.3s;

    &:hover {
        opacity: ${props => props.isBlocking ? '0.5' : '0.8'};
    }
`;

import { getSettingsAndBlacklist } from '../../utils/cacheLogic';

const SocialMediaProfileInfo = ({ imageUrl, accountType, username, platform }) => {
    const [isBlocking, setIsBlocking] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    // Check if this profile is already blocked
    useEffect(() => {
        const checkBlockStatus = async () => {
            const { blackList } = await getSettingsAndBlacklist();
            const blocked = blackList.some(([u, p]) =>
                u.toLowerCase() === username.toLowerCase() && p === platform
            );
            setIsBlocked(blocked);
        };

        checkBlockStatus();
    }, [username, platform]);

    const handleBlockProfile = async () => {
        if (isBlocking || isBlocked) return;

        try {
            setIsBlocking(true);

            // Send block request to background script
            const response = await new Promise(resolve => {
                chrome.runtime.sendMessage({
                    action: 'blockProfile',
                    username,
                    platform
                }, resolve);
            });

            if (response.success) {
                setIsBlocked(true);
                console.log(`Successfully blocked profile: ${username} on ${platform}`);
            } else {
                console.error('Error blocking profile:', response.error);
                // Show an error notification
            }
        } catch (error) {
            console.error('Error blocking profile:', error);
            // Show an error notification
        } finally {
            setIsBlocking(false);
        }
    };

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
                <BlockButton
                    src={BlockIcon}
                    alt={isBlocked ? "Blocked" : "Block"}
                    onClick={handleBlockProfile}
                    isBlocking={isBlocking}
                    style={{
                        filter: isBlocked ? 'grayscale(100%)' : 'none',
                        cursor: isBlocked ? 'default' : 'pointer'
                    }}
                />
            </RightSection>
        </ProfileContainer>
    );
};

export default SocialMediaProfileInfo;