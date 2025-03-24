import React, { useState, useEffect } from 'react'
import SettingsNavbar from "./components/SettingsNavbar.jsx";
import BlockingSettings from "./components/BlockingSettings.jsx";

function SettingsPage() {
    return (
        <div>
            <SettingsNavbar/>
            <div style={{display: 'flex', width: '100%'}}>
                <div style={{flex: 1, padding: '20px'}}>
                    <BlockingSettings/>
                </div>
                <div style={{flex: 1, padding: '20px'}}>
                    {/* Right side content will go here */}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage