import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import '../css/pages/VerifierDashboard.css';
import Navbar from '../components/global/Navbar.jsx';
import VerifierSideBar from '../components/managment/VerifierSideBar.jsx';
import VerificationSection from '../components/managment/verify/VerificationSection.jsx';

const VerifierDashboard = () => {
    // State to control which section is active in the sidebar
    const [activeSection, setActiveSection] = useState('verify');
    const [isLoaded, setIsLoaded] = useState(false);

    // If not a verifier, redirect to home page
    const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if not set
    if (userRole !== 'verifier') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="verification-dashboard">
            {/* Navbar component with no auth props */}
            <Navbar />

            {/* Main dashboard container */}
            <div className="dashboard-container">
                {/* Sidebar component */}
                <VerifierSideBar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />

                {/* Main content */}
                <div className="main-content">
                    <VerificationSection setActiveSection={setActiveSection} />
                </div>
            </div>
        </div>
    );
};

export default VerifierDashboard;