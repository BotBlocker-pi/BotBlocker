import React from 'react';
import '../../css/managment/Sidebar.css';

const VerifierSideBar = ({ activeSection, setActiveSection }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-menu">
                <div
                    className={`sidebar-item ${activeSection === 'verify' || activeSection === 'profile-details' ? 'active' : ''}`}
                    onClick={() => setActiveSection('verify')}
                >
                    <span className="sidebar-text">Verify</span>
                </div>
            </div>
        </div>
    );
};

export default VerifierSideBar;
