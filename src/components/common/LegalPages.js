import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiChevronDown, FiMail, FiPhone, FiMessageCircle, FiHelpCircle, FiBook, FiShield, FiCreditCard, FiFileText } from 'react-icons/fi';

// ============ SHARED STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #050507 0%, #0a0a14 50%, #0d0d1a 100%);
  padding: 120px 20px 80px;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const PageHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
`;

const PageIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: #8b5cf6;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #a855f7 50%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const LastUpdated = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
`;

const ContentCard = styled(motion.div)`
  background: rgba(20, 20, 35, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 24px;
  padding: 3rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const Section = styled.div`
  margin-bottom: 2.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #a855f7;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Paragraph = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 1rem;
`;

const ListItem = styled.li`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;
  
  &::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #8b5cf6;
  }
`;

const Highlight = styled.span`
  color: #a855f7;
  font-weight: 600;
`;

const Link = styled.a`
  color: #8b5cf6;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: #a855f7;
    text-decoration: underline;
  }
`;

const ContactBox = styled.div`
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  svg {
    color: #8b5cf6;
    flex-shrink: 0;
  }
`;

// ============ FAQ SPECIFIC STYLES ============
const FAQItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  margin-bottom: 1rem;
  overflow: hidden;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  color: #fff;
  font-size: 1.05rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(139, 92, 246, 0.05);
  }
  
  svg {
    color: #8b5cf6;
    transition: transform 0.3s;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const FAQAnswer = styled(motion.div)`
  padding: 0 1.5rem 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
`;

// ============ HELP CENTER STYLES ============
const HelpGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const HelpCard = styled(motion.a)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  text-decoration: none;
  transition: all 0.3s;
  display: block;
  
  &:hover {
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.4);
    transform: translateY(-4px);
  }
`;

const HelpCardIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #8b5cf6;
`;

const HelpCardTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const HelpCardDesc = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  line-height: 1.5;
`;

// ============ PRIVACY POLICY PAGE ============
export const PrivacyPolicyPage = () => {
  return (
    <PageContainer>
      <Helmet>
        <title>Privacy Policy | Typogram</title>
        <meta name="description" content="Learn how Typogram protects your privacy and manages your data while you improve your typing skills." />
      </Helmet>
      
      <ContentWrapper>
        <PageHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageIcon><FiShield /></PageIcon>
          <PageTitle>Privacy Policy</PageTitle>
          <LastUpdated>Last Updated: January 14, 2026</LastUpdated>
        </PageHeader>
        
        <ContentCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section>
            <Paragraph>
              At <Highlight>Typogram</Highlight>, we value your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our website at{' '}
              <Link href="https://typogram.in">typogram.in</Link>.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>What We Collect</SectionTitle>
            <Paragraph><strong>Information You Provide:</strong></Paragraph>
            <List>
              <ListItem><Highlight>Name</Highlight> and <Highlight>email address</Highlight> for account creation</ListItem>
              <ListItem><Highlight>Phone number</Highlight> (optional, for support)</ListItem>
              <ListItem><Highlight>Profile details</Highlight> and course progress</ListItem>
            </List>
            
            <Paragraph><strong>Data Collected Automatically:</strong></Paragraph>
            <List>
              <ListItem><Highlight>Usage Data</Highlight>: Pages visited, typing stats, device info</ListItem>
              <ListItem><Highlight>Cookies</Highlight>: For personalization and analytics</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>How We Use Your Data</SectionTitle>
            <List>
              <ListItem>Provide and improve our typing courses and tools</ListItem>
              <ListItem>Manage your account and track progress</ListItem>
              <ListItem>Send updates and course recommendations</ListItem>
              <ListItem>Respond to your questions or requests</ListItem>
              <ListItem>Analyze usage trends to improve Typogram</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>Data Security</SectionTitle>
            <Paragraph>
              We use industry-standard measures including encryption to protect your data. 
              Your data is processed in India and may be stored on secure cloud servers.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>Your Rights</SectionTitle>
            <List>
              <ListItem><Highlight>Access</Highlight>: Request a copy of your data</ListItem>
              <ListItem><Highlight>Update</Highlight>: Edit your profile anytime</ListItem>
              <ListItem><Highlight>Delete</Highlight>: Delete your account via settings</ListItem>
              <ListItem><Highlight>Opt Out</Highlight>: Unsubscribe from emails anytime</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>Contact Us</SectionTitle>
            <ContactBox>
              <ContactItem><FiMail /> <Link href="mailto:support@typogram.in">support@typogram.in</Link></ContactItem>
              <ContactItem><FiPhone /> <Link href="tel:+918077605057">+91 8077605057</Link></ContactItem>
            </ContactBox>
          </Section>
        </ContentCard>
      </ContentWrapper>
    </PageContainer>
  );
};

// ============ TERMS OF SERVICE PAGE ============
export const TermsOfServicePage = () => {
  return (
    <PageContainer>
      <Helmet>
        <title>Terms of Service | Typogram</title>
        <meta name="description" content="Read the terms and conditions for using Typogram's typing courses and services." />
      </Helmet>
      
      <ContentWrapper>
        <PageHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageIcon><FiFileText /></PageIcon>
          <PageTitle>Terms of Service</PageTitle>
          <LastUpdated>Last Updated: January 14, 2026</LastUpdated>
        </PageHeader>
        
        <ContentCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section>
            <Paragraph>
              Welcome to <Highlight>Typogram</Highlight>! By accessing or using our website at{' '}
              <Link href="https://typogram.in">typogram.in</Link>, you agree to be bound by these Terms of Service.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>1. Account Registration</SectionTitle>
            <List>
              <ListItem>You must provide accurate and complete information during registration</ListItem>
              <ListItem>You are responsible for maintaining the security of your account</ListItem>
              <ListItem>You must be at least 13 years old to use Typogram</ListItem>
              <ListItem>One person may not maintain multiple accounts</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>2. Acceptable Use</SectionTitle>
            <Paragraph>You agree NOT to:</Paragraph>
            <List>
              <ListItem>Use automated systems or bots to access our services</ListItem>
              <ListItem>Attempt to manipulate typing test results or leaderboards</ListItem>
              <ListItem>Share your account credentials with others</ListItem>
              <ListItem>Upload or share harmful, offensive, or illegal content</ListItem>
              <ListItem>Interfere with the proper functioning of the website</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>3. Course Access & Subscriptions</SectionTitle>
            <List>
              <ListItem>Paid courses grant access for the specified validity period</ListItem>
              <ListItem>Course materials are for personal use only and cannot be redistributed</ListItem>
              <ListItem>We reserve the right to update course content at any time</ListItem>
              <ListItem>Access may be revoked for violation of these terms</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>4. Intellectual Property</SectionTitle>
            <Paragraph>
              All content on Typogram, including courses, tests, and materials, is owned by Typogram 
              and protected by copyright laws. You may not copy, modify, or distribute our content without permission.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>5. Limitation of Liability</SectionTitle>
            <Paragraph>
              Typogram is provided "as is" without warranties. We are not liable for any indirect, 
              incidental, or consequential damages arising from your use of our services.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>6. Changes to Terms</SectionTitle>
            <Paragraph>
              We may update these terms at any time. Continued use of Typogram after changes 
              constitutes acceptance of the new terms.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>Contact Us</SectionTitle>
            <ContactBox>
              <ContactItem><FiMail /> <Link href="mailto:support@typogram.in">support@typogram.in</Link></ContactItem>
              <ContactItem><FiPhone /> <Link href="tel:+918077605057">+91 8077605057</Link></ContactItem>
            </ContactBox>
          </Section>
        </ContentCard>
      </ContentWrapper>
    </PageContainer>
  );
};

// ============ REFUND POLICY PAGE ============
export const RefundPolicyPage = () => {
  return (
    <PageContainer>
      <Helmet>
        <title>Refund Policy | Typogram</title>
        <meta name="description" content="Learn about Typogram's refund policy for courses and subscriptions." />
      </Helmet>
      
      <ContentWrapper>
        <PageHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageIcon><FiCreditCard /></PageIcon>
          <PageTitle>Refund Policy</PageTitle>
          <LastUpdated>Last Updated: January 14, 2026</LastUpdated>
        </PageHeader>
        
        <ContentCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section>
            <Paragraph>
              At <Highlight>Typogram</Highlight>, we want you to be completely satisfied with your purchase. 
              Please read our refund policy carefully before making a purchase.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>Eligibility for Refunds</SectionTitle>
            <List>
              <ListItem>Refund requests must be made within <Highlight>7 days</Highlight> of purchase</ListItem>
              <ListItem>You must not have completed more than <Highlight>20%</Highlight> of the course content</ListItem>
              <ListItem>The course must not have been previously refunded</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>Non-Refundable Items</SectionTitle>
            <List>
              <ListItem>Courses accessed beyond the 7-day window</ListItem>
              <ListItem>Courses with more than 20% completion</ListItem>
              <ListItem>Special promotional or discounted purchases</ListItem>
              <ListItem>Live exam registrations after the exam has started</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>How to Request a Refund</SectionTitle>
            <List>
              <ListItem>Email us at <Link href="mailto:support@typogram.in">support@typogram.in</Link></ListItem>
              <ListItem>Include your registered email and order details</ListItem>
              <ListItem>Provide reason for refund request</ListItem>
              <ListItem>We will respond within 2-3 business days</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>Refund Processing</SectionTitle>
            <List>
              <ListItem>Approved refunds are processed within <Highlight>5-7 business days</Highlight></ListItem>
              <ListItem>Refunds are credited to the original payment method</ListItem>
              <ListItem>Bank processing may take additional 3-5 days</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>Contact Us</SectionTitle>
            <Paragraph>For refund queries, reach out to:</Paragraph>
            <ContactBox>
              <ContactItem><FiMail /> <Link href="mailto:support@typogram.in">support@typogram.in</Link></ContactItem>
              <ContactItem><FiPhone /> <Link href="tel:+918077605057">+91 8077605057</Link></ContactItem>
            </ContactBox>
          </Section>
        </ContentCard>
      </ContentWrapper>
    </PageContainer>
  );
};

// ============ COOKIE POLICY PAGE ============
export const CookiePolicyPage = () => {
  return (
    <PageContainer>
      <Helmet>
        <title>Cookie Policy | Typogram</title>
        <meta name="description" content="Learn how Typogram uses cookies to enhance your experience." />
      </Helmet>
      
      <ContentWrapper>
        <PageHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageIcon>🍪</PageIcon>
          <PageTitle>Cookie Policy</PageTitle>
          <LastUpdated>Last Updated: January 14, 2026</LastUpdated>
        </PageHeader>
        
        <ContentCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section>
            <Paragraph>
              <Highlight>Typogram</Highlight> uses cookies to enhance your browsing experience. 
              This policy explains what cookies are and how we use them.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>What Are Cookies?</SectionTitle>
            <Paragraph>
              Cookies are small text files stored on your device when you visit a website. 
              They help websites remember your preferences and improve functionality.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>Types of Cookies We Use</SectionTitle>
            
            <Paragraph><Highlight>Essential Cookies</Highlight></Paragraph>
            <List>
              <ListItem>Required for basic site functionality</ListItem>
              <ListItem>Enable secure login and session management</ListItem>
              <ListItem>Cannot be disabled</ListItem>
            </List>
            
            <Paragraph><Highlight>Preference Cookies</Highlight></Paragraph>
            <List>
              <ListItem>Remember your settings and preferences</ListItem>
              <ListItem>Store your language and theme choices</ListItem>
              <ListItem>Enhance your personalized experience</ListItem>
            </List>
            
            <Paragraph><Highlight>Analytics Cookies</Highlight></Paragraph>
            <List>
              <ListItem>Help us understand how you use Typogram</ListItem>
              <ListItem>Track page views and user interactions</ListItem>
              <ListItem>Used to improve our services</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>Managing Cookies</SectionTitle>
            <Paragraph>
              You can control cookies through your browser settings. Note that disabling 
              certain cookies may affect the functionality of our website.
            </Paragraph>
            <List>
              <ListItem><Highlight>Chrome</Highlight>: Settings → Privacy and Security → Cookies</ListItem>
              <ListItem><Highlight>Firefox</Highlight>: Settings → Privacy & Security → Cookies</ListItem>
              <ListItem><Highlight>Safari</Highlight>: Preferences → Privacy → Cookies</ListItem>
              <ListItem><Highlight>Edge</Highlight>: Settings → Cookies and Site Permissions</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>Contact Us</SectionTitle>
            <ContactBox>
              <ContactItem><FiMail /> <Link href="mailto:support@typogram.in">support@typogram.in</Link></ContactItem>
              <ContactItem><FiPhone /> <Link href="tel:+918077605057">+91 8077605057</Link></ContactItem>
            </ContactBox>
          </Section>
        </ContentCard>
      </ContentWrapper>
    </PageContainer>
  );
};

// ============ FAQ PAGE ============
const faqData = [
  {
    q: "What typing exams does Typogram prepare me for?",
    a: "Typogram offers comprehensive preparation for SSC CHSL, SSC CGL, CPCT, RRB NTPC, and various state-level typing exams. Our courses are designed specifically for Hindi and English typing tests with the exact patterns used in these exams."
  },
  {
    q: "How does the typing practice work?",
    a: "Our platform provides real-time typing practice with instant feedback on speed (WPM), accuracy, and errors. You can practice with exam-specific passages, custom texts, or our AI-generated content that adapts to your skill level."
  },
  {
    q: "Can I practice on mobile devices?",
    a: "While our platform is accessible on mobile devices, we recommend using a desktop or laptop with a physical keyboard for the best typing practice experience, as this mirrors actual exam conditions."
  },
  {
    q: "What is included in the paid courses?",
    a: "Paid courses include exam-specific practice materials, previous year question papers, timed mock tests, detailed performance analytics, personalized improvement suggestions, and access to our live exam simulations."
  },
  {
    q: "How do I track my progress?",
    a: "Your dashboard shows detailed statistics including WPM trends, accuracy improvements, daily streaks, and comparison with other users. You can also view your performance history and identify areas needing improvement."
  },
  {
    q: "Is there a free trial available?",
    a: "Yes! You can try our basic typing tests and limited practice sessions for free. Sign up to access free demo content and see if Typogram is right for you before purchasing a course."
  },
  {
    q: "How do live exams work?",
    a: "Live exams simulate real exam conditions with timed tests, webcam monitoring (optional), and instant result calculation. You compete with other users in real-time and can see your rank on the leaderboard."
  },
  {
    q: "Can I get a refund if I'm not satisfied?",
    a: "Yes, we offer refunds within 7 days of purchase if you haven't completed more than 20% of the course. Please check our Refund Policy for complete details."
  }
];

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  
  return (
    <PageContainer>
      <Helmet>
        <title>FAQ - Frequently Asked Questions | Typogram</title>
        <meta name="description" content="Find answers to common questions about Typogram's typing courses, exams, and features." />
      </Helmet>
      
      <ContentWrapper>
        <PageHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageIcon><FiHelpCircle /></PageIcon>
          <PageTitle>Frequently Asked Questions</PageTitle>
          <LastUpdated>Find answers to common questions</LastUpdated>
        </PageHeader>
        
        <ContentCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {faqData.map((faq, index) => (
            <FAQItem key={index}>
              <FAQQuestion 
                $isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.q}
                <FiChevronDown />
              </FAQQuestion>
              <AnimatePresence>
                {openIndex === index && (
                  <FAQAnswer
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.a}
                  </FAQAnswer>
                )}
              </AnimatePresence>
            </FAQItem>
          ))}
          
          <Section style={{ marginTop: '2rem' }}>
            <SectionTitle>Still have questions?</SectionTitle>
            <ContactBox>
              <ContactItem><FiMail /> <Link href="mailto:support@typogram.in">support@typogram.in</Link></ContactItem>
              <ContactItem><FiPhone /> <Link href="tel:+918077605057">+91 8077605057</Link></ContactItem>
            </ContactBox>
          </Section>
        </ContentCard>
      </ContentWrapper>
    </PageContainer>
  );
};

// ============ HELP CENTER PAGE ============
export const HelpCenterPage = () => {
  return (
    <PageContainer>
      <Helmet>
        <title>Help Center | Typogram</title>
        <meta name="description" content="Get help with Typogram - guides, tutorials, and support resources." />
      </Helmet>
      
      <ContentWrapper>
        <PageHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageIcon><FiBook /></PageIcon>
          <PageTitle>Help Center</PageTitle>
          <LastUpdated>We're here to help you succeed</LastUpdated>
        </PageHeader>
        
        <ContentCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <HelpGrid>
            <HelpCard href="/faq">
              <HelpCardIcon><FiHelpCircle /></HelpCardIcon>
              <HelpCardTitle>FAQ</HelpCardTitle>
              <HelpCardDesc>Find answers to commonly asked questions about Typogram.</HelpCardDesc>
            </HelpCard>
            
            <HelpCard href="/courses">
              <HelpCardIcon><FiBook /></HelpCardIcon>
              <HelpCardTitle>Browse Courses</HelpCardTitle>
              <HelpCardDesc>Explore our typing courses for SSC, RRB, CPCT and more.</HelpCardDesc>
            </HelpCard>
            
            <HelpCard href="/demo">
              <HelpCardIcon>⌨️</HelpCardIcon>
              <HelpCardTitle>Free Practice</HelpCardTitle>
              <HelpCardDesc>Try our free typing tests and practice sessions.</HelpCardDesc>
            </HelpCard>
            
            <HelpCard href="/feedback">
              <HelpCardIcon><FiMessageCircle /></HelpCardIcon>
              <HelpCardTitle>Send Feedback</HelpCardTitle>
              <HelpCardDesc>Share your suggestions or report issues.</HelpCardDesc>
            </HelpCard>
          </HelpGrid>
          
          <Section>
            <SectionTitle>Getting Started</SectionTitle>
            <List>
              <ListItem><Highlight>Create an account</Highlight> - Sign up for free to track your progress</ListItem>
              <ListItem><Highlight>Take a demo test</Highlight> - Check your current typing speed</ListItem>
              <ListItem><Highlight>Choose a course</Highlight> - Select based on your target exam</ListItem>
              <ListItem><Highlight>Practice daily</Highlight> - Consistency is key to improvement</ListItem>
              <ListItem><Highlight>Track your progress</Highlight> - Use the dashboard to monitor improvement</ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>Keyboard Shortcuts</SectionTitle>
            <List>
              <ListItem><Highlight>Tab</Highlight> - Restart current test</ListItem>
              <ListItem><Highlight>Esc</Highlight> - Exit test / Close modal</ListItem>
              <ListItem><Highlight>Enter</Highlight> - Submit test / Confirm action</ListItem>
            </List>
          </Section>
          
          <Section>
            <SectionTitle>Contact Support</SectionTitle>
            <Paragraph>Can't find what you're looking for? Reach out to our support team:</Paragraph>
            <ContactBox>
              <ContactItem><FiMail /> <Link href="mailto:support@typogram.in">support@typogram.in</Link></ContactItem>
              <ContactItem><FiPhone /> <Link href="tel:+918077605057">+91 8077605057</Link></ContactItem>
              <ContactItem><FiMessageCircle /> Available 24/7 for support</ContactItem>
            </ContactBox>
          </Section>
        </ContentCard>
      </ContentWrapper>
    </PageContainer>
  );
};

export default {
  PrivacyPolicyPage,
  TermsOfServicePage,
  RefundPolicyPage,
  CookiePolicyPage,
  FAQPage,
  HelpCenterPage
};
