import React from "react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const LogoContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  opacity: ${props => props.$isFocusedMode ? 0 : 1};
  transition: opacity 0.4s ease;
  display: flex;
  align-items: center;
  gap: 24px;
  animation: ${fadeIn} 0.5s ease-out;
  
  &:hover {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    top: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    top: 10px;
  }
`;

const LogoSection = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const BrandWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const LogoText = styled.span`
  font-size: 42px;
  font-weight: 800;
  color: ${props => props.theme?.stats || '#e2b714'};
  letter-spacing: -1px;
  line-height: 1;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  @media (max-width: 768px) {
    font-size: 32px;
  }
  
  @media (max-width: 480px) {
    font-size: 26px;
  }
`;

const Tagline = styled.span`
  font-size: 10px;
  font-weight: 600;
  background: linear-gradient(
    90deg, 
    ${props => props.theme?.textTypeBox || '#646669'} 0%,
    ${props => props.theme?.stats || '#e2b714'} 50%,
    ${props => props.theme?.textTypeBox || '#646669'} 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-top: 4px;
  animation: ${shimmer} 3s linear infinite;
  
  @media (max-width: 768px) {
    font-size: 8px;
    letter-spacing: 2px;
  }
  
  @media (max-width: 480px) {
    font-size: 7px;
    letter-spacing: 1.5px;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 40px;
  background: linear-gradient(
    to bottom,
    transparent,
    ${props => props.theme?.textTypeBox || '#646669'}50,
    transparent
  );
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 6px;
  
  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const NavButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: transparent;
  border-radius: 8px;
  color: ${props => props.theme?.textTypeBox || '#646669'};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: ${props => props.theme?.stats || '#e2b714'};
    transition: width 0.2s ease;
    border-radius: 1px;
  }
  
  &:hover {
    color: ${props => props.theme?.text || '#d1d0c5'};
    
    &::before {
      width: 50%;
    }
  }
  
  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 12px;
    background: rgba(50, 50, 50, 0.5);
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 11px;
  }
`;

const Logo = ({ isFocusedMode }) => {
  return (
    <LogoContainer $isFocusedMode={isFocusedMode}>
      <LogoSection href="/">
        <BrandWrapper>
          <LogoText>Typogram</LogoText>
          <Tagline>Prepare Smarter • Score Higher</Tagline>
        </BrandWrapper>
      </LogoSection>
      
      <Divider />
      
      <NavLinks>
        <NavButton href="/">home</NavButton>
        <NavButton href="/courses">courses</NavButton>
      </NavLinks>
    </LogoContainer>
  );
};

export default Logo;
