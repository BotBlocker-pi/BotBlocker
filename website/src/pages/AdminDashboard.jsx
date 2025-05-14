import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../css/AdminDashboard.css';
import Navbar from '../components/Navbar';
import AdminSideBar from "../components/AdminSideBar.jsx";
import AnomaliesSection from "../components/AnomaliesSection.jsx";
import VerificationSection from '../components/VerificationSection';
import AccountsSection from '../components/AccountsSection'; // ✅ New import
import { useNotifications } from '../api/NotificationContext.jsx';

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('anomalies');
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
                    {activeSection === 'anomalies' ? (
                        <AnomaliesSection
                            setActiveSection={setActiveSection}
                            externalNotifications={notifications}
                        />
                    ) : activeSection === 'verify' ? (
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
