import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaHome, FaSearch, FaArrowLeft, FaKeyboard } from 'react-icons/fa';

const Container = styled.div`
  min-height: 100vh;
  background: radial-gradient(ellipse 150% 100% at 50% 0%, #1a1a3e 0%, #0d0d1a 50%, #050507 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 40%);
    pointer-events: none;
  }
`;

const Content = styled(motion.div)`
  text-align: center;
  max-width: 600px;
  z-index: 10;
  position: relative;
`;

const ErrorCode = styled(motion.h1)`
  font-size: clamp(6rem, 20vw, 12rem);
  font-weight: 900;
  background: linear-gradient(135deg, #fff 0%, #c084fc 40%, #8b5cf6 60%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1;
`;

const Title = styled(motion.h2)`
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: #fff;
  font-weight: 700;
  margin: 1rem 0;
`;

const Description = styled(motion.p)`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  margin-bottom: 2.5rem;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.5);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const PopularLinks = styled(motion.div)`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const PopularLinksTitle = styled.h3`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const LinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const PopularLink = styled(Link)`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    color: #a855f7;
  }
`;

const KeyboardIcon = styled(motion.div)`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Typogram</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Typogram's homepage or explore our typing courses, practice tests, and blog." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      <Container>
        <Content
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <KeyboardIcon
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaKeyboard />
          </KeyboardIcon>
          
          <ErrorCode
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            404
          </ErrorCode>
          
          <Title
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Page Not Found
          </Title>
          
          <Description
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.
          </Description>
          
          <ButtonGroup
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button to="/">
              <FaHome /> Go Home
            </Button>
            <SecondaryButton as="button" onClick={() => navigate(-1)} style={{cursor: 'pointer'}}>
              <FaArrowLeft /> Go Back
            </SecondaryButton>
          </ButtonGroup>
          
          <PopularLinks
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <PopularLinksTitle>Popular Pages:</PopularLinksTitle>
            <LinksGrid>
              <PopularLink to="/courses">Courses</PopularLink>
              <PopularLink to="/typing-display">Practice</PopularLink>
              <PopularLink to="/start-test">Demo Test</PopularLink>
              <PopularLink to="/blog">Blog</PopularLink>
              <PopularLink to="/games">Games</PopularLink>
              <PopularLink to="/daily-challenge">Daily Challenge</PopularLink>
              <PopularLink to="/about">About</PopularLink>
              <PopularLink to="/contact-us">Contact</PopularLink>
            </LinksGrid>
          </PopularLinks>
        </Content>
      </Container>
    </>
  );
};

export default NotFoundPage;

