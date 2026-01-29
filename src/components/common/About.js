import React from "react";
import styled, { keyframes } from "styled-components";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import SpeedIcon from "@mui/icons-material/Speed";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Link as RouterLink } from "react-router-dom";

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #fff;
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 100px 20px 60px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(230, 126, 34, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #e2b714 0%, #f39c12 50%, #e2b714 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientMove} 3s ease infinite;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.4rem;
  color: #a0a0a0;
  max-width: 700px;
  line-height: 1.8;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const HeroIcon = styled(motion.div)`
  font-size: 80px;
  color: #e2b714;
  margin-bottom: 30px;
  animation: ${float} 3s ease-in-out infinite;
  
  svg {
    font-size: inherit;
  }
`;

const Section = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 60px;
  color: #fff;
  
  span {
    color: #e2b714;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 40px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const FeatureCard = styled(motion.div)`
  background: linear-gradient(145deg, rgba(30, 30, 30, 0.8), rgba(20, 20, 20, 0.9));
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  border: 1px solid rgba(100, 100, 100, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    border-color: rgba(230, 126, 34, 0.5);
    box-shadow: 0 20px 40px rgba(230, 126, 34, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(230, 126, 34, 0.2), rgba(243, 156, 18, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #e2b714;
  
  svg {
    font-size: 36px;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #fff;
`;

const FeatureText = styled.p`
  font-size: 1rem;
  color: #888;
  line-height: 1.6;
`;

const StorySection = styled.section`
  padding: 100px 20px;
  background: linear-gradient(180deg, transparent, rgba(230, 126, 34, 0.05), transparent);
`;

const StoryContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
`;

const StoryText = styled(motion.p)`
  font-size: 1.25rem;
  color: #b0b0b0;
  line-height: 2;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    line-height: 1.8;
  }
`;

const StatsSection = styled.section`
  padding: 80px 20px;
  background: rgba(20, 20, 20, 0.5);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: 30px;
`;

const StatNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  color: #e2b714;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const CTASection = styled.section`
  padding: 100px 20px;
  text-align: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(230, 126, 34, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const CTATitle = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #fff;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const CTAText = styled.p`
  font-size: 1.2rem;
  color: #888;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(RouterLink)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  background: linear-gradient(135deg, #e2b714, #f39c12);
  color: #1a1a1a;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(230, 126, 34, 0.4);
  }
`;

const SecondaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  background: transparent;
  color: #e2b714;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid #e2b714;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(230, 126, 34, 0.1);
    transform: translateY(-3px);
  }
`;

const TeamSection = styled.section`
  padding: 80px 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const TeamText = styled.p`
  font-size: 1.1rem;
  color: #888;
  line-height: 1.8;
  margin-bottom: 30px;
`;

const ContactInfo = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin-top: 40px;
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2b714;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #f39c12;
  }
  
  svg {
    font-size: 20px;
  }
`;

const Footer = styled.footer`
  padding: 40px 20px;
  text-align: center;
  border-top: 1px solid rgba(100, 100, 100, 0.2);
  color: #666;
  font-size: 0.9rem;
`;

const About = () => {
  const features = [
    {
      icon: <SchoolIcon />,
      title: "Exam-Focused Training",
      text: "Specialized courses for SSC, CHSL, RRB, IBPS, and government exams with real exam patterns."
    },
    {
      icon: <SpeedIcon />,
      title: "Real-Time Feedback",
      text: "Track your WPM, accuracy, and progress with instant analytics and performance insights."
    },
    {
      icon: <TrendingUpIcon />,
      title: "Adaptive Learning",
      text: "Personalized practice that adjusts to your skill level and targets your weak areas."
    },
    {
      icon: <EmojiEventsIcon />,
      title: "Live Competitions",
      text: "Compete with others in live typing races and climb the leaderboards."
    },
    {
      icon: <VerifiedIcon />,
      title: "Certified Courses",
      text: "Get certificates on course completion to showcase your typing skills."
    },
    {
      icon: <GroupsIcon />,
      title: "Community Support",
      text: "Join thousands of learners, share tips, and grow together."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "100+", label: "Courses" },
    { number: "95%", label: "Success Rate" },
    { number: "4.8★", label: "User Rating" }
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>About Us | Typogram - Master Typing for Competitive Exams</title>
        <meta
          name="description"
          content="Learn about Typogram—India's leading platform for mastering typing skills for competitive exams like SSC, CHSL, RRB, and Banking."
        />
        <meta
          name="keywords"
          content="about typogram, typing courses, exam preparation, SSC typing, government job typing"
        />
        <link rel="canonical" href="https://typogram.in/about" />
      </Helmet>

      <HeroSection>
        <HeroIcon
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <KeyboardIcon />
        </HeroIcon>
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          About Typogram
        </HeroTitle>
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Your ultimate platform for mastering typing skills and acing competitive exams. 
          We're here to help you type your way to success.
        </HeroSubtitle>
      </HeroSection>

      <StorySection>
        <StoryContent>
          <SectionTitle
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Our <span>Story</span>
          </SectionTitle>
          <StoryText
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Founded in 2023, Typogram was born from a simple observation: millions of students 
            preparing for government exams needed quality typing training, but options were limited 
            and outdated.
          </StoryText>
          <StoryText
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            We built Typogram to bridge this gap—a modern, intuitive platform that makes typing 
            practice engaging and effective. Today, we're proud to support thousands of aspirants 
            in achieving their career dreams.
          </StoryText>
        </StoryContent>
      </StorySection>

      <Section>
        <SectionTitle
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why Choose <span>Typogram?</span>
        </SectionTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureText>{feature.text}</FeatureText>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Section>

      <StatsSection>
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>
      </StatsSection>

      <TeamSection>
        <SectionTitle
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Built with <span>❤️</span> in India
        </SectionTitle>
        <TeamText>
          We're a passionate team of educators and developers dedicated to making 
          quality typing education accessible to everyone. Your success is our mission.
        </TeamText>
        <ContactInfo>
          <ContactItem href="mailto:ask.typogram@gmail.com">
            <EmailIcon /> ask.typogram@gmail.com
          </ContactItem>
          <ContactItem href="tel:+918077605057">
            📞 +91 8077605057
          </ContactItem>
        </ContactInfo>
      </TeamSection>

      <CTASection>
        <CTATitle
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Start Your Journey?
        </CTATitle>
        <CTAText>
          Join thousands of successful aspirants who have mastered typing with Typogram.
        </CTAText>
        <CTAButtons>
          <PrimaryButton to="/typing-display">
            <RocketLaunchIcon /> Start Practicing
          </PrimaryButton>
          <SecondaryButton href="/courses">
            <SchoolIcon /> View Courses
          </SecondaryButton>
        </CTAButtons>
      </CTASection>

      <Footer>
        © {new Date().getFullYear()} Typogram. All rights reserved. | Made with ❤️ for aspirants.
      </Footer>
    </PageContainer>
  );
};

export default About;
