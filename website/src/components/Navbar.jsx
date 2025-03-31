import React from 'react';
import { Link } from 'react-router-dom';
import botBlockerLogo from '../assets/logo.png';

const Navbar = () => {
    return (
        <header className="header">
            <div className="logo-container">
                <div className="logo-wrapper">
                    <img src={botBlockerLogo} alt="BotBlocker Logo" className="logo" />
                </div>
            </div>
            <nav className="navigation">
                <Link to="/" className="nav-link active">HOME</Link>
                <Link to="/understand-bots" className="nav-link">UNDERSTAND BOTS</Link>
                <Link to="/contact" className="nav-link">CONTACT</Link>
            </nav>
        </header>
    );
};

export default Navbar;