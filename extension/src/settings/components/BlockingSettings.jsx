import React, { useState } from 'react';
import styled from 'styled-components';
import botBadge from '../../assets/badges/botBadge.png';
import unknownBadge from '../../assets/badges/unknownBadge.png';
import {getSettingsAndBlacklist, areSettingsEqual, importSettingsFromSerializer,updateSettings } from '../../utils/cacheLogic'
import { getUserSettings, sendUpdatedSettings } from "../../api/data";
import { useEffect } from 'react';

// Styled components
const BlockingContainer = styled.div`
    background-color: #f5f7fd;
    border-radius: 8px;
    padding: 24px;
    width: 100%; // This will now respect the parent container's width
    box-sizing: border-box; // This ensures padding is included in the width calculation
`;

const Title = styled.h2`
    color: #000;
    font-size: 32px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 16px;
`;

const SliderContainer = styled.div`
    margin: 24px 0;
`;

const Question = styled.p`
    color: #555;
    font-size: 20px;
    margin-bottom: 12px;
`;

const SliderWrapper = styled.div`
    position: relative;
    width: 100%;
    margin-bottom: 8px;
`;

const PercentageDisplay = styled.div`
    background-color: #566C98;
    color: white;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    position: absolute;
    top: -30px;
    left: ${props => props.value}%;
    transform: translateX(-50%);
    font-size: 18px;
    opacity: ${props => props.isVisible ? 1 : 0};
    transition: opacity 0.2s ease;
    pointer-events: none;
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px;
        border-style: solid;
        border-color: #566C98 transparent transparent transparent;
    }
`;

const Slider = styled.input`
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right, #e0e5f6, #566C98);
    -webkit-appearance: none;
    appearance: none;
    outline: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #566C98;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    }

    &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #566C98;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    }
`;

const MinMaxLabels = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: #777;
    font-size: 18px;
`;

const CheckboxContainer = styled.div`
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-top: 24px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const CheckboxTitle = styled.div`
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 16px;
`;

const CheckboxOption = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const StyledCheckbox = styled.input`
    margin-right: 16px;
    width: 24px;
    height: 24px;
    cursor: pointer;

    &:checked {
        accent-color: #566C98;
    }
`;

const BadgeImage = styled.img`
    width: 32px;
    height: 32px;
    margin-right: 16px;
`;

const OptionLabel = styled.label`
    font-size: 18px;
    font-weight: 500;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
`;

const SaveButton = styled.button`
    background-color: #566C98;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
`;

const ToggleContainer = styled.div`
    margin-top: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ToggleLabel = styled.label`
    font-size: 18px;
    font-weight: 500;
`;

const ToggleSwitch = styled.input`
    position: relative;
    width: 50px;
    height: 26px;
    -webkit-appearance: none;
    background: #ccc;
    outline: none;
    border-radius: 50px;
    transition: background 0.3s;

    &:checked {
        background: #566C98;
    }

    &::before {
        content: '';
        position: absolute;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        background: white;
        transition: 0.3s;
    }

    &:checked::before {
        transform: translateX(24px);
    }
`;

const BlockingSettings = () => {
    const [blockPercentage, setBlockPercentage] = useState(70);
    const [blockAI, setBlockAI] = useState(true);
    const [blockUnverified, setBlockUnverified] = useState(true);
    const [isSliding, setIsSliding] = useState(false);
    const [removeInsteadOfBlur, setRemoveInsteadOfBlur] = useState(true);

    // Atualizar toggle
    const handleToggleChange = () => {
        const newValue = !removeInsteadOfBlur;
        setRemoveInsteadOfBlur(newValue);
        chrome.storage.local.set({ remove_instead_of_blur: newValue });
    };
  

    const handleSliderChange = (e) => {
        setBlockPercentage(Number(e.target.value));
    };

    const handleSliderMouseDown = () => {
        setIsSliding(true);
    };

    const handleSliderMouseUp = () => {
        setIsSliding(false);
    };

    const handleSave = async () => {
        let badge = "empty";
        if (blockAI && blockUnverified) badge = "bot_and_without_verification";
        else if (blockAI) badge = "bot";
        else if (blockUnverified) badge = "without_verification";

        await updateSettings({ tolerance: blockPercentage, badge });

        // 🟢 Salvar preferências locais
        localStorage.setItem("remove_instead_of_blur", removeInsteadOfBlur.toString());

        const { settings, blackList } = await getSettingsAndBlacklist();
        const isSynced = localStorage.getItem("is_Sync") === "true";

        if (isSynced) {
            const result = await sendUpdatedSettings({
                tolerance: blockPercentage,
                badge,
                blocklist: blackList.map(([username, social]) => ({ username, social })),
            });
            console.log(result ? "Changes synced with backend." : "Failed to sync changes.");
        } else {
            console.log("Changes saved locally (sync off).");
        }
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

            // 🟢 Inicializar toggle com valor persistido ou default "true"
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
                const shouldSync = window.confirm("Foram detetadas diferenças entre as definições locais e do servidor. Deseja sincronizar?");
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
        <BlockingContainer>
            <Title>Blocking Settings</Title>

            <SliderContainer>
                <Question>At what percentage do you want accounts to start getting blocked?</Question>
                <SliderWrapper>
                    <PercentageDisplay value={blockPercentage} isVisible={isSliding}>
                        {blockPercentage}%
                    </PercentageDisplay>
                    <Slider
                        type="range"
                        min="0"
                        max="100"
                        value={blockPercentage}
                        onChange={handleSliderChange}
                        onMouseDown={handleSliderMouseDown}
                        onMouseUp={handleSliderMouseUp}
                        onMouseLeave={handleSliderMouseUp}
                    />
                </SliderWrapper>
                <MinMaxLabels>
                    <span>0%</span>
                    <span>100%</span>
                </MinMaxLabels>
            </SliderContainer>

            <CheckboxContainer>
                <CheckboxTitle>Block accounts verified such as:</CheckboxTitle>
                <CheckboxOption>
                    <StyledCheckbox
                        type="checkbox"
                        checked={blockAI}
                        onChange={() => setBlockAI(!blockAI)}
                        id="block-ai"
                    />
                    <BadgeImage src={botBadge} alt="AI Badge" />
                    <OptionLabel htmlFor="block-ai">AI</OptionLabel>
                </CheckboxOption>
                <CheckboxOption>
                    <StyledCheckbox
                        type="checkbox"
                        checked={blockUnverified}
                        onChange={() => setBlockUnverified(!blockUnverified)}
                        id="block-unverified"
                    />
                    <BadgeImage src={unknownBadge} alt="Unknown Badge" />
                    <OptionLabel htmlFor="block-unverified">Without verification</OptionLabel>
                </CheckboxOption>
            </CheckboxContainer>

            <ToggleContainer>
                <ToggleSwitch
                    type="checkbox"
                    checked={removeInsteadOfBlur}
                    onChange={handleToggleChange}
                    id="remove-blur-toggle"
                />
                <ToggleLabel htmlFor="remove-blur-toggle">
                    Remove posts instead of applying blur
                </ToggleLabel>
            </ToggleContainer>

            <ButtonContainer>
                <SaveButton onClick={handleSave}>Save Changes</SaveButton>
            </ButtonContainer>
        </BlockingContainer>
    );
};

export default BlockingSettings;