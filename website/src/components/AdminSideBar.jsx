import React from 'react';
import '../css/AdminSideBar.css';

const AdminSideBar = ({ activeSection, setActiveSection }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-menu">
                <div
                    className={`sidebar-item ${activeSection === 'accounts' ? 'active' : ''}`}
                    onClick={() => setActiveSection('accounts')}
                >
                    <span className="sidebar-text">Accounts</span>
                </div>

                <div
                    className={`sidebar-item ${activeSection === 'verify' ? 'active' : ''}`}
                    onClick={() => setActiveSection('verify')}
                >
                    <span className="sidebar-text">Verify</span>
                </div>

                <div
                    className={`sidebar-item ${activeSection === 'spamVoting' ? 'active' : ''}`}
                    onClick={() => setActiveSection('spamVoting')}
                >
                    <span className="sidebar-text">Spam Voting</span>
                </div>
            </div>
        </div>
    );
};

export default AdminSideBar;
