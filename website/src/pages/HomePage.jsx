import React, { useEffect, useState } from 'react';
import '../css/HomePage.css';
import botBlockerLogo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import ProfileInfo from '../components/ProfileInfo.jsx';
import { getEvaluationHistory, getProfileData } from '../api/data.jsx';
import LoginForm from "../components/LoginForm.jsx";
import { checkAuth, logoutUser } from '../api/loginApi';
 

const HomePage = () => {
    const [searchUrl, setSearchUrl] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [username, setUsername] = useState('');
    const [socialMedia, setSocialMedia] = useState('Twitter');
    const [evaluations, setEvaluations] = useState([]);
    const [data, setData] = useState(null);
    const [userNotFound, setUserNotFound] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [initialLoginMode, setInitialLoginMode] = useState(false); // New state to control initial login mode
    const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if not set


    // Check authentication status on component mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const authStatus = await checkAuth();
                setIsAuthenticated(authStatus);
                localStorage.setItem('isAuthenticated', JSON.stringify(authStatus));
                
                // Se não estiver autenticado, remover o role do localStorage
                if (!authStatus) {
                    localStorage.removeItem('role');
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsAuthenticated(false);
                localStorage.removeItem('role');
            }
        };

        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth) {
            setIsAuthenticated(JSON.parse(storedAuth));
            
            // Verificar a autenticação ao carregar a página
            if (!JSON.parse(storedAuth)) {
                localStorage.removeItem('role');
            }
        }

        checkAuthStatus();
        setIsLoaded(true);
    }, []);

    const handleAuthChange = (status) => {
        setIsAuthenticated(status);
        localStorage.setItem('isAuthenticated', JSON.stringify(status));
        
        // Se não estiver autenticado, remover o role
        if (!status) {
            localStorage.removeItem('role');
        }
        
        setShowLoginModal(false);
    };

    const handleLogout = () => {
        logoutUser();
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role'); // Remover o role ao fazer logout
    };

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

    const toggleLoginModal = (registerMode = false) => {
        setInitialLoginMode(registerMode);
        setShowLoginModal(!showLoginModal);
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

                    {userRole === 'verifier' && (
                        <Link to="/verification-dashboard" className="nav-link">VERIFICATION DASHBOARD</Link>
                    )}


                    {isAuthenticated ? (
                        <div className="auth-controls">
                            <span className="user-status">✓ Logged In</span>
                            <button onClick={handleLogout} className="logout-button">Logout</button>
                        </div>
                    ) : (
                        <button onClick={() => toggleLoginModal(false)} className="login-button">Login</button>
                    )}
                </nav>
            </header>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="login-modal">
                    <div className="login-modal-content">
                        <div className="modal-header">
                            <h2>Account Login</h2>
                            <button onClick={() => toggleLoginModal()} className="close-button">&times;</button>
                        </div>

                        <LoginForm
                            onAuthChange={handleAuthChange}
                            onClose={() => toggleLoginModal()}
                            initialMode={initialLoginMode}
                        />
                    </div>
                </div>
            )}

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

                    {/* Additional CTA for non-authenticated users */}
                    {!isAuthenticated && (
                        <div className="auth-cta">
                            <p>Want to contribute to our community? Login to evaluate profiles and help identify AI bots.</p>
                            <button
                                onClick={() => toggleLoginModal(true)}
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
                        isAuthenticated={isAuthenticated}
                        onLoginClick={() => toggleLoginModal(true)}
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