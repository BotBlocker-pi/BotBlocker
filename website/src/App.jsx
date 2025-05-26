import './App.css'
import HomePage from "./pages/HomePage.jsx";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UnderstandingBots from "./pages/UnderstandingBots.jsx";
import Contact from "./pages/Contact.jsx"
import VerifierDashboard from "./pages/VerifierDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { NotificationProvider } from './api/NotificationContext.jsx';

function App() {

    return (
        <BrowserRouter>
            <NotificationProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/understand-bots" element={<UnderstandingBots />} />
                    <Route path='/contact' element={<Contact />}/>
                    <Route path='/verification-dashboard' element={<VerifierDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard/>} />
                </Routes>
            </NotificationProvider>
        </BrowserRouter>
    );
}

export default App;