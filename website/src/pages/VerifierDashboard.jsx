import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import '../css/VerifierDashboard.css'; // Import your CSS file for styling
import botBlockerLogo from '../assets/logo.png'; // Import your logo image

const VerificationDashboard = () => {
    // State para controlar qual seção está ativa no sidebar
    const [activeSection, setActiveSection] = useState('verify');
    
    // Se não for um verificador, redireciona para a página inicial
    const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if not set
    if (userRole !== 'verifier') {
        return <Navigate to="/" />;
    }

    return (
        <div className="verification-dashboard">
            {/* Navbar existente */}
            <header className="header">
                <div className="logo-container">
                    <div className="logo-wrapper">
                        <img src={botBlockerLogo} alt="BotBlocker Logo" className="logo" />
                    </div>
                </div>
                <nav className="navigation">
                    <a href="/" className="nav-link">HOME</a>
                    <a href="/understand-bots" className="nav-link">UNDERSTAND BOTS</a>
                    <a href="/contact" className="nav-link">CONTACT</a>

                    {userRole === 'verifier' && (
                        <Link to="/verification-dashboard" className="nav-link active">VERIFICATION DASHBOARD</Link>
                    )}
                </nav>
            </header>

            {/* Container principal do dashboard */}
            <div className="dashboard-container">
                {/* Sidebar do BotBlocker */}
                <div className="sidebar">
                    <div className="sidebar-menu">
                        <div 
                            className={`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveSection('dashboard')}
                        >
                            <span className="menu-icon">📊</span>
                            <span className="menu-text">Dashboard</span>
                        </div>
                        <div 
                            className={`menu-item ${activeSection === 'accounts' ? 'active' : ''}`}
                            onClick={() => setActiveSection('accounts')}
                        >
                            <span className="menu-icon">👤</span>
                            <span className="menu-text">Accounts</span>
                        </div>
                        <div 
                            className={`menu-item ${activeSection === 'evaluations' ? 'active' : ''}`}
                            onClick={() => setActiveSection('evaluations')}
                        >
                            <span className="menu-icon">📋</span>
                            <span className="menu-text">Evaluations</span>
                        </div>
                        <div 
                            className={`menu-item ${activeSection === 'anomalies' ? 'active' : ''}`}
                            onClick={() => setActiveSection('anomalies')}
                        >
                            <span className="menu-icon">🔍</span>
                            <span className="menu-text">Anomalies</span>
                        </div>
                        <div 
                            className={`menu-item ${activeSection === 'verify' ? 'active' : ''}`}
                            onClick={() => setActiveSection('verify')}
                        >
                            <span className="menu-icon">✅</span>
                            <span className="menu-text">Verify</span>
                        </div>
                    </div>
                </div>

                {/* Conteúdo principal - Muda com base na seção ativa */}
                <div className="main-content">
                    {activeSection === 'verify' && (
                        <div className="verification-container">
                            <div className="search-box">
                                <input 
                                    type="text" 
                                    placeholder="Enter social media URL. Example: https://x.com/BotBlocker"
                                />
                                <button className="search-button">🔍</button>
                            </div>
                            
                            <div className="instruction-text">Search the social media URL of the profile you want to verify.</div>
                            
                            <div className="search-divider">OR</div>
                            
                            <div className="dropdown-search">
                                <div className="dropdown">
                                    <select defaultValue="">
                                        <option value="" disabled>Select Social Media</option>
                                        <option value="twitter">Twitter</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="linkedin">LinkedIn</option>
                                    </select>
                                </div>
                                
                                <div className="search-box" style={{ marginBottom: 0 }}>
                                    <input type="text" placeholder="Username. Example: @BotBlocker" />
                                    <button className="search-button">🔍</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'dashboard' && (
                        <div className="dashboard-content">
                            <h2>Dashboard Overview</h2>
                            <div className="dashboard-stats">
                                <div className="stat-card">
                                    <h3>Total Verifications</h3>
                                    <p className="stat-number">142</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Pending</h3>
                                    <p className="stat-number">23</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Bots Identified</h3>
                                    <p className="stat-number">78</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Human Accounts</h3>
                                    <p className="stat-number">64</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'accounts' && (
                        <div className="accounts-content">
                            <h2>Account Management</h2>
                            <p>View and manage verified accounts here.</p>
                            {/* Account list would go here */}
                        </div>
                    )}

                    {activeSection === 'evaluations' && (
                        <div className="evaluations-content">
                            <h2>Evaluation Reports</h2>
                            <p>Access detailed evaluation reports and metrics.</p>
                            {/* Evaluation reports would go here */}
                        </div>
                    )}

                    {activeSection === 'anomalies' && (
                        <div className="anomalies-content">
                            <h2>Detected Anomalies</h2>
                            <p>Review unusual patterns and suspicious activities.</p>
                            {/* Anomaly list would go here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationDashboard;