import React, { useState, useEffect } from 'react';
import '../../css/components/profile/SocialMediaProfileInfo.css';
import BlockIcon from '../../../assets/buttons/blockButton.png';
import { getSettingsAndBlacklist } from '../../../utils/cacheLogic.jsx';
import { sendUpdatedSettings } from '../../../api/data.jsx';

const SocialMediaProfileInfo = ({ imageUrl, accountType, username }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const platform = accountType;

    useEffect(() => {
        const checkBlockStatus = async () => {
            try {
                const { blackList } = await getSettingsAndBlacklist();
                const blocked = blackList.some(([u, p]) =>
                    u.toLowerCase() === username.toLowerCase() &&
                    (p === platform || ['x', 'twitter', 'instagram', 'facebook'].includes(p))
                );
                if (blocked !== isBlocked) {
                    setIsBlocked(blocked);
                }
            } catch (error) {
                console.error('[BotBlocker] Error checking block status:', error);
            }
        };

        checkBlockStatus();
        const intervalId = setInterval(checkBlockStatus, 2000);
        return () => clearInterval(intervalId);
    }, [username, platform, isBlocked]);

    const handleBlockProfile = async () => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);

            if (isBlocked) {
                const response = await new Promise(resolve => {
                    chrome.runtime.sendMessage({ action: 'unblockProfile', username, platform }, resolve);
                });

                if (response?.success) {
                    setIsBlocked(false);
                    const { blackList } = await getSettingsAndBlacklist();
                    if (localStorage.getItem("is_Sync") === "true") {
                        await sendUpdatedSettings({
                            blocklist: blackList.map(([u, s]) => ({ username: u, social: s }))
                        });
                    }
                }
            } else {
                const response = await new Promise(resolve => {
                    chrome.runtime.sendMessage({ action: 'blockProfile', username, platform }, resolve);
                });

                if (response?.success) {
                    setIsBlocked(true);
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
        <div className="profile-container">
            <div className="profile-left">
                <img className="profile-image" src={imageUrl} alt="Profile" />
            </div>

            <div className="profile-middle">
                <span className="account-type">{accountType}</span>
                <span className="username">{username}</span>
            </div>

            <div className="profile-right">
                <div className="block-control">
                    <img
                        src={BlockIcon}
                        alt={isBlocked ? "Unblock" : "Block"}
                        onClick={handleBlockProfile}
                        style={buttonStyle}
                        className="block-button"
                    />
                    <div className="button-label">
                        {isProcessing ? (isBlocked ? 'Unblocking...' : 'Blocking...') : (isBlocked ? 'Unblock' : 'Block')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaProfileInfo;
