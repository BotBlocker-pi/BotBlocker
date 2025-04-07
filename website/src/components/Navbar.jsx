import React from 'react';
import { Link } from 'react-router-dom';
import botBlockerLogo from '../assets/logo.png';
import '../css/Navbar.css';

const Navbar = ({ isAuthenticated, userRole, onLogout, toggleLoginModal }) => {
    return (
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

                {isAuthenticated ? (
                    <button onClick={onLogout} className="logout-button">Logout</button>
                ) : (
                    <button onClick={() => toggleLoginModal(false)} className="login-button">Login</button>
                )}
            </nav>
        </header>
    );
};

export default Navbar;