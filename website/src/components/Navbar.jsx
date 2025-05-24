import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import botBlockerLogo from '../assets/logo.png';
import '../css/Navbar.css';
import { checkAuth, logoutUser } from '../api/loginApi';
import LoginForm from "./LoginForm.jsx";
import { useNotifications } from '../api/NotificationContext.jsx';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [initialLoginMode, setInitialLoginMode] = useState(false);
    const notifications = useNotifications();
    const userRole = localStorage.getItem('role') || 'user';
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(notifications ? notifications.length : 0);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const authStatus = await checkAuth();
                setIsAuthenticated(authStatus);
                localStorage.setItem('isAuthenticated', JSON.stringify(authStatus));
                if (!authStatus) localStorage.removeItem('role');
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsAuthenticated(false);
                localStorage.removeItem('role');
            }
        };

        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth) {
            setIsAuthenticated(JSON.parse(storedAuth));
            if (!JSON.parse(storedAuth)) localStorage.removeItem('role');
        }

        checkAuthStatus();
    }, []);

    const handleAuthChange = (status) => {
        setIsAuthenticated(status);
        localStorage.setItem('isAuthenticated', JSON.stringify(status));
        if (!status) localStorage.removeItem('role');
        setShowLoginModal(false);
    };

    const handleLogout = () => {
        logoutUser();
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role');
    };

    const toggleLoginModal = (registerMode = false) => {
        setInitialLoginMode(registerMode);
        setShowLoginModal(!showLoginModal);
    };

    return (
        <>
            <header className="navbar-header">
                <div className="navbar-logo-container">
                    <Link to="/" className="navbar-logo-wrapper">
                        <img src={botBlockerLogo} alt="BotBlocker Logo" className="navbar-logo" />
                    </Link>
                </div>
                <nav className="navbar-navigation">
                    <Link to="/" className={`navbar-nav-link ${window.location.pathname === '/' ? 'active' : ''}`}>HOME</Link>
                    <Link to="/understand-bots" className={`navbar-nav-link ${window.location.pathname === '/understand-bots' ? 'active' : ''}`}>UNDERSTAND BOTS</Link>
                    <Link to="/contact" className={`navbar-nav-link ${window.location.pathname === '/contact' ? 'active' : ''}`}>CONTACT</Link>

                    {userRole === 'verifier' && (
                        <Link to="/verification-dashboard" className={`navbar-nav-link ${window.location.pathname === '/verification-dashboard' ? 'active' : ''}`}>
                            VERIFICATION DASHBOARD
                        </Link>
                    )}

                    {userRole === 'admin' && (
                        <>
                            <Link to="/admin-dashboard" className={`navbar-nav-link ${window.location.pathname === '/admin-dashboard' ? 'active' : ''}`}>
                                ADMIN DASHBOARD
                            </Link>

                            <div className="navbar-notification-wrapper">
                                <button
                                    className="navbar-notification-button"
                                    onClick={() => {
                                        setShowNotificationDropdown(!showNotificationDropdown);
                                        setUnreadCount(notifications.length);
                                    }}
                                >
                                    <Bell size={20} strokeWidth={2} />
                                    {notifications.length - unreadCount > 0 && (
                                        <span className="navbar-notification-count">
                                            {notifications.length - unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotificationDropdown && (
                                    <div className="navbar-notification-dropdown">
                                        <strong>Notifications</strong>
                                        <ul className="navbar-notification-list">
                                            {notifications.length === 0 ? (
                                                <li className="navbar-notification-empty">No new notifications.</li>
                                            ) : (
                                                notifications.slice().reverse().map((n, i) => (
                                                    <li key={i} className="navbar-notification-item">
                                                        <div className="navbar-notification-user">
                                                            <strong>{n.username}</strong> ({n.type_account})
                                                        </div>
                                                        <div className="navbar-notification-motive">{n.motive}</div>
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
                        <button onClick={handleLogout} className="navbar-logout-button">Logout</button>
                    ) : (
                        <button onClick={() => toggleLoginModal(false)} className="navbar-login-button">Login</button>
                    )}
                </nav>
            </header>

            {showLoginModal && (
                <div className="navbar-login-modal">
                    <div className="navbar-login-modal-content">
                        <div className="navbar-modal-header">
                            <h2>Account Login</h2>
                            <button onClick={() => toggleLoginModal()} className="navbar-close-button">&times;</button>
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