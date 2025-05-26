import React from 'react';
import Navbar from "../components/global/Navbar.jsx";
import BlockingSettings from "../components/settings/BlockingSettings.jsx";
import BlackList from "../components/blockList/BlackList.jsx";
import '../css/pages/SettingsPage.css';

function SettingsPage() {
    return (
        <div>
            <Navbar />
            <div className="settings-content">
                <div className="settings-column">
                    <BlockingSettings />
                </div>
                <div className="settings-column">
                    <BlackList />
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;