import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import '../css/VerifierDashboard.css';
import botBlockerLogo from '../assets/logo.png';
import { getEvaluationHistory, getProfileData , assignBadgeToProfile } from '../api/data.jsx';
import { checkAuth, logoutUser } from '../api/loginApi';

const VerificationDashboard = () => {
    // State para controlar qual seção está ativa no sidebar
    const [activeSection, setActiveSection] = useState('verify');
    
    // States para a funcionalidade de busca de perfil
    const [searchUrl, setSearchUrl] = useState('');
    const [usernameSearch, setUsernameSearch] = useState('');
    const [selectedSocialMedia, setSelectedSocialMedia] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [username, setUsername] = useState('');
    const [socialMedia, setSocialMedia] = useState('');
    const [evaluations, setEvaluations] = useState([]);
    const [data, setData] = useState(null);
    const [userNotFound, setUserNotFound] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState(null);
    
    // Se não for um verificador, redireciona para a página inicial
    const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if not set
    if (userRole !== 'verifier') {
        return <Navigate to="/" />;
    }

    // Verificar autenticação quando o componente montar (como na HomePage)
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const authStatus = await checkAuth();
                setIsAuthenticated(authStatus);
                localStorage.setItem('isAuthenticated', JSON.stringify(authStatus));
                
                // Se não estiver autenticado, remover o role do localStorage
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
            
            // Verificar a autenticação ao carregar a página
            if (!JSON.parse(storedAuth)) {
                localStorage.removeItem('role');
            }
        }

        checkAuthStatus();
        setIsLoaded(true);
    }, []);

    // Handler para o campo de busca por URL
    const handleSearchChange = (e) => {
        setSearchUrl(e.target.value);
    };

    // Handler para o campo de busca por username
    const handleUsernameChange = (e) => {
        setUsernameSearch(e.target.value);
    };
    
    // Handler para a seleção de rede social
    const handleSocialMediaChange = (e) => {
        setSelectedSocialMedia(e.target.value);
    };

    // Busca de perfil por URL (usando a lógica da HomePage)
    const handleUrlSearchSubmit = async (e) => {
        e.preventDefault();
        console.log('Searching for:', searchUrl);
        setUserNotFound(false);
        setVerificationMessage(null);
        setIsLoading(true);

        try {
            const profileData = await getProfileData(searchUrl);

            if (!profileData) {
                setUserNotFound(true);
                setIsLoading(false);
                return;
            }

            // Armazena o ID para ser usado na funcao handleBadgeAssignment
            const user_id = profileData.user_id || profileData.id; // Use the correct ID based on your API response
         

            setData(profileData);
            const extractedUsername = profileData.perfil_name;
            const platform = profileData.plataform;


            setUsername(extractedUsername || 'unknown_user');
            setSocialMedia(platform);
            
            try {
                setEvaluations(await getEvaluationHistory(searchUrl));
            } catch (evalError) {
                console.error("Error fetching evaluation history:", evalError);
                setEvaluations([]);
            }
            
            setShowProfile(true);
            setActiveSection('profile-details');
        } catch (error) {
            setUserNotFound(true);
            const extractedUsername = searchUrl.replace(/^@/, '');
            setUsername(extractedUsername);
        } finally {
            setIsLoading(false);
        }
    };

    // Busca de perfil por username e rede social
    const handleUsernameSearchSubmit = async (e) => {
        e.preventDefault();
        setVerificationMessage(null);
        if (!selectedSocialMedia || !usernameSearch) {
            alert("Por favor, selecione uma rede social e insira um nome de usuário.");
            return;
        }
        
        console.log('Searching for username:', usernameSearch, 'on', selectedSocialMedia);
        setUserNotFound(false);
        
        // Construir a URL completa baseada na rede social selecionada
        let fullUrl = '';
        switch (selectedSocialMedia) {
            case 'twitter':
                fullUrl = `https://x.com/${usernameSearch.replace('@', '')}`;
                break;
            case 'instagram':
                fullUrl = `https://instagram.com/${usernameSearch.replace('@', '')}`;
                break;
            case 'facebook':
                fullUrl = `https://facebook.com/${usernameSearch.replace('@', '')}`;
                break;
            case 'linkedin':
                fullUrl = `https://linkedin.com/in/${usernameSearch.replace('@', '')}`;
                break;
            default:
                fullUrl = usernameSearch;
        }
        
        // Usar a mesma lógica de busca da URL
        setIsLoading(true);
        try {
            const profileData = await getProfileData(fullUrl);

            if (!profileData) {
                setUserNotFound(true);
                setIsLoading(false);
                return;
            }

            setData(profileData);
            const extractedUsername = profileData.perfil_name;
            const platform = profileData.plataform;

            setUsername(extractedUsername || 'unknown_user');
            setSocialMedia(platform);
            
            try {
                setEvaluations(await getEvaluationHistory(fullUrl));
            } catch (evalError) {
                console.error("Error fetching evaluation history:", evalError);
                setEvaluations([]);
            }
            
            setShowProfile(true);
            setActiveSection('profile-details');
        } catch (error) {
            setUserNotFound(true);
            const extractedUsername = fullUrl.replace(/^@/, '');
            setUsername(extractedUsername);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseProfile = () => {
        setShowProfile(false);
        setActiveSection('verify');
        setVerificationMessage(null);
    };

    const handleLogout = () => {
        logoutUser();
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role'); // Remover o role ao fazer logout
    };

    // Função para atribuir badge ao perfil
    const handleBadgeAssignment = async (badge) => {
        console.log("Data", data);
        if (!data?.perfil_id) {  // Change data.id to data.user_id
            setVerificationMessage({
                type: 'error',
                text: 'Não foi possível atribuir o badge: ID do perfil não disponível'
            });
            return;
        }
    
        setIsLoading(true);
        try {
            const result = await assignBadgeToProfile(data.perfil_id, badge);  // Use data.user_id
    
            if (result.success) {
                setVerificationMessage({
                    type: 'success',
                    text: result.message
                });
                
                // Atualizar os dados do perfil para refletir a nova badge
                const updatedData = {...data, badge: badge};
                setData(updatedData);
            } else {
                setVerificationMessage({
                    type: 'error',
                    text: result.error
                });
            }
        } catch (error) {
            console.error("Error assigning badge:", error);
            setVerificationMessage({
                type: 'error',
                text: 'Erro ao processar verificação'
            });
        } finally {
            setIsLoading(false);
        }
    };
    // Funções para verificar perfil como humano ou bot
    const handleVerifyAsHuman = () => {
        handleBadgeAssignment('human');
    };

    const handleVerifyAsBot = () => {
        handleBadgeAssignment('bot');
    };

    // Função para formatar avaliações
    const formatEvaluations = (evaluationsData) => {
        if (!evaluationsData || !Array.isArray(evaluationsData)) return [];
        
        return evaluationsData.map(item => {
            // Extrair data e hora da propriedade date ou timestamp
            const evalDate = new Date(item.date || item.timestamp || Date.now());
            const formattedDate = evalDate.toLocaleDateString();
            const formattedTime = item.time || 
                `${evalDate.getHours().toString().padStart(2, '0')}:${evalDate.getMinutes().toString().padStart(2, '0')}`;
            
            return {
                evaluator_name: item.evaluator_name || 'Anonymous',
                is_bot: item.is_bot || false,
                date: formattedDate,
                time: formattedTime,
                reasons: item.reasons || [item.reason || 'No reason provided']
            };
        });
    };

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

                    {isAuthenticated ? (
                        <div className="auth-controls">
                            <span className="user-status">✓ Logged In</span>
                            <button onClick={handleLogout} className="logout-button">Logout</button>
                        </div>
                    ) : (
                        <button onClick={() => window.location.href = "/"} className="login-button">Login</button>
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
                            className={`menu-item ${activeSection === 'verify' || activeSection === 'profile-details' ? 'active' : ''}`}
                            onClick={() => setActiveSection('verify')}
                        >
                            <span className="menu-icon">✅</span>
                            <span className="menu-text">Verify</span>
                        </div>
                    </div>
                </div>

                {/* Conteúdo principal - Muda com base na seção ativa */}
                <div className="main-content">
                    {isLoading && (
                        <div className="loading-indicator">
                            <div className="spinner"></div>
                            <p>Carregando...</p>
                        </div>
                    )}

                    {userNotFound && (
                        <div className="error-message">
                            ⚠️ User not found or error loading profile.
                        </div>
                    )}

                    {verificationMessage && (
                        <div className={`verification-message ${verificationMessage.type}`}>
                            {verificationMessage.type === 'success' ? '✅' : '❌'} {verificationMessage.text}
                        </div>
                    )}

                    {activeSection === 'verify' && !showProfile && (
                        <div className="verification-container">
                            <form onSubmit={handleUrlSearchSubmit} className="form-section">
                                <div className="search-box">
                                    <input 
                                        type="text" 
                                        placeholder="Enter social media URL. Example: https://x.com/BotBlocker"
                                        value={searchUrl}
                                        onChange={handleSearchChange}
                                    />
                                    <button type="submit" className="search-button">🔍</button>
                                </div>
                            </form>
                            
                            <div className="instruction-text">Search the social media URL of the profile you want to verify.</div>
                            
                            <div className="search-divider">OR</div>
                            
                            <form onSubmit={handleUsernameSearchSubmit} className="form-section">
                                <div className="dropdown-search">
                                    <div className="dropdown">
                                        <select 
                                            value={selectedSocialMedia} 
                                            onChange={handleSocialMediaChange}
                                        >
                                            <option value="" disabled>Select Social Media</option>
                                            <option value="twitter">Twitter</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="linkedin">LinkedIn</option>
                                        </select>
                                    </div>
                                    
                                    <div className="search-box" style={{ marginBottom: 0 }}>
                                        <input 
                                            type="text" 
                                            placeholder="Username. Example: @BotBlocker"
                                            value={usernameSearch}
                                            onChange={handleUsernameChange}
                                        />
                                        <button type="submit" className="search-button">🔍</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {(activeSection === 'profile-details' || showProfile) && data && (
                        <div className="profile-details-container">
                            <div className="profile-container">
                                <button className="close-button" onClick={handleCloseProfile}>×</button>
                                
                                <h1 className="profile-title">Profile Found</h1>
                                <p className="profile-subtitle">Check its analysis</p>
                                
                                <h2 className="analysis-title">AI analysis</h2>
                                
                                <div className="profile-username">
                                    <span className="social-icon">x</span>
                                    <span className="username">@{username}</span>
                                </div>
                                
                                <div className="ai-probability-container">
                                    <div className="ai-probability-box">
                                        <div className="probability-value">{data.probability.toFixed(2)}%</div>
                                        <div className="probability-text">chance of being AI</div>
                                        <div className="votes-count">({data.numberOfEvaluations || 0} votes)</div>
                                    </div>
                                    
                                    <div className="status-indicator">
                                        <div className="status-icon">?</div>
                                        <div className="status-text">
                                            {data.badge === 'human' ? (
                                                <span className="badge human">Verified Human</span>
                                            ) : data.badge === 'bot' ? (
                                                <span className="badge bot">Verified Bot</span>
                                            ) : (
                                                "The status of this account is unknown."
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {evaluations && evaluations.length > 0 && (
                                    <div className="evaluations-section">
                                        <h3 className="evaluations-title">Latest evaluations</h3>
                                        
                                        <div className="evaluations-grid">
                                            {formatEvaluations(evaluations).map((evaluation, index) => (
                                                <div key={index} className="evaluation-card">
                                                    <div className="evaluator-name">{evaluation.evaluator_name}</div>
                                                    <div className={`evaluation-result ${evaluation.is_bot ? 'bot' : 'human'}`}>
                                                        Considered this profile a {evaluation.is_bot ? 'bot' : 'human'}.
                                                    </div>
                                                    <div className="evaluation-date">
                                                        On {evaluation.date} - {evaluation.time}
                                                    </div>
                                                    
                                                    <div className="evaluation-reason">
                                                        <div>Reason(s):</div>
                                                        <ul>
                                                            {evaluation.reasons.map((reason, i) => (
                                                                <li key={i}>{reason}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="verifier-actions">
                                    <button 
                                        className="verify-human-btn" 
                                        onClick={handleVerifyAsHuman}
                                        disabled={isLoading || data.badge === 'human'}
                                    >
                                        {data.badge === 'human' ? 'Already Verified as Human' : 'Verify as Human'}
                                    </button>
                                    <button 
                                        className="verify-bot-btn" 
                                        onClick={handleVerifyAsBot}
                                        disabled={isLoading || data.badge === 'bot'}
                                    >
                                        {data.badge === 'bot' ? 'Already Verified as Bot' : 'Verify as Bot'}
                                    </button>
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