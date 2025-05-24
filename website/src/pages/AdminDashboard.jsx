import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../css/pages/AdminDashboard.css';
import Navbar from '../components/global/Navbar.jsx';
import AdminSideBar from "../components/managment/AdminSideBar.jsx";
import SpamVotingSection from "../components/managment/spam/SpamVotingSection.jsx";
import VerificationSection from '../components/managment/verify/VerificationSection.jsx';
import AccountsSection from '../components/managment/accounts/AccountsSection.jsx'; // ✅ New import
import { useNotifications } from '../api/NotificationContext.jsx';

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('accounts');
    const notifications = useNotifications();

    // If not an admin, redirect to home page
    const userRole = localStorage.getItem('role') || 'user';
    if (userRole !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="admin-dashboard-container">
            <Navbar />
            <div className="admin-dashboard-wrapper">
                <AdminSideBar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />

                <div className="admin-main-content">
                    {activeSection === 'spamVoting' ? (
                        <SpamVotingSection
                            setActiveSection={setActiveSection}
                            externalNotifications={notifications}
                        />
                    ) : activeSection === 'verify' || activeSection === 'profile-details' ? (
                        <VerificationSection setActiveSection={setActiveSection} />
                    ) : activeSection === 'accounts' ? (
                        <AccountsSection />  // ✅ New section added
                    ) : (
                        <div className="admin-no-section">
                            <p>Please select a section from the sidebar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
