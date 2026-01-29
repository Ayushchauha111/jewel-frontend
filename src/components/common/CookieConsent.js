import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCookieBite, FaShieldAlt, FaChartBar, FaBullhorn, FaTimes, FaCheck } from 'react-icons/fa';

// Animations
const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9998;
  overflow: hidden;
  touch-action: none;
`;

const BannerWrapper = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 0 20px 20px;

  @media (max-width: 768px) {
    padding: 0 10px 10px;
  }
`;

const Banner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.98) 0%, rgba(10, 10, 25, 0.98) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 -10px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
  }
`;

const BannerContent = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const TextSection = styled.div`
  flex: 1;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const CookieIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  font-size: 1.5rem;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: #fff;
  font-weight: 700;
  margin: 0;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 600px) {
    font-size: 1.25rem;
  }
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 0 0 1rem;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
`;

const PolicyLink = styled.a`
  color: #a855f7;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: #c084fc;
    text-decoration: underline;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 200px;

  @media (max-width: 900px) {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;

  @media (max-width: 900px) {
    flex: 1;
    min-width: 150px;
  }

  @media (max-width: 500px) {
    width: 100%;
  }
`;

const AcceptAllButton = styled(Button)`
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
  }
`;

const RejectAllButton = styled(Button)`
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.25);
    color: #fff;
  }
`;

const SettingsButton = styled(Button)`
  background: transparent;
  border: 2px solid rgba(168, 85, 247, 0.3);
  color: #a855f7;

  &:hover {
    background: rgba(168, 85, 247, 0.1);
    border-color: #a855f7;
  }
`;

// Settings Modal Wrapper
const SettingsModalWrapper = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

// Settings Modal
const SettingsModal = styled.div`
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.98) 0%, rgba(10, 10, 25, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  max-width: 550px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  margin: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.5);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.7);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #fff;
  font-weight: 700;
  margin: 0;
  font-family: 'Poppins', sans-serif;
`;

const CloseButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const CookieCategory = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;

  &:last-of-type {
    margin-bottom: 1.5rem;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CategoryIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.color || 'rgba(139, 92, 246, 0.2)'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.iconColor || '#a855f7'};
  font-size: 1rem;
`;

const CategoryName = styled.h4`
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  font-family: 'Poppins', sans-serif;
`;

const Toggle = styled.label`
  position: relative;
  width: 50px;
  height: 28px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
  }

  &:checked + span::before {
    transform: translateX(22px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    left: 3px;
    bottom: 3px;
    background: #fff;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const CategoryDescription = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  font-family: 'Poppins', sans-serif;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const SaveButton = styled(Button)`
  flex: 1;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);

  &:hover {
    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
  }
`;

const AcceptAllModalButton = styled(Button)`
  flex: 1;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);

  &:hover {
    box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
  }
`;

const COOKIE_CONSENT_KEY = 'typogram_cookie_consent';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Prevent body scroll when modal/banner is open
  useEffect(() => {
    if (showBanner || showSettings) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [showBanner, showSettings]);

  const saveConsent = (type, prefs) => {
    const consentData = {
      type,
      preferences: prefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    saveConsent('accept_all', {
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    saveConsent('reject_all', {
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent('custom', preferences);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner && !showSettings) return null;

  return (
    <>
      <AnimatePresence>
        {(showBanner || showSettings) && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {}}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBanner && !showSettings && (
          <BannerWrapper
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <Banner>
              <BannerContent>
                <TextSection>
                  <Header>
                    <CookieIcon>
                      <FaCookieBite />
                    </CookieIcon>
                    <Title>We value your privacy 🍪</Title>
                  </Header>
                  <Description>
                    We use cookies, including third-party cookies, to improve your user experience, 
                    monitor analytics and optimize advertising campaigns when you use our services. 
                    You can personalize your Cookie settings at any time by visiting our Cookie Policy page. 
                    By accepting them all, you agree to store cookies on your device. By rejecting them all, 
                    the Cookies that require your consent will not be stored on your device.
                  </Description>
                  <Description style={{ margin: 0 }}>
                    Learn more about our cookies including third-party cookies on our{' '}
                    <PolicyLink href="/cookie-policy" target="_blank">Cookie Policy</PolicyLink>.
                  </Description>
                </TextSection>

                <ButtonSection>
                  <AcceptAllButton
                    onClick={handleAcceptAll}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaCheck /> Accept all cookies
                  </AcceptAllButton>
                  <RejectAllButton
                    onClick={handleRejectAll}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reject all cookies
                  </RejectAllButton>
                  <SettingsButton
                    onClick={() => setShowSettings(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cookie settings
                  </SettingsButton>
                </ButtonSection>
              </BannerContent>
            </Banner>
          </BannerWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <SettingsModalWrapper
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowSettings(false);
              }
            }}
          >
            <SettingsModal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Cookie Settings</ModalTitle>
                <CloseButton onClick={() => setShowSettings(false)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <CookieCategory>
                <CategoryHeader>
                  <CategoryInfo>
                    <CategoryIcon color="rgba(34, 197, 94, 0.2)" iconColor="#22c55e">
                      <FaShieldAlt />
                    </CategoryIcon>
                    <CategoryName>Necessary Cookies</CategoryName>
                  </CategoryInfo>
                  <Toggle disabled>
                    <ToggleInput type="checkbox" checked={true} readOnly />
                    <ToggleSlider />
                  </Toggle>
                </CategoryHeader>
                <CategoryDescription>
                  These cookies are essential for the website to function properly. 
                  They enable basic functions like page navigation and access to secure areas.
                </CategoryDescription>
              </CookieCategory>

              <CookieCategory>
                <CategoryHeader>
                  <CategoryInfo>
                    <CategoryIcon color="rgba(59, 130, 246, 0.2)" iconColor="#3b82f6">
                      <FaChartBar />
                    </CategoryIcon>
                    <CategoryName>Analytics Cookies</CategoryName>
                  </CategoryInfo>
                  <Toggle onClick={() => togglePreference('analytics')}>
                    <ToggleInput type="checkbox" checked={preferences.analytics} readOnly />
                    <ToggleSlider />
                  </Toggle>
                </CategoryHeader>
                <CategoryDescription>
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously. This helps us improve our services.
                </CategoryDescription>
              </CookieCategory>

              <CookieCategory>
                <CategoryHeader>
                  <CategoryInfo>
                    <CategoryIcon color="rgba(251, 191, 36, 0.2)" iconColor="#fbbf24">
                      <FaBullhorn />
                    </CategoryIcon>
                    <CategoryName>Marketing Cookies</CategoryName>
                  </CategoryInfo>
                  <Toggle onClick={() => togglePreference('marketing')}>
                    <ToggleInput type="checkbox" checked={preferences.marketing} readOnly />
                    <ToggleSlider />
                  </Toggle>
                </CategoryHeader>
                <CategoryDescription>
                  These cookies are used to deliver personalized advertisements and track 
                  the effectiveness of our marketing campaigns.
                </CategoryDescription>
              </CookieCategory>

              <ModalButtons>
                <SaveButton
                  onClick={handleSavePreferences}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save preferences
                </SaveButton>
                <AcceptAllModalButton
                  onClick={handleAcceptAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Accept all
                </AcceptAllModalButton>
              </ModalButtons>
            </SettingsModal>
          </SettingsModalWrapper>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieConsent;

