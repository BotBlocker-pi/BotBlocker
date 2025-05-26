import React, { useState, useEffect } from 'react';
import botBadge from '../../../assets/badges/botBadge.png';
import unknownBadge from '../../../assets/badges/unknownBadge.png';
import { getSettingsAndBlacklist, areSettingsEqual, importSettingsFromSerializer, updateSettings } from '../../../utils/cacheLogic.jsx';
import { getUserSettings, sendUpdatedSettings } from "../../../api/data.jsx";
import '../../css/components/settings/BlockingSettings.css';

const BlockingSettings = () => {
    const [blockPercentage, setBlockPercentage] = useState(70);
    const [blockAI, setBlockAI] = useState(true);
    const [blockUnverified, setBlockUnverified] = useState(true);
    const [isSliding, setIsSliding] = useState(false);
    const [removeInsteadOfBlur, setRemoveInsteadOfBlur] = useState(true);
    const [saveMessage, setSaveMessage] = useState('');

    const handleToggleChange = () => {
        const newValue = !removeInsteadOfBlur;
        setRemoveInsteadOfBlur(newValue);
        chrome.storage.local.set({ remove_instead_of_blur: newValue });
    };

    const handleSliderChange = (e) => {
        setBlockPercentage(Number(e.target.value));
    };

    const handleSave = async () => {
        let badge = "empty";
        if (blockAI && blockUnverified) badge = "bot_and_without_verification";
        else if (blockAI) badge = "bot";
        else if (blockUnverified) badge = "without_verification";

        await updateSettings({ tolerance: blockPercentage, badge });
        localStorage.setItem("remove_instead_of_blur", removeInsteadOfBlur.toString());

        const { settings, blackList } = await getSettingsAndBlacklist();
        const isSynced = localStorage.getItem("is_Sync") === "true";

        if (isSynced) {
            await sendUpdatedSettings({
                tolerance: blockPercentage,
                badge,
                blocklist: blackList.map(([username, social]) => ({ username, social })),
            });
        }

        setSaveMessage("✅ Changes saved successfully!");
        setTimeout(() => setSaveMessage(''), 3000);
    };

    useEffect(() => {
        const fetchSettings = async () => {
            const { settings } = await getSettingsAndBlacklist();

            if (settings) {
                setBlockPercentage(settings.tolerance ?? 70);
                switch (settings.badge) {
                    case 'bot_and_without_verification':
                        setBlockAI(true);
                        setBlockUnverified(true);
                        break;
                    case 'bot':
                        setBlockAI(true);
                        setBlockUnverified(false);
                        break;
                    case 'without_verification':
                        setBlockAI(false);
                        setBlockUnverified(true);
                        break;
                    default:
                        setBlockAI(false);
                        setBlockUnverified(false);
                        break;
                }
            }

            chrome.storage.local.get(['remove_instead_of_blur'], (result) => {
                const value = result.remove_instead_of_blur;
                if (typeof value === 'boolean') {
                    setRemoveInsteadOfBlur(value);
                } else {
                    chrome.storage.local.set({ remove_instead_of_blur: true });
                    setRemoveInsteadOfBlur(true);
                }
            });
        };

        const fetchAndSync = async () => {
            await fetchSettings();

            if (localStorage.getItem("is_new_login") !== "true") return;

            const settingsFromAPI = await getUserSettings();
            if (!settingsFromAPI) return;

            const isEqual = await areSettingsEqual(settingsFromAPI);

            if (!isEqual) {
                const shouldSync = window.confirm("Differences detected between your local and server settings. Sync?");
                if (shouldSync) {
                    await importSettingsFromSerializer(settingsFromAPI);
                    localStorage.setItem("is_Sync", "true");
                    await fetchSettings();
                    window.location.reload();
                } else {
                    localStorage.setItem("is_Sync", "false");
                }
            } else {
                localStorage.setItem("is_Sync", "true");
            }

            localStorage.setItem("is_new_login", "false");
        };

        fetchAndSync();
    }, []);

    return (
        <div className="blocking-container">
            <h2 className="blocking-title">Blocking Settings</h2>

            <div className="slider-section">
                <p className="slider-question">At what percentage do you want accounts to start getting blocked?</p>
                <div className="slider-wrapper">
                    <div className="percentage-labels">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                    <input
                        className="custom-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={blockPercentage}
                        onChange={handleSliderChange}
                        onMouseDown={() => setIsSliding(true)}
                        onMouseUp={() => setIsSliding(false)}
                        onMouseLeave={() => setIsSliding(false)}
                    />
                    {isSliding && <div className="slider-value">{blockPercentage}%</div>}
                </div>
            </div>

            <div className="checkbox-section">
                <div className="checkbox-title">Block accounts verified such as:</div>
                <label className="checkbox-row">
                    <input type="checkbox" checked={blockAI} onChange={() => setBlockAI(!blockAI)} />
                    <img src={botBadge} alt="AI Badge" />
                    <span>AI</span>
                </label>
                <label className="checkbox-row">
                    <input type="checkbox" checked={blockUnverified} onChange={() => setBlockUnverified(!blockUnverified)} />
                    <img src={unknownBadge} alt="Unknown Badge" />
                    <span>Without verification</span>
                </label>
            </div>

            <label className="toggle-row">
                <input type="checkbox" checked={removeInsteadOfBlur} onChange={handleToggleChange} />
                Remove posts instead of applying blur
            </label>

            <div className="settings-save-button-container">
                <button className="save-button" onClick={handleSave}>Save Changes</button>
            </div>

            {saveMessage && <div className="save-confirmation">{saveMessage}</div>}
        </div>
    );
};

export default BlockingSettings;