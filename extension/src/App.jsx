import React from 'react';
import Navbar from './components/popUp/Navbar.jsx'; // Importa a Navbar
import HomePage from './pages/HomePage'; // Importa a HomePage
import Login from './pages/Login'; // Importa a HomePage

const App = () => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <HomePage />
            <Login />
        </div>
    );
};

export default App;