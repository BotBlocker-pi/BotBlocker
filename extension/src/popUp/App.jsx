import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import BlockedAccounts from './pages/BlockedAccounts';

const App = () => {
    const [currentUrl, setCurrentUrl] = useState(null);

    useEffect(() => {
        // Get current tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                setCurrentUrl(tabs[0].url);
            }
        });
    }, []);

    // Check if we're on Twitter's home page
    const instagramHomeUrls = ["/?variant=home", "/?variant=following", "/explore", "/reels"];

    const isSocialHome = currentUrl && currentUrl.includes('/home') || currentUrl && currentUrl.includes(instagramHomeUrls) || currentUrl === "https://www.instagram.com/";

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {isSocialHome ? <BlockedAccounts /> : <HomePage />}
        </div>
    );
};

export default App;