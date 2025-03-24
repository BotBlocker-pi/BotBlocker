import React, { useState, useEffect } from 'react'
import Navbar from "./components/global/Navbar.jsx";
import BlockingSettings from "./components/BlockingSettings.jsx";

function SettingsPage() {
    return (
        <div>
            <Navbar/>
            <div style={{display: 'flex', width: '100%', padding: '0 20px'}}> {/* Move padding here */}
                <div style={{flex: 1, padding: '20px 0'}}> {/* Only vertical padding now */}
                    <BlockingSettings/>
                </div>
                <div style={{flex: 1, padding: '20px 0'}}>
                    {/* Right side content will go here */}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage