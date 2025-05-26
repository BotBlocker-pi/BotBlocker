import React from 'react';
import '../../css/components/global/Navbar.css';
import Logo from '../../../assets/logo.png';

const Navbar = () => {
    return (
        <nav className="nav">
            <div>
                <img src={Logo} alt="Logo" className="logo-image" />
            </div>
        </nav>
    );
};

export default Navbar;
