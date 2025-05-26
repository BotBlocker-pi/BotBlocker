import React, { useState } from 'react';
import '../css/pages/HomePage.css';
import ProfileInfo from '../components/search/ProfileInfo.jsx';
import { getEvaluationHistory, getProfileData } from '../api/data.jsx';
import Navbar from '../components/global/Navbar.jsx';
import SearchProfiles from '../components/search/SearchProfiles.jsx';

const HomePage = () => {
    const [showProfile, setShowProfile] = useState(false);
    const [username, setUsername] = useState('');
    const [socialMedia, setSocialMedia] = useState('Twitter');
    const [evaluations, setEvaluations] = useState([]);
    const [data, setData] = useState(null);
    const [userNotFound, setUserNotFound] = useState(false);

    const handleSearchSubmit = async ({ value }) => {
        setUserNotFound(false);
        try {
            const profileData = await getProfileData(value);
            if (!profileData) {
                setUserNotFound(true);
                return;
            }

            setData(profileData);
            setUsername(profileData.perfil_name || 'unknown_user');
            setSocialMedia(profileData.plataform);
            setEvaluations(await getEvaluationHistory(value));
            setShowProfile(true);
        } catch (error) {
            setUserNotFound(true);
            setUsername(value.replace(/^@/, ''));
        }
    };

    const handleCloseProfile = () => {
        setShowProfile(false);
    };

    return (
        <div className="homepage-container">
            <Navbar />

            {userNotFound && (
                <div className="error-message" style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
                    ⚠️ User not found or error loading profile.
                </div>
            )}

            {!showProfile ? (
                <main className="main-content">
                    <h1 className="headline">Your Voice Matters. Don't Let AI Drown It Out.</h1>
                    <p className="sub-slogan">
                        Search the social media URL of the profile you want to check<br />
                        whether it is managed by AI or a human.
                    </p>

                    <SearchProfiles onSearch={handleSearchSubmit} />
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
        </div>
    );
};

export default HomePage;