import React from 'react';
import { Navigate } from 'react-router-dom';
import '../css/VerifierDashboard.css'; // Import your CSS file for styling
import botBlockerLogo from '../assets/logo.png'; // Import your logo image
import { Link } from 'react-router-dom';

const VerificationDashboard = (  ) => {
    
    // Se não for um verificador, redireciona para a página inicial
    const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if not set
    if (userRole !== 'verifier') {
        return <Navigate to="/" />;
    }
     

    return (
        <div className="verification-dashboard">
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
            <h1>Painel de Verificação</h1>
            <p>Bem-vindo ao painel de verificação!</p>
            
            <div className="verification-actions">
                <h2>Ações de Verificação</h2>
                <ul>
                    <li>
                        <button>Iniciar Nova Verificação</button>
                    </li>
                    <li>
                        <button>Ver Verificações Pendentes</button>
                    </li>
                    <li>
                        <button>Histórico de Verificações</button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default VerificationDashboard;