import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import '../css/AdminDashboard.css';
import Navbar from '../components/Navbar';
import AdminSideBar from "../components/AdminSideBar.jsx";
import AnomaliesSection from "../components/AnomaliesSection.jsx";
import VerificationSection from '../components/VerificationSection';

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('anomalies');
    const [notifications, setNotifications] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // If not an admin, redirect to home page
    const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if not set
    if (userRole !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        setIsLoaded(true);
        const socket = new WebSocket(
          "ws://" + window.location.host + "/ws/notificacoes/admins/"
        );
    
        socket.onopen = () => {
          console.log("[WS] Connected to admin notifications channel.");
        };
    
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("[WS] New notification received:", data);
            alert(data.type_account+" "+data.username+" "+data.reason)
            const newAnomaly = {
                id: Date.now(),
                username: `@${data.username || "Unknown"}`,
                type_account: data.type_account || "Unknown",
                motive: data.reason || "No reason provided",
              };
    
            setNotifications((prev) => {
                const alreadyExists = prev.some(
                  (a) =>
                    a.username === newAnomaly.username &&
                    a.motive === newAnomaly.motive &&
                    a.type_account === newAnomaly.type_account
                );
        
                return alreadyExists ? prev : [...prev, newAnomaly];
              });
          } catch (err) {
            console.error("[WS] Error processing message:", err);
          }
        };
    
        socket.onclose = () => {
          console.warn("[WS] WebSocket connection closed.");
        };
        return () => {
          socket.close();
        };
      }, []);

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
                    ) : activeSection === 'verify' ? (
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
