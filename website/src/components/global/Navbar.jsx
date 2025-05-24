import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import botBlockerLogo from '../../assets/logo.png';
import '../../css/global/Navbar.css';
import { checkAuth, logoutUser } from '../../api/loginApi.jsx';
import LoginForm from "./LogIn.jsx";
import { useNotifications } from '../../api/NotificationContext.jsx';

const Navbar = () => {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [initialLoginMode, setInitialLoginMode] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const protectedRoutes = ['/admin-dashboard', '/verification-dashboard'];

    const userRole = localStorage.getItem('role') || 'user';
    const rawNotifications = isAuthenticated ? useNotifications() : [];

    // 🔁 Always check auth status when the route changes
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setIsAuthenticated(false);
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('role');
                return;
            }

            try {
                const authStatus = await checkAuth();
                setIsAuthenticated(authStatus);
                localStorage.setItem('isAuthenticated', JSON.stringify(authStatus));
                if (!authStatus) {
                    localStorage.removeItem('role');
                }
            } catch {
                setIsAuthenticated(false);
                localStorage.removeItem('role');
            }
        };

        checkAuthStatus();
    }, [location.pathname]); // ✅ Run on every route change

    // Load notifications for admins
    useEffect(() => {
        if (isAuthenticated && protectedRoutes.includes(location.pathname)) {
            setNotifications(rawNotifications);
        }
    }, [rawNotifications, isAuthenticated, location.pathname]);

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
        window.location.href = '/';
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
                    <Link to="/" className={`navbar-nav-link ${location.pathname === '/' ? 'active' : ''}`}>HOME</Link>
                    <Link to="/understand-bots" className={`navbar-nav-link ${location.pathname === '/understand-bots' ? 'active' : ''}`}>UNDERSTAND BOTS</Link>
                    <Link to="/contact" className={`navbar-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>CONTACT</Link>

                    {userRole === 'verifier' && (
                        <Link to="/verification-dashboard" className={`navbar-nav-link ${location.pathname === '/verification-dashboard' ? 'active' : ''}`}>
                            VERIFICATION DASHBOARD
                        </Link>
                    )}

                    {userRole === 'admin' && isAuthenticated && (
                        <>
                            <Link to="/admin-dashboard" className={`navbar-nav-link ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}>
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
                        <span onClick={() => toggleLoginModal(false)} className="navbar-nav-link" style={{ cursor: 'pointer' }}>
                            LOGIN
                        </span>
                    )}
                </nav>
            </header>

            {showLoginModal && (
                <div className="navbar-login-modal">
                    <div className="navbar-login-modal-content">
                        <div className="navbar-modal-header">
                            <button onClick={() => toggleLoginModal()} className="navbar-close-button">&times;</button>
                        </div>

                        <LoginForm
                            onAuthChange={handleAuthChange}
                            onClose={() => setShowLoginModal(false)}
                            initialMode={initialLoginMode}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;