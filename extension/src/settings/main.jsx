import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client'
import SettingsPage from './pages/SettingsPage.jsx'

document.addEventListener('DOMContentLoaded', function() {
    const root = ReactDOM.createRoot(document.getElementById('settings-root'))
    root.render(
        <React.StrictMode>
            <SettingsPage />
        </React.StrictMode>
    )
})