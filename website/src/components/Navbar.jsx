import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import botBlockerLogo from '../assets/logo.png';
import '../css/Navbar.css';
import { checkAuth, logoutUser } from '../api/loginApi';
import LoginForm from "./LoginForm.jsx";
import {useNotifications} from '../api/NotificationContext.jsx';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [initialLoginMode, setInitialLoginMode] = useState(false);
    const notifications = useNotifications();
    const userRole = localStorage.getItem('role') || 'user';
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(notifications?notifications.length:0);
    // Check authentication status on component mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const authStatus = await checkAuth();
                setIsAuthenticated(authStatus);
                localStorage.setItem('isAuthenticated', JSON.stringify(authStatus));

                // If not authenticated, remove role from localStorage
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

            // Check authentication when loading the page
            if (!JSON.parse(storedAuth)) {
                localStorage.removeItem('role');
            }
        }

        checkAuthStatus();
    }, []);

    const handleAuthChange = (status) => {
        setIsAuthenticated(status);
        localStorage.setItem('isAuthenticated', JSON.stringify(status));

        // If not authenticated, remove role
        if (!status) {
            localStorage.removeItem('role');
        }

        setShowLoginModal(false);
    };

    const handleLogout = () => {
        logoutUser();
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role'); // Remove role when logging out
    };

    const toggleLoginModal = (registerMode = false) => {
        setInitialLoginMode(registerMode);
        setShowLoginModal(!showLoginModal);
    };

    return (
        <>
            <header className="header">
                <div className="logo-container">
                    <Link to="/" className="logo-wrapper">
                        <img src={botBlockerLogo} alt="BotBlocker Logo" className="logo" />
                    </Link>
                </div>
                <nav className="navigation">
                    <Link to="/" className={`nav-link ${window.location.pathname === '/' ? 'active' : ''}`}>HOME</Link>
                    <Link to="/understand-bots" className={`nav-link ${window.location.pathname === '/understand-bots' ? 'active' : ''}`}>UNDERSTAND BOTS</Link>
                    <Link to="/contact" className={`nav-link ${window.location.pathname === '/contact' ? 'active' : ''}`}>CONTACT</Link>

                    {userRole === 'verifier' && (
                        <Link
                            to="/verification-dashboard"
                            className={`nav-link ${window.location.pathname === '/verification-dashboard' ? 'active' : ''}`}
                        >
                            VERIFICATION DASHBOARD
                        </Link>
                    )}

            {userRole === 'admin' && (
            <>
                <Link
                to="/admin-dashboard"
                className={`nav-link ${window.location.pathname === '/admin-dashboard' ? 'active' : ''}`}
                >
                ADMIN DASHBOARD
                </Link>

                <div className="notification-wrapper">
                <button
                    className="notification-button"
                    onClick={() => {
                    setShowNotificationDropdown(!showNotificationDropdown);
                    setUnreadCount(notifications.length);
                    }}
                >
                    🔔
                    {notifications.length - unreadCount > 0 && (
                    <span className="notification-count">
                        {notifications.length - unreadCount}
                    </span>
                    )}
                </button>

                {showNotificationDropdown && (
                    <div className="notification-dropdown">
                    <strong>Notifications</strong>
                    <ul className="notification-list">
                        {notifications.length === 0 ? (
                        <li className="notification-empty">No new notifications.</li>
                        ) : (
                        notifications.slice().reverse().map((n, i) => (
                            <li key={i} className="notification-item">
                            <div className="notification-user">
                                <strong>{n.username}</strong> ({n.type_account})
                            </div>
                            <div className="notification-motive">{n.motive}</div>
                            </li>
                        ))
                        )}
                    </ul>
                    </div>
                )}
                </div>
            </>
            )}


                    {isAuthenticated ? (
                        <button onClick={handleLogout} className="logout-button">Logout</button>
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
        </>
    );
};

export default Navbar;