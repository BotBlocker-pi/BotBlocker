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

const ActionButton = styled.img`
    width: 50px;
    height: 50px;
    cursor: ${props => props.isProcessing ? 'default' : 'pointer'};
    opacity: ${props => props.isProcessing ? '0.5' : '1'};
    transition: opacity 0.3s, filter 0.3s;

    &:hover {
        opacity: ${props => props.isProcessing ? '0.5' : '0.8'};
    }
`;

const ButtonLabel = styled.div`
    font-size: 12px;
    text-align: center;
    margin-top: 4px;
    color: #666;
`;

import { getSettingsAndBlacklist } from '../../utils/cacheLogic';

const SocialMediaProfileInfo = ({ imageUrl, accountType, username, platform }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    // Verificar se o perfil já está bloqueado sempre que o componente for renderizado
    // E também sempre que o estado isBlocked mudar
    useEffect(() => {
        const checkBlockStatus = async () => {
            try {
                const { blackList } = await getSettingsAndBlacklist();
                // Verificar se existe na blacklist
                const blocked = blackList.some(([u, p]) =>
                    u.toLowerCase() === username.toLowerCase() &&
                    (p === platform || p === 'x' || p === 'twitter')
                );

                // Só atualizar o estado se for diferente do atual
                if (blocked !== isBlocked) {
                    setIsBlocked(blocked);
                    console.log(`[BotBlocker] Profile ${username} is ${blocked ? 'blocked' : 'not blocked'}`);
                }
            } catch (error) {
                console.error('[BotBlocker] Error checking block status:', error);
            }
        };

        checkBlockStatus();

        // Verificar periodicamente a cada 2 segundos
        const intervalId = setInterval(checkBlockStatus, 2000);

        // Limpar intervalo ao desmontar o componente
        return () => clearInterval(intervalId);
    }, [username, platform, isBlocked]);

    const handleBlockProfile = async () => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);

            if (isBlocked) {
                // Requisição para desbloquear
                const response = await new Promise(resolve => {
                    chrome.runtime.sendMessage({
                        action: 'unblockProfile',
                        username,
                        platform
                    }, resolve);
                });

                if (response && response.success) {
                    console.log(`Successfully unblocked profile: ${username} on ${platform}`);
                    setIsBlocked(false);
                } else {
                    console.error('Error unblocking profile:', response?.error);
                }
            } else {
                // Requisição para bloquear
                const response = await new Promise(resolve => {
                    chrome.runtime.sendMessage({
                        action: 'blockProfile',
                        username,
                        platform
                    }, resolve);
                });

                if (response && response.success) {
                    console.log(`Successfully blocked profile: ${username} on ${platform}`);
                    setIsBlocked(true);
                } else {
                    console.error('Error blocking profile:', response?.error);
                }
            }
        } catch (error) {
            console.error(`Error ${isBlocked ? 'unblocking' : 'blocking'} profile:`, error);
        } finally {
            setIsProcessing(false);
        }
    };

    const buttonStyle = {
        filter: isBlocked ? 'grayscale(100%) hue-rotate(180deg)' : 'none',
        cursor: isProcessing ? 'default' : 'pointer'
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ActionButton
                        src={BlockIcon}
                        alt={isBlocked ? "Unblock" : "Block"}
                        onClick={handleBlockProfile}
                        isProcessing={isProcessing}
                        style={buttonStyle}
                    />
                    <ButtonLabel>
                        {isProcessing
                            ? (isBlocked ? 'Unblocking...' : 'Blocking...')
                            : (isBlocked ? 'Unblock' : 'Block')}
                    </ButtonLabel>
                </div>
            </RightSection>
        </ProfileContainer>
    );
};

export default SocialMediaProfileInfo;