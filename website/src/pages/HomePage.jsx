import React, { useState } from 'react';
import '../css/HomePage.css';
import ProfileInfo from '../components/ProfileInfo.jsx';
import { getEvaluationHistory, getProfileData } from '../api/data.jsx';
import Navbar from '../components/Navbar'; // Import the Navbar component

const HomePage = () => {
    const [searchUrl, setSearchUrl] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [username, setUsername] = useState('');
    const [socialMedia, setSocialMedia] = useState('Twitter');
    const [evaluations, setEvaluations] = useState([]);
    const [data, setData] = useState(null);
    const [userNotFound, setUserNotFound] = useState(false);

    // Set the page as loaded after initial render
    React.useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleSearchChange = (e) => {
        setSearchUrl(e.target.value);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        console.log('Searching for:', searchUrl);
        setUserNotFound(false);

        try {
            const profileData = await getProfileData(searchUrl);

            if (!profileData) {
                setUserNotFound(true);
                return;
            }

            setData(profileData);
            const extractedUsername = profileData.perfil_name;
            const platform = profileData.plataform;

            setUsername(extractedUsername || 'unknown_user');
            setSocialMedia(platform);
            setEvaluations(await getEvaluationHistory(searchUrl));
            setShowProfile(true);
        } catch (error) {
            setUserNotFound(true);
            const extractedUsername = searchUrl.replace(/^@/, '');
            setUsername(extractedUsername);
            return;
        }
    };

    const handleCloseProfile = () => {
        setShowProfile(false);
    };

    return (
        <div className={`homepage-container ${isLoaded ? 'fade-in' : ''}`}>
            {/* Navbar component with no props */}
            <Navbar />

            {userNotFound && (
                <div className="error-message" style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
                    ⚠️ User not found or error loading profile.
                </div>
            )}

            {!showProfile ? (
                <main className="main-content">
                    <h1 className="headline">Your Voice Matters. Don't Let AI Drown It Out.</h1>

                    <form className="search-form" onSubmit={handleSearchSubmit}>
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Enter social media URL. Example: https://x.com/BotBlocker"
                                value={searchUrl}
                                onChange={handleSearchChange}
                            />
                            <button type="submit" className="search-button">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        </div>
                    </form>

                    <p className="search-description">
                        Search the social media URL of the profile you want to check<br />
                        whether it is managed by AI or a human.
                    </p>

                    {/* Get authentication status from localStorage for conditional rendering */}
                    {!JSON.parse(localStorage.getItem('isAuthenticated') || 'false') && (
                        <div className="auth-cta">
                            <p>Want to contribute to our community? Login to evaluate profiles and help identify AI bots.</p>
                            <button
                                onClick={() => document.querySelector('.login-button')?.click()}
                                className="login-cta-button"
                            >
                                Sign In To Participate
                            </button>
                        </div>
                    )}
                </main>
            ) : (
                <div className="profile-info-section">
                    <ProfileInfo
                        aiPercentage={data.probability.toFixed(2)}
                        votes={data.numberOfEvaluations}
                        badge={data.badge}
                        username={username}
                        socialMedia={socialMedia}
                        evaluations={evaluations}
                        onClose={handleCloseProfile}
                        isAuthenticated={JSON.parse(localStorage.getItem('isAuthenticated') || 'false')}
                        onLoginClick={() => document.querySelector('.login-button')?.click()}
                    />
                </div>
            )}

            <footer className="footer">
                <div className="help-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <div className="help-text">
                    Understand how<br />
                    bots work
                </div>
            </footer>
        </div>
    );
};

export default HomePage;