import React, { createContext, useContext, useEffect, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [authStatus, setAuthStatus] = useState({
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        role: localStorage.getItem('role')
    });

    useEffect(() => {
        const checkStorage = () => {
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            const role = localStorage.getItem('role');

            setAuthStatus((prev) => {
                if (prev.isAuthenticated !== isAuthenticated || prev.role !== role) {
                    return { isAuthenticated, role };
                }
                return prev;
            });
        };

        window.addEventListener('storage', checkStorage);
        const interval = setInterval(checkStorage, 1000);

        return () => {
            window.removeEventListener('storage', checkStorage);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (authStatus.role !== 'admin' || !authStatus.isAuthenticated) {
            return;
        }

        const socket = new WebSocket(`ws://${window.location.host}/ws/notificacoes/admins/`);

        socket.onopen = () => {
            console.log("[WS] Connected to admin notifications channel.");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const newAnomaly = {
                    id: data.id,
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

        return () => socket.close();
    }, [authStatus]);

    return (
        <NotificationContext.Provider value={notifications}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
