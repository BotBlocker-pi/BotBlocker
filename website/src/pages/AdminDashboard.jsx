import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import '../css/AdminDashboard.css';
import Navbar from '../components/Navbar';
import AdminSideBar from "../components/AdminSideBar.jsx";
import AnomaliesSection from "../components/AnomaliesSection.jsx";
import VerificationSection from '../components/VerificationSection';
import { useNotifications } from '../api/NotificationContext.jsx'; 

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('anomalies');
    const [isLoaded, setIsLoaded] = useState(false);
    const notifications = useNotifications();

    // If not an admin, redirect to home page
    const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if not set
    if (userRole !== 'admin') {
        return <Navigate to="/" />;
    }

    return (
        <div className="admin-dashboard-container">
            {/* Navbar component */}
            <Navbar />

            {/* Main dashboard container */}
            <div className="admin-dashboard-wrapper">
                {/* Sidebar component */}
                <AdminSideBar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />

                {/* Main content */}
                <div className="admin-main-content">
                    {activeSection === 'anomalies' ? (
                        <AnomaliesSection
                            setActiveSection={setActiveSection}
                            externalNotifications={notifications}
                        />
                    ) : activeSection === 'verify' || activeSection === 'profile-details' ? (
                        <VerificationSection setActiveSection={setActiveSection} />
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
