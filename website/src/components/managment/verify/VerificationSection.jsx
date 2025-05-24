// Path: /components/managment/VerificationSection.jsx

import React, { useState } from 'react';
import { getEvaluationHistory, getProfileData, assignBadgeToProfile } from '../../../api/data.jsx';
import '../../../css/managment/verify/VerificationSection.css';
import BotBadge from '../../../assets/badges/botBadge.png';
import HumanBadge from '../../../assets/badges/humanBadge.png';
import UnknownBadge from '../../../assets/badges/unknownBadge.png';

const VerificationSection = ({ setActiveSection }) => {
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
    const [visibleEvaluations, setVisibleEvaluations] = useState(9);

    const handleSeeMore = () => setVisibleEvaluations((prev) => prev + 9);
    const handleSeeLess = () => setVisibleEvaluations((prev) => Math.max(9, prev - 9));
    const handleSearchChange = (e) => setSearchUrl(e.target.value);
    const handleUsernameChange = (e) => setUsernameSearch(e.target.value);
    const handleSocialMediaChange = (e) => setSelectedSocialMedia(e.target.value);
    const handleBadgeChange = (e) => setSelectedBadge(e.target.value);

    const buildFullUrl = () => {
        const cleanUser = usernameSearch.replace(/^@/, '');
        switch (selectedSocialMedia) {
            case 'twitter': return `https://x.com/${cleanUser}`;
            case 'instagram': return `https://instagram.com/${cleanUser}`;
            case 'facebook': return `https://facebook.com/${cleanUser}`;
            case 'linkedin': return `https://linkedin.com/in/${cleanUser}`;
            default: return usernameSearch;
        }
    };

    const searchAndLoadProfile = async (fullUrl) => {
        setUserNotFound(false);
        setIsLoading(true);
        setVisibleEvaluations(9);

        try {
            const profileData = await getProfileData(fullUrl);
            if (!profileData) return setUserNotFound(true);

            const { perfil_name, plataform, badge } = profileData;
            setData(profileData);
            setUsername(perfil_name || 'unknown_user');
            setSocialMedia(plataform);
            setSelectedBadge(badge || '');
            const evals = await getEvaluationHistory(fullUrl);
            setEvaluations(evals || []);
            setShowProfile(true);
            setActiveSection('profile-details');
        } catch (err) {
            setUserNotFound(true);
            setUsername(fullUrl.replace(/^@/, ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUrlSearchSubmit = (e) => {
        e.preventDefault();
        if (searchUrl.trim()) searchAndLoadProfile(searchUrl.trim());
    };

    const handleUsernameSearchSubmit = (e) => {
        e.preventDefault();
        if (!selectedSocialMedia || !usernameSearch.trim()) return alert("Please fill all fields.");
        const fullUrl = buildFullUrl();
        searchAndLoadProfile(fullUrl);
    };

    const handleBadgeAssignment = async () => {
        if (!data?.perfil_id) {
            return setVerificationMessage({ type: 'error', text: 'Missing profile ID.' });
        }

        setIsLoading(true);
        try {
            const result = await assignBadgeToProfile(data.perfil_id, selectedBadge || '');
            if (result.success) {
                setVerificationMessage({ type: 'success', text: selectedBadge ? result.message : 'Removed verification.' });
                setData({ ...data, badge: selectedBadge });

                // Automatically return to profile after a short delay
                setTimeout(() => {
                    setVerificationMessage(null);
                    // Ensure the profile stays visible
                    setShowProfile(true);
                    setActiveSection('profile-details');
                }, 2000);
            } else {
                setVerificationMessage({ type: 'error', text: result.error });
            }
        } catch {
            setVerificationMessage({ type: 'error', text: 'Server error.' });
        } finally {
            setIsLoading(false);
        }
    };

    const formatEvaluations = (evals) => (evals || []).map((e) => {
        const date = new Date(e.created_at || Date.now());
        return {
            evaluator_name: e.user || 'Anonymous',
            is_bot: e.is_bot || false,
            date: date.toLocaleDateString(),
            time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            reasons: [e.notas || 'No reason provided']
        };
    });

    const getBadgeInfo = (badge) => {
        switch (badge) {
            case 'bot': return { src: BotBadge, message: "Verified as bot." };
            case 'human': return { src: HumanBadge, message: "Verified as human." };
            default: return { src: UnknownBadge, message: "Status unknown." };
        }
    };

    if (isLoading) return <div className="loading-indicator"><div className="spinner"></div><p>Loading...</p></div>;
    if (userNotFound) return <div className="error-message">⚠️ User not found or error loading profile.</div>;
    if (verificationMessage) return (
        <div className={`verification-message ${verificationMessage.type}`}>
            {verificationMessage.type === 'success' ? '✅' : '❌'} {verificationMessage.text}
        </div>
    );

    return showProfile && data ? (
        <div className="profile-container">
            <button className="close-button" onClick={() => { setShowProfile(false); setActiveSection('verify'); }}>×</button>

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
                            <img src={getBadgeInfo(selectedBadge || data.badge).src} alt="badge" className="badge-image" />
                        </div>
                        <div className="verification-text">
                            <p>{getBadgeInfo(selectedBadge || data.badge).message}</p>
                        </div>
                    </div>
                </div>

                <div className="badge-selection-container">
                    <div className="badge-dropdown">
                        <label htmlFor="badge-select">Change verification status:</label>
                        <select id="badge-select" value={selectedBadge} onChange={handleBadgeChange}>
                            <option value="">Remove Verification</option>
                            <option value="human">Verify as Human</option>
                            <option value="bot">Verify as Bot</option>
                        </select>
                    </div>
                    <button
                        onClick={handleBadgeAssignment}
                        disabled={isLoading || selectedBadge === data.badge}
                        className="apply-badge-button"
                    >
                        Apply Changes
                    </button>
                </div>
            </div>

            {evaluations.length > 0 && (
                <div className="evaluations-section">
                    <h2 className="evaluations-title">Latest evaluations</h2>
                    <div className="evaluations-grid">
                        {formatEvaluations(evaluations).slice(0, visibleEvaluations).map((e, i) => (
                            <div key={i} className="evaluation-card">
                                <div className="evaluator-name">{e.evaluator_name}</div>
                                <div className={`evaluation-result ${e.is_bot ? 'bot' : 'human'}`}>
                                    Considered this profile a {e.is_bot ? 'bot' : 'human'}.
                                </div>
                                <div className="evaluation-date">On {e.date} - {e.time}</div>
                                <div className="evaluation-reason">
                                    <div>Reason(s):</div>
                                    <ul>{e.reasons.map((r, j) => <li key={j}>{r}</li>)}</ul>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="actions-container">
                        {visibleEvaluations > 9 && <button className="action-button see-less-button" onClick={handleSeeLess}>See Less</button>}
                        {evaluations.length > visibleEvaluations && <button className="action-button" onClick={handleSeeMore}>See More</button>}
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className="verification-container">
            <h2 className="verification-title">Verify Profiles</h2>
            <form onSubmit={handleUrlSearchSubmit} className="form-section">
                <div className="label-text">Search by full social media URL</div>
                <div className="search-box">
                    <input type="text" placeholder="Enter full social media URL" value={searchUrl} onChange={handleSearchChange} />
                    <button type="submit" className="search-button">🔍</button>
                </div>
            </form>

            <div className="search-divider">OR</div>

            <form onSubmit={handleUsernameSearchSubmit} className="form-section">
                <div className="label-text">Search by username and platform</div>
                <div className="dropdown-search">
                    <div className="dropdown">
                        <select value={selectedSocialMedia} onChange={handleSocialMediaChange}>
                            <option value="" disabled>Select Platform</option>
                            <option value="twitter">Twitter</option>
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                        </select>
                    </div>
                    <div className="search-box username-search">
                        <input type="text" placeholder="Username (e.g. @BotBlocker)" value={usernameSearch} onChange={handleUsernameChange} />
                        <button type="submit" className="search-button">🔍</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default VerificationSection;
