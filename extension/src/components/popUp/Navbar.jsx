import React from 'react';
import styled from 'styled-components';
import Logo from '../../assets/logo.png';
import { FaCog } from 'react-icons/fa';

const Nav = styled.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background: linear-gradient(to right, #EAEDFA, #566C98); 
    width: 100%; 
    box-sizing: border-box; 
    margin: 0;
`;

const LogoImage = styled.img`
    height: 40px;
`;

const GearIcon = styled(FaCog)`
    font-size: 24px; 
    color: white;
    cursor: pointer;

    &:hover {
        opacity: 0.8; 
    }
`;

const Navbar = () => {
    return (
        <Nav>
            <div>
                <LogoImage src={Logo} alt="Logo" />
            </div>

            <div>
                <GearIcon />
            </div>
        </Nav>
    );
};

export default Navbar;