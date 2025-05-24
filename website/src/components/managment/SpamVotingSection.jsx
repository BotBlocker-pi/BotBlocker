import React, { useState, useEffect } from 'react';
import '../css/SpamVotingSection.css';
import { getSuspiciousActivities, markActivityResolved } from '../api/data';

const SpamVotingSection = ({ setActiveSection, externalNotifications = [] }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activityStatuses, setActivityStatuses] = useState({});
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const data = await getSuspiciousActivities();
            const savedStatuses = JSON.parse(localStorage.getItem("spamVotingStatuses") || "{}");
            const statuses = {};
            data.forEach(item => {
                statuses[item.id] = savedStatuses[item.id] || item.status;
            });

            setActivities(data);
            setActivityStatuses(statuses);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [externalNotifications]);

    const handleStatusChange = (id, status) => {
        const updated = {
            ...activityStatuses,
            [id]: status
        };
        setActivityStatuses(updated);
        localStorage.setItem("spamVotingStatuses", JSON.stringify(updated));
    };

    const handleDeleteActivity = async (id) => {
        const response = await markActivityResolved(id);
        if (response) {
            const updated = { ...activityStatuses };
            delete updated[id];
            setActivityStatuses(updated);
            localStorage.setItem("spamVotingStatuses", JSON.stringify(updated));
            setActivities(activities.filter(item => item.id !== id));
        } else {
            alert("Failed to mark activity as resolved.");
        }
    };

    const getDisplayStatus = (rawStatus) => {
        if (rawStatus === 'In Progress') return 'Solving';
        return rawStatus;
    };

    const resetFilters = () => {
        setSelectedPlatform('All');
        setSelectedStatus('All');
    };

    const filteredActivities = activities.filter(activity => {
        const rawPlatform = activity.type_account === 'User' ? 'BB_User' : activity.type_account;
        const rawStatus = activityStatuses[activity.id] || 'To Solve';
        const status = getDisplayStatus(rawStatus);

        const platformMatch = selectedPlatform === 'All' || rawPlatform.toLowerCase() === selectedPlatform.toLowerCase();
        const statusMatch = selectedStatus === 'All' || status.toLowerCase() === selectedStatus.toLowerCase();

        return platformMatch && statusMatch;
    });

    return (
        <div className="spamvoting-section">
            <h2 className="spamvoting-title">Spam Voting</h2>

            <div className="spamvoting-filters">
                <div className="filter-group">
                    <label>Social Media:</label>
                    <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                        <option value="All">All</option>
                        <option value="x">x</option>
                        <option value="instagram">instagram</option>
                        <option value="BB_User">BB_User</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="All">All</option>
                        <option value="To Solve">To Solve</option>
                        <option value="Solving">Solving</option>
                    </select>
                </div>
                <div className="filter-reset">
                    <button onClick={resetFilters}>Reset Filters</button>
                </div>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}

            <div className="spamvoting-container">
                <table className="spamvoting-table">
                    <thead>
                    <tr>
                        <th>Social Media</th>
                        <th>Username</th>
                        <th>Motive</th>
                        <th>Status</th>
                        <th>Delete</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredActivities.map(activity => {
                        const rawPlatform = activity.type_account === 'User' ? 'BB_User' : activity.type_account;
                        const rawStatus = activityStatuses[activity.id] || 'To Solve';
                        const status = getDisplayStatus(rawStatus);

                        return (
                            <tr key={activity.id}>
                                <td>{rawPlatform}</td>
                                <td>{activity.username}</td>
                                <td className="spamvoting-motive">{activity.motive}</td>
                                <td>
                                    <div className="dropdown-wrapper">
                                        <select
                                            className="spamvoting-status-select"
                                            value={status}
                                            onChange={(e) => handleStatusChange(activity.id, e.target.value)}
                                        >
                                            <option value="To Solve">To Solve</option>
                                            <option value="Solving">Solving</option>
                                        </select>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className="spamvoting-delete-button"
                                        onClick={() => handleDeleteActivity(activity.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SpamVotingSection;
