import React from 'react';
import styled from 'styled-components';
import Logo from '../../../assets/logo.png';
import { FaCog, FaUserPlus } from 'react-icons/fa';

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

const IconContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const GearIcon = styled(FaCog)`
    font-size: 24px;
    color: white;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
`;

const SignUpIcon = styled(FaUserPlus)`
    font-size: 22px;
    color: white;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    
    &:hover {
        opacity: 0.8;
    }
`;

const Navbar = ({ onSignUpClick, showBackButton = false, onBack }) => {
    const handleSettingsClick = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    };

    return (
        <Nav>
            <div>
                {showBackButton ? (
                    <BackButton onClick={onBack}>
                        ← Back
                    </BackButton>
                ) : (
                    <LogoImage src={Logo} alt="Logo" />
                )}
            </div>

            <IconContainer>
                {!showBackButton && onSignUpClick && (
                    <SignUpIcon onClick={onSignUpClick} title="Sign Up" />
                )}
                <GearIcon onClick={handleSettingsClick} title="Settings" />
            </IconContainer>
        </Nav>
    );
};

export default Navbar;