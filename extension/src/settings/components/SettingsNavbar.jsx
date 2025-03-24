import React from 'react';
import styled from 'styled-components';
import Logo from '../../assets/logo.png';

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

const LoginButton = styled.button`
    background-color: #4a5b84;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #3a4a70;
    }

    &:active {
        background-color: #2d3a5a;
    }
`;

const SettingsNavbar = () => {
    return (
        <Nav>
            <div>
                <LogoImage src={Logo} alt="Logo" />
            </div>
        </Nav>
    );
};

export default SettingsNavbar;