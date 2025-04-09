import React from 'react';
import '../css/VerifierSideBar.css';

const VerifierSideBar = ({ activeSection, setActiveSection }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-menu">
                <div
                    className={`menu-item ${activeSection === 'verify' || activeSection === 'profile-details' ? 'active' : ''}`}
                    onClick={() => setActiveSection('verify')}
                >
                    <span className="menu-icon">✅</span>
                    <span className="menu-text">Verify</span>
                </div>
            </div>
        </div>
    );
};

export default VerifierSideBar;