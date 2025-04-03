import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import botBlockerLogo from '../assets/logo.png';

const Navbar = ({ onLogout }) => {
    

    const renderNavLinks = () => {

        // Links comuns para todos os usuários
        const commonLinks = [
            { to: '/', label: 'HOME' },
            { to: '/understand-bots', label: 'UNDERSTAND BOTS' },
            { to: '/contact', label: 'CONTACT' }
        ];


        

        return commonLinks;
    };

    return (
        <header className="header">
            <div className="logo-container">
                <div className="logo-wrapper">
                    <img src={botBlockerLogo} alt="BotBlocker Logo" className="logo" />
                </div>
            </div>
            <nav className="navigation">
                {renderNavLinks().map((link) => (
                    <Link 
                        key={link.to} 
                        to={link.to} 
                        className="nav-link"
                    >
                        {link.label}
                    </Link>
                ))}
                
                {/* Links de autenticação */}
                {user ? (
                    <>
                        <Link to="/profile" className="nav-link">PROFILE</Link>
                        <button 
                            onClick={onLogout} 
                            className="nav-link logout-btn"
                        >
                            LOGOUT
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="nav-link">LOGIN</Link>
                )}
            </nav>
        </header>
    );
};

export default Navbar;