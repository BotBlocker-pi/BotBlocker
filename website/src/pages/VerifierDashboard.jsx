import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import '../css/VerifierDashboard.css';
import { checkAuth, logoutUser } from '../api/loginApi';
import Navbar from '../components/Navbar';
import VerifierSideBar from '../components/VerifierSideBar';
import VerificationSection from '../components/VerificationSection';

const VerifierDashboard = () => {
    // State to control which section is active in the sidebar
    const [activeSection, setActiveSection] = useState('verify');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // If not a verifier, redirect to home page
    const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if not set
    if (userRole !== 'verifier') {
        return <Navigate to="/" />;
    }

    // Check authentication when component mounts
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const authStatus = await checkAuth();
                setIsAuthenticated(authStatus);
                localStorage.setItem('isAuthenticated', JSON.stringify(authStatus));

                // If not authenticated, remove role from localStorage
                if (!authStatus) {
                    localStorage.removeItem('role');
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsAuthenticated(false);
                localStorage.removeItem('role');
            }
        };

        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth) {
            setIsAuthenticated(JSON.parse(storedAuth));

            // Check authentication when loading the page
            if (!JSON.parse(storedAuth)) {
                localStorage.removeItem('role');
            }
        }

        checkAuthStatus();
        setIsLoaded(true);
    }, []);

    const handleLogout = () => {
        logoutUser();
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role'); // Remove role when logging out
    };

    const toggleLoginModal = (registerMode = false) => {
        setShowLoginModal(!showLoginModal);
    };

    return (
        <div className="verification-dashboard">
            {/* Navbar component */}
            <Navbar
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                onLogout={handleLogout}
                toggleLoginModal={toggleLoginModal}
            />

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