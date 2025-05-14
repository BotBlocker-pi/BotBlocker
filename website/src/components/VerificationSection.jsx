import React, { useState } from 'react';
import { getEvaluationHistory, getProfileData, assignBadgeToProfile } from '../api/data.jsx';
import EvaluationChart from '../components/EvaluationChart';
import ApexBubbleChart from '../components/ApexBubbleChart';
import '../css/VerificationSection.css';
// Import placeholder badge images - replace with your actual paths
import BotBadge from '../assets/badges/botBadge.png';
import HumanBadge from '../assets/badges/humanBadge.png';
import UnknownBadge from '../assets/badges/unknownBadge.png';

const VerificationSection = ({ setActiveSection }) => {
    // States for profile search and display
    const [searchUrl, setSearchUrl] = useState('');
    const [usernameSearch, setUsernameSearch] = useState('');
    const [selectedSocialMedia, setSelectedSocialMedia] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [username, setUsername] = useState('');
    const [socialMedia, setSocialMedia] = useState('');
    const [evaluations, setEvaluations] = useState([]);
    const [data, setData] = useState(null);
    const [userNotFound, setUserNotFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState(null);
    const [selectedBadge, setSelectedBadge] = useState('');

    // Add new state for visible evaluations - changed from 6 to 9
    const [visibleEvaluations, setVisibleEvaluations] = useState(9);

    // Function to load more evaluations - changed from 6 to 9
    const handleSeeMore = () => {
        setVisibleEvaluations(prevCount => prevCount + 9);
    };

    // Function to see fewer evaluations - changed from 6 to 9
    const handleSeeLess = () => {
        // Reduce visible evaluations by 9, but never below 9
        setVisibleEvaluations(prevCount => Math.max(9, prevCount - 9));
    };

    // Handler for the field of search by URL
    const handleSearchChange = (e) => {
        setSearchUrl(e.target.value);
    };

    // Handler for the username search field
    const handleUsernameChange = (e) => {
        setUsernameSearch(e.target.value);
    };

    // Handler for social media selection
    const handleSocialMediaChange = (e) => {
        setSelectedSocialMedia(e.target.value);
    };

    // Handler for badge selection
    const handleBadgeChange = (e) => {
        setSelectedBadge(e.target.value);
    };

    // Search profile by URL
    const handleUrlSearchSubmit = async (e) => {
        e.preventDefault();
        console.log('Searching for:', searchUrl);
        setUserNotFound(false);
        setVerificationMessage(null);
        setIsLoading(true);
        setVisibleEvaluations(9); // Reset visible evaluations count to 9

        try {
            const profileData = await getProfileData(searchUrl);

            if (!profileData) {
                setUserNotFound(true);
                setIsLoading(false);
                return;
            }

            setData(profileData);
            const extractedUsername = profileData.perfil_name;
            const platform = profileData.plataform;

            setUsername(extractedUsername || 'unknown_user');
            setSocialMedia(platform);
            setSelectedBadge(profileData.badge || '');

            try {
                setEvaluations(await getEvaluationHistory(searchUrl));
            } catch (evalError) {
                console.error("Error fetching evaluation history:", evalError);
                setEvaluations([]);
            }

            setShowProfile(true);
            setActiveSection('profile-details');
        } catch (error) {
            setUserNotFound(true);
            const extractedUsername = searchUrl.replace(/^@/, '');
            setUsername(extractedUsername);
        } finally {
            setIsLoading(false);
        }
    };

    // Search profile by username and social media
    const handleUsernameSearchSubmit = async (e) => {
        e.preventDefault();
        setVerificationMessage(null);
        if (!selectedSocialMedia || !usernameSearch) {
            alert("Please select a social media platform and enter a username.");
            return;
        }

        console.log('Searching for username:', usernameSearch, 'on', selectedSocialMedia);
        setUserNotFound(false);
        setVisibleEvaluations(9); // Reset visible evaluations count to 9

        // Build the complete URL based on selected social media
        let fullUrl = '';
        switch (selectedSocialMedia) {
            case 'twitter':
                fullUrl = `https://x.com/${usernameSearch.replace('@', '')}`;
                break;
            case 'instagram':
                fullUrl = `https://instagram.com/${usernameSearch.replace('@', '')}`;
                break;
            case 'facebook':
                fullUrl = `https://facebook.com/${usernameSearch.replace('@', '')}`;
                break;
            case 'linkedin':
                fullUrl = `https://linkedin.com/in/${usernameSearch.replace('@', '')}`;
                break;
            default:
                fullUrl = usernameSearch;
        }

        // Use the same search logic as URL
        setIsLoading(true);
        try {
            const profileData = await getProfileData(fullUrl);

            if (!profileData) {
                setUserNotFound(true);
                setIsLoading(false);
                return;
            }

            setData(profileData);
            const extractedUsername = profileData.perfil_name;
            const platform = profileData.plataform;

            setUsername(extractedUsername || 'unknown_user');
            setSocialMedia(platform);
            setSelectedBadge(profileData.badge || '');

            try {
                setEvaluations(await getEvaluationHistory(fullUrl));
            } catch (evalError) {
                console.error("Error fetching evaluation history:", evalError);
                setEvaluations([]);
            }

            setShowProfile(true);
            setActiveSection('profile-details');
        } catch (error) {
            setUserNotFound(true);
            const extractedUsername = fullUrl.replace(/^@/, '');
            setUsername(extractedUsername);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseProfile = () => {
        setShowProfile(false);
        setActiveSection('verify');
        setVerificationMessage(null);
    };

    // Function to assign badge to profile
    const handleBadgeAssignment = async () => {
        // Allow null/empty badge for removal
        console.log("Data", data);
        if (!data?.perfil_id) {
            setVerificationMessage({
                type: 'error',
                text: 'Unable to assign badge: Profile ID not available'
            });
            return;
        }

        setIsLoading(true);
        try {
            // Pass selectedBadge which can now be an empty string
            const result = await assignBadgeToProfile(data.perfil_id, selectedBadge || '');

            if (result.success) {
                setVerificationMessage({
                    type: 'success',
                    text: selectedBadge
                        ? result.message
                        : 'Verification status successfully removed'
                });

                // Update profile data to reflect the new badge (including empty string)
                const updatedData = {...data, badge: selectedBadge};
                setData(updatedData);
            } else {
                setVerificationMessage({
                    type: 'error',
                    text: result.error
                });
            }
        } catch (error) {
            console.error("Error assigning badge:", error);
            setVerificationMessage({
                type: 'error',
                text: 'Error processing verification'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to format evaluations
    const formatEvaluations = (evaluationsData) => {
        if (!evaluationsData || !Array.isArray(evaluationsData)) return [];

        return evaluationsData.map(item => {
            // Extract date and time from created_at property
            const evalDate = new Date(item.created_at || Date.now());
            const formattedDate = evalDate.toLocaleDateString();
            const formattedTime = `${evalDate.getHours().toString().padStart(2, '0')}:${evalDate.getMinutes().toString().padStart(2, '0')}`;

            return {
                evaluator_name: item.user || 'Anonymous',
                is_bot: item.is_bot || false,
                date: formattedDate,
                time: formattedTime,
                reasons: [item.notas || 'No reason provided']
            };
        });
    };

    // Get badge image and message based on badge value
    const getBadgeInfo = (badgeValue) => {
        switch (badgeValue) {
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

    // Render search form
    const renderSearchForm = () => {
        return (
            <div className="verification-container">
                <form onSubmit={handleUrlSearchSubmit} className="form-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Enter social media URL. Example: https://x.com/BotBlocker"
                            value={searchUrl}
                            onChange={handleSearchChange}
                        />
                        <button type="submit" className="search-button">🔍</button>
                    </div>
                </form>

                <div className="instruction-text">Search the social media URL of the profile you want to verify.</div>

                <div className="search-divider">OR</div>

                <form onSubmit={handleUsernameSearchSubmit} className="form-section">
                    <div className="dropdown-search">
                        <div className="dropdown">
                            <select
                                value={selectedSocialMedia}
                                onChange={handleSocialMediaChange}
                            >
                                <option value="" disabled>Select Social Media</option>
                                <option value="twitter">Twitter</option>
                                <option value="instagram">Instagram</option>
                                <option value="facebook">Facebook</option>
                                <option value="linkedin">LinkedIn</option>
                            </select>
                        </div>

                        <div className="search-box username-search">
                            <input
                                type="text"
                                placeholder="Username. Example: @BotBlocker"
                                value={usernameSearch}
                                onChange={handleUsernameChange}
                            />
                            <button type="submit" className="search-button">🔍</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

    // Render profile details using new design
    const renderProfileDetails = () => {
        const badgeInfo = getBadgeInfo(selectedBadge || data.badge);
        const formattedEvaluations = formatEvaluations(evaluations);
        const hasMoreEvaluations = formattedEvaluations.length > visibleEvaluations;

        return (
            <div className="profile-container">
                <button className="close-button" onClick={handleCloseProfile}>×</button>

                <div className="profile-header">
                    <h1>Profile Found</h1>
                    <p className="subtitle">Check its analysis</p>
                </div>

                <div className="ai-analysis-container">
                    <h2 className="ai-analysis-title">AI analysis</h2>

                    <div className="social-username">
                        <span className="social-platform">{socialMedia}</span>
                        <span className="username-display">@{username}</span>
                    </div>

                    <div className="ai-analysis-content">
                        <div className="left-section">
                            <div className="percentage-row">
                                <span className="percentage-text">{data.probability.toFixed(2)}%</span>
                                <span className="chance-text">chance of being AI</span>
                            </div>
                            <div className="votes-count">({data.numberOfEvaluations || 0} votes)</div>
                        </div>

                        <div className="verification-container">
                            <div className="badge-icon">
                                <img src={badgeInfo.src} alt={`${selectedBadge || data.badge || 'unknown'} badge`} className="badge-image" />
                            </div>
                            <div className="verification-text">
                                <p>{badgeInfo.message}</p>
                            </div>
                        </div>
                    </div>

                    {/* Badge selection and verification controls */}
                    <div className="badge-selection-container">
                        <div className="badge-dropdown">
                            <label htmlFor="badge-select">Change verification status:</label>
                            <select
                                id="badge-select"
                                value={selectedBadge}
                                onChange={handleBadgeChange}
                                className="status-select"
                            >
                                <option value="" style={{color: selectedBadge === '' ? "#dc3545" : "inherit"}}>
                                    {!data.badge ? "Remove Verification Status" : "Remove Verification"}
                                </option>
                                <option value="human" style={{color: "#28a745"}}>Verify as Human</option>
                                <option value="bot" style={{color: "#dc3545"}}>Verify as Bot</option>
                            </select>
                        </div>
                        <button
                            className="apply-badge-button"
                            onClick={handleBadgeAssignment}
                            disabled={isLoading || selectedBadge === data.badge}
                        >
                            Apply Changes
                        </button>
                    </div>
                </div>
                <EvaluationChart evaluations={evaluations} />
                <ApexBubbleChart evaluations={evaluations} />

                {formattedEvaluations && formattedEvaluations.length > 0 && (
                    <div className="evaluations-section">
                        <h2 className="evaluations-title">Latest evaluations</h2>
                        <div className="evaluations-grid">
                            {formattedEvaluations.slice(0, visibleEvaluations).map((evaluation, index) => (
                                <div key={index} className="evaluation-card">
                                    <div className="evaluator-name">{evaluation.evaluator_name}</div>
                                    <div className={`evaluation-result ${evaluation.is_bot ? 'bot' : 'human'}`}>
                                        Considered this profile a {evaluation.is_bot ? 'bot' : 'human'}.
                                    </div>
                                    <div className="evaluation-date">
                                        On {evaluation.date} - {evaluation.time}
                                    </div>

                                    <div className="evaluation-reason">
                                        <div>Reason(s):</div>
                                        <ul>
                                            {evaluation.reasons.map((reason, i) => (
                                                <li key={i}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="actions-container">
                            {visibleEvaluations > 9 && (
                                <button className="action-button see-less-button" onClick={handleSeeLess}>
                                    See Less
                                </button>
                            )}
                            {hasMoreEvaluations && (
                                <button className="action-button see-more-button" onClick={handleSeeMore}>
                                    See More
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Main render logic
    if (isLoading) {
        return (
            <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (userNotFound) {
        return (
            <div className="error-message">
                ⚠️ User not found or error loading profile.
            </div>
        );
    }


    if (verificationMessage) {
        return (
            <div className={`verification-message ${verificationMessage.type}`}>
                {verificationMessage.type === 'success' ? '✅' : '❌'} {verificationMessage.text}
                <button onClick={() => setVerificationMessage(null)} className="return-button">
                    Return to Profile
                </button>
            </div>
        );
    }

    // Render the appropriate content based on whether a profile is being shown
    return showProfile && data ? renderProfileDetails() : renderSearchForm();
};

export default VerificationSection;