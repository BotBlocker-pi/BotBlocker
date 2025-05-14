import React from 'react';
import '../css/AdminSideBar.css';

const AdminSideBar = ({ activeSection, setActiveSection }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-menu">
                <div
                    className={`menu-item ${activeSection === 'anomalies' ? 'active' : ''}`}
                    onClick={() => setActiveSection('anomalies')}
                >
                    <span className="menu-icon">🔎</span>
                    <span className="menu-text">Anomalies</span>
                </div>

                <div
                    className={`menu-item ${activeSection === 'verify' ? 'active' : ''}`}
                    onClick={() => setActiveSection('verify')}
                >
                    <span className="menu-icon">⚙️</span>
                    <span className="menu-text">Verify</span>
                </div>

                <div
                    className={`menu-item ${activeSection === 'accounts' ? 'active' : ''}`}
                    onClick={() => setActiveSection('accounts')}
                >
                    <span className="menu-icon">👤</span>
                    <span className="menu-text">Accounts</span>
                </div>
            </div>
        </div>
    );
};

export default AdminSideBar;
