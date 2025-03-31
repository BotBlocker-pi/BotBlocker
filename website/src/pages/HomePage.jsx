import React, {useEffect, useState} from 'react';
import '../css/HomePage.css';
import botBlockerLogo from '../assets/logo.png'; // Adjust the path as needed
import { Link } from 'react-router-dom';
import ProfileInfo from '../components/ProfileInfo.jsx';

const HomePage = () => {
    const [searchUrl, setSearchUrl] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [username, setUsername] = useState('');
    const [socialMedia, setSocialMedia] = useState('Twitter');
    const [evaluations, setEvaluations] = useState([]);

    // Sample evaluations data from backend, now with reasons
    const sampleEvaluations = [
        {
            id: 1,
            user: "John Smith",
            is_bot: false,
            notes: "Regular activity patterns",
            created_at: "2025-01-24T14:08:23.696944",
            reasons: ["Consistent writing style", "Regular posting intervals"]
        },
        {
            id: 2,
            user: "Angela Ribeiro",
            is_bot: true,
            notes: "Multiple inconsistencies detected",
            created_at: "2025-02-20T11:02:00.000000",
            reasons: ["AI-generated images", "Inconsistent posting", "Unnatural posting patterns"]
        }
    ];

    useEffect(() => {
        // Add animation class after component mounts
        setIsLoaded(true);
    }, []);

    const handleSearchChange = (e) => {
        setSearchUrl(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Implement your search functionality here
        console.log('Searching for:', searchUrl);

        // Extract username from URL (simple example)
        let extractedUsername = '';
        let platform = 'Twitter';

        try {
            const url = new URL(searchUrl);
            const hostname = url.hostname.toLowerCase();

            // Determine platform based on hostname
            if (hostname.includes('twitter') || hostname.includes('x.com')) {
                platform = 'Twitter';
            } else if (hostname.includes('instagram')) {
                platform = 'Instagram';
            } else if (hostname.includes('facebook')) {
                platform = 'Facebook';
            } else if (hostname.includes('tiktok')) {
                platform = 'TikTok';
            } else if (hostname.includes('linkedin')) {
                platform = 'LinkedIn';
            } else if (hostname.includes('youtube')) {
                platform = 'YouTube';
            }

            // Extract username from URL path
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
                extractedUsername = pathParts[pathParts.length - 1];
            }
        } catch (error) {
            // If not a valid URL, just use the input as username
            extractedUsername = searchUrl.replace(/^@/, ''); // Remove @ if present
        }

        setUsername(extractedUsername || 'unknown_user');
        setSocialMedia(platform);
        setEvaluations(sampleEvaluations); // In a real app, this would come from an API call
        setShowProfile(true);
    };

    const handleCloseProfile = () => {
        setShowProfile(false);
    };

    return (
        <div className={`homepage-container ${isLoaded ? 'fade-in' : ''}`}>
            <header className="header">
                <div className="logo-container">
                    <div className="logo-wrapper">
                        <img src={botBlockerLogo} alt="BotBlocker Logo" className="logo" />
                    </div>
                </div>
                <nav className="navigation">
                    <a href="#" className="nav-link active">HOME</a>
                    <a href="/understand-bots" className="nav-link">UNDERSTAND BOTS</a>
                    <a href="/contact" className="nav-link">CONTACT</a>
                </nav>
            </header>

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
                </main>
            ) : (
                <div className="profile-info-section">
                    <ProfileInfo
                        aiPercentage={15}
                        votes={105}
                        badge="human"
                        username={username}
                        socialMedia={socialMedia}
                        evaluations={evaluations}
                        onClose={handleCloseProfile}
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