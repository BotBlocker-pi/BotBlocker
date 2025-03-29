import React, {useEffect, useState} from 'react';
import '../css/HomePage.css';
import botBlockerLogo from '../assets/logo.png'; // Adjust the path as needed
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [searchUrl, setSearchUrl] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

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