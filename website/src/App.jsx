import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HomePage from "./pages/HomePage.jsx";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UnderstandingBots from "./pages/UnderstandingBots.jsx";
import Contact from "./pages/Contact.jsx"
import VerifierDashboard from "./pages/VerifierDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/understand-bots" element={<UnderstandingBots />} />
                <Route path='/contact' element={<Contact />}/>
                <Route path='/verification-dashboard' element={<VerifierDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;