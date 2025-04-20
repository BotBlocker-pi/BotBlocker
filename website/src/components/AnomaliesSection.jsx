import React, { useState, useEffect } from 'react';
import '../css/AnomaliesSection.css';

const AnomaliesSection = ({ setActiveSection, externalNotifications = [] }) => {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedAnomaly, setSelectedAnomaly] = useState(null);
    const [anomalyStatuses, setAnomalyStatuses] = useState({});

    useEffect(() => {
        // Fetch anomalies data or use mock data
        const fetchAnomalies = async () => {
            try {
                setLoading(true);
                // Mock data for development
                const mockData = [
                    { id: 1, username: '@JonSnow', type_account: 'Basic', motive: 'Inconsistent Voting Patterns' },
                    { id: 2, username: '@AryaStark', type_account: 'Premium', motive: 'Multiple Account Detection' },
                    { id: 3, username: '@TyrionLannister', type_account: 'Basic', motive: 'Suspicious Login Activity' },
                    { id: 4, username: '@DaenerysTargaryen', type_account: 'Pro', motive: 'Unusual Transaction Patterns' }
                ];

                // Initialize all anomalies with "To Solve" status
                const initialStatuses = {};
                mockData.forEach(anomaly => {
                    initialStatuses[anomaly.id] = 'To Solve';
                });

                setAnomalies(mockData);
                setAnomalyStatuses(initialStatuses);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAnomalies();
    }, []);

    useEffect(() => {
        externalNotifications.forEach((newAnomaly) => {
          setAnomalies((prev) => {
            const alreadyExists = prev.some(
              (a) =>
                a.username === newAnomaly.username &&
                a.motive === newAnomaly.motive &&
                a.type_account === newAnomaly.type_account
            );
            return alreadyExists ? prev : [...prev, newAnomaly];
          });
        });
      }, [externalNotifications]);
      
    const handleDetailsClick = (anomaly) => {
        setSelectedAnomaly(anomaly);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const handleStatusChange = (id, status) => {
        setAnomalyStatuses(prev => ({
            ...prev,
            [id]: status
        }));
    };

    const handleDeleteAnomaly = (id) => {
        setAnomalies(anomalies.filter(anomaly => anomaly.id !== id));
        setShowPopup(false);
    };

    return (
        <div className="admin-anomalies-section">
            <h2 className="admin-section-title">Anomalies</h2>

            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}

            <div className="admin-anomalies-container">
                <table className="admin-anomalies-table">
                    <thead>
                    <tr>
                        <th className="admin-header-profile">Profile</th>
                        <th className="admin-header-motive">Motive</th>
                        <th className="admin-header-status">Status</th>
                        <th className="admin-header-actions">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {anomalies.map(anomaly => (
                        <tr key={anomaly.id}>
                            <td data-label="Profile">
                                <div className="admin-profile-type">{anomaly.type_account}</div>
                                <div className="admin-profile-username">{anomaly.username}</div>
                            </td>
                            <td data-label="Motive">
                                <div className="admin-motive-content" style={{color: 'black'}}>
                                    {anomaly.motive}
                                </div>
                            </td>
                            <td data-label="Status">
                                <select
                                    className="admin-status-select"
                                    value={anomalyStatuses[anomaly.id] || 'To Solve'}
                                    onChange={(e) => handleStatusChange(anomaly.id, e.target.value)}
                                >
                                    <option value="To Solve">To Solve</option>
                                    <option value="In Progress">In Progress</option>
                                </select>
                            </td>
                            <td data-label="Actions">
                                <button
                                    className="admin-details-button"
                                    onClick={() => handleDetailsClick(anomaly)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{width: '20px', height: '20px'}}
                                    >
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showPopup && selectedAnomaly && (
                <div className="admin-anomaly-popup-overlay" onClick={closePopup}>
                    <div
                        className="admin-anomaly-popup"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-popup-header">
                            <h3>Anomaly Details</h3>
                            <button className="admin-close-button" onClick={closePopup}>×</button>
                        </div>
                        <div className="admin-popup-content">
                            <div><strong>Username:</strong> {selectedAnomaly.username}</div>
                            <div><strong>Account Type:</strong> {selectedAnomaly.type_account}</div>
                            <div><strong>Motive:</strong> {selectedAnomaly.motive}</div>
                        </div>
                        <div className="admin-popup-actions">
                            <div className="admin-status-row">
                                <label>Status:</label>
                                <select
                                    className="admin-status-select"
                                    value={anomalyStatuses[selectedAnomaly.id] || 'To Solve'}
                                    onChange={(e) => handleStatusChange(selectedAnomaly.id, e.target.value)}
                                >
                                    <option value="To Solve">To Solve</option>
                                    <option value="In Progress">In Progress</option>
                                </select>
                            </div>
                            <button
                                className="admin-delete-button"
                                onClick={() => handleDeleteAnomaly(selectedAnomaly.id)}
                            >
                                Delete Anomaly
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnomaliesSection;