import React, { useState } from 'react';
import '../../css/search/SearchProfiles.css';

const SearchProfiles = ({ onSearch }) => {
    const [searchUrl, setSearchUrl] = useState('');
    const [username, setUsername] = useState('');
    const [platform, setPlatform] = useState('');

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (searchUrl.trim()) {
            onSearch({ type: 'url', value: searchUrl.trim() });
        }
    };

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        if (!platform || !username.trim()) {
            alert("Please select a platform and enter a username.");
            return;
        }

        const cleanUser = username.trim().replace(/^@/, '');
        let fullUrl = '';

        switch (platform) {
            case 'twitter':
                fullUrl = `https://x.com/${cleanUser}`;
                break;
            case 'instagram':
                fullUrl = `https://instagram.com/${cleanUser}`;
                break;
            case 'facebook':
                fullUrl = `https://facebook.com/${cleanUser}`;
                break;
            default:
                fullUrl = username;
        }

        onSearch({ type: 'username', value: fullUrl });
    };

    return (
        <div className="search-profiles__container">
            <form onSubmit={handleUrlSubmit} className="search-profiles__form-section">
                <p className="search-profiles__label">Search by full social media URL</p>
                <div className="search-profiles__search-box">
                    <input
                        type="text"
                        placeholder="Enter full social media URL"
                        value={searchUrl}
                        onChange={(e) => setSearchUrl(e.target.value)}
                    />
                    <button type="submit" className="search-profiles__search-button" aria-label="Search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                             stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                             viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </button>
                </div>
            </form>

            <div className="search-profiles__divider">OR</div>

            <form onSubmit={handleUsernameSubmit} className="search-profiles__form-section">
                <p className="search-profiles__label">Search by username and platform</p>
                <div className="search-profiles__dropdown-search">
                    <div className="search-profiles__dropdown">
                        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                            <option value="" disabled>Select Platform</option>
                            <option value="twitter">Twitter</option>
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                        </select>
                    </div>

                    <div className="search-profiles__search-box search-profiles__username-search">
                        <input
                            type="text"
                            placeholder="Username (e.g. @BotBlocker)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <button type="submit" className="search-profiles__search-button" aria-label="Search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                                 stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                 viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SearchProfiles;
