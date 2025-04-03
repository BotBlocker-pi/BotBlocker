import React, { useState, useEffect } from 'react'
import Navbar from "./components/global/Navbar.jsx";
import BlockingSettings from "./components/BlockingSettings.jsx";
import BlockList from "./components/BlockList.jsx";

function SettingsPage() {
    return (
        <div>
            <Navbar/>
            <div style={{
                display: 'flex',
                width: '100%',
                padding: '0 20px',
                gap: '20px',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    flex: 1,
                    padding: '20px 0',
                    boxSizing: 'border-box'
                }}>
                    <BlockingSettings/>
                </div>
                <div style={{
                    flex: 1,
                    padding: '20px 0',
                    boxSizing: 'border-box'
                }}>
                    <BlockList />
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;