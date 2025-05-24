import React from 'react';
import '../../css/components/global/Navbar.css';
import Logo from '../../../assets/logo.png';
import { FaCog } from 'react-icons/fa';
import { logoutUser } from '../../../api/loginApi.jsx';

const Navbar = ({ onLoginClick, showBackButton = false, onBack, isAuthenticated }) => {
    const handleSettingsClick = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    };

    const handleLogoutClick = () => {
        logoutUser();
        localStorage.removeItem('isAuthenticated');
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {showBackButton ? (
                    <button className="question-back-button" onClick={onBack}>Back</button>
                ) : (
                    <img src={Logo} alt="Logo" className="logo-image" />
                )}
            </div>

            <div className="navbar-icons">
                {!showBackButton && (
                    <>
                        {isAuthenticated ? (
                            <button className="logout-button-navbar" onClick={handleLogoutClick}>
                                Logout
                            </button>
                        ) : (
                            <button className="login-button-navbar" onClick={onLoginClick}>
                                Login
                            </button>
                        )}
                    </>
                )}
                <FaCog className="icon" onClick={handleSettingsClick} title="Settings" />
            </div>
        </nav>
    );
};

export default Navbar;
