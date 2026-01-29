import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Helmet } from 'react-helmet-async';

// Keyframe Animations
const typing = keyframes`
  0% { width: 0; }
  50% { width: 100%; }
  100% { width: 0; }
`;

const blink = keyframes`
  50% { border-color: transparent; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components
const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  min-height: 100vh;
  padding: 20px;
  color: #333;
  line-height: 1.6;
`;

const Header = styled.header`
  text-align: center;
  padding: 40px 0;
`;

const Title = styled.h1`
  font-size: 2.5em;
  color: #2c3e50;
  overflow: hidden;
  white-space: nowrap;
  border-right: 3px solid #3498db;
  animation: ${typing} 3s steps(30, end) infinite, ${blink} 0.75s step-end infinite;

  @media (max-width: 600px) {
    font-size: 1.8em;
  }
`;

const SocialContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
  animation: ${fadeIn} 1s ease-in;
`;

const SocialCard = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 600px) {
    padding: 15px;
  }
`;

const SocialIcon = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
`;

const SocialTitle = styled.h2`
  font-size: 1.2em;
  color: #2c3e50;
  margin-bottom: 10px;
`;

const SocialLink = styled.a`
  text-decoration: none;
  color: #3498db;
  font-weight: bold;
  transition: color 0.3s ease;

  &:hover {
    color: #2980b9;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-size: 0.9em;
`;

// Social Media Data
const socialMedia = [
  {
    name: 'YouTube',
    link: 'https://youtube.com/@typogram_in',
    icon: 'https://objectstorage.ap-mumbai-1.oraclecloud.com/n/bmckhb1inaxt/b/typogram-images/o/youtube.png',
    handle: '@typogram_in',
  },
  {
    name: 'Instagram',
    link: 'https://instagram.com/typogram_in',
    icon: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
    handle: '@typogram_in',
  },
  {
    name: 'LinkedIn',
    link: 'https://linkedin.com/company/typogramm',
    icon: 'https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
    handle: 'Typogram',
  },
  {
    name: 'Twitter',
    link: 'https://twitter.com/typogram_in',
    icon: 'https://abs.twimg.com/favicons/twitter.3.ico',
    handle: '@typogram_in',
  },
  {
    name: 'Telegram',
    link: 'https://t.me/typogram_in',
    icon: 'https://telegram.org/img/t_logo.png',
    handle: '@typogram_in',
  },
];

// React Component
const SocialPage = () => {
  useEffect(() => {
    document.title = 'Typogram | Social Media';
  }, []);

  return (
    <PageWrapper>
      <Helmet>
        <title>Connect with Typogram | Social Media</title>
        <meta name="description" content="Follow Typogram on YouTube, Instagram, LinkedIn, Twitter, and Telegram for typing tips, updates, and community." />
        <link rel="canonical" href="https://typogram.in/friends" />
        <meta property="og:title" content="Connect with Typogram | Social Media" />
        <meta property="og:description" content="Follow Typogram on social media for typing tips and updates." />
        <meta property="og:url" content="https://typogram.in/friends" />
      </Helmet>
      <Header>
        <Title>Connect with Typogram</Title>
      </Header>
      <SocialContainer>
        {socialMedia.map((platform) => (
          <SocialCard key={platform.name}>
            <SocialIcon src={platform.icon} alt={`${platform.name} Icon`} />
            <SocialTitle>{platform.name}</SocialTitle>
            <SocialLink href={platform.link} target="_blank" rel="noopener noreferrer">
              {platform.handle}
            </SocialLink>
          </SocialCard>
        ))}
      </SocialContainer>
      <Footer>© 2025 Typogram. All rights reserved.</Footer>
    </PageWrapper>
  );
};

export default SocialPage;