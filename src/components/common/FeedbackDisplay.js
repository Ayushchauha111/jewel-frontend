import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import FeedbackService from '../../service/feedback.service';

const FeedbackSection = styled.section`
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0d0d14 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse at 20% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeedbackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeedbackCard = styled(motion.div)`
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    border-color: rgba(0, 255, 136, 0.3);
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0, 255, 136, 0.2);
  }
`;

const QuoteIcon = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  color: rgba(0, 255, 136, 0.3);
  font-size: 2rem;
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
  justify-content: flex-start;
`;

const Star = styled(FaStar)`
  color: ${props => props.filled ? '#ffd700' : 'rgba(255, 255, 255, 0.2)'};
  font-size: 1rem;
`;

const FeedbackMessage = styled.p`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const FeedbackAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0f;
  font-weight: 700;
  font-size: 1.1rem;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
`;

const AuthorEmail = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
`;

const FeedbackDisplay = ({ limit = 6 }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await FeedbackService.getApprovedFeedbacks(limit);
        setFeedbacks(response.data || []);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [limit]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  if (feedbacks.length === 0) {
    return null; // Don't show section if no feedbacks
  }

  return (
    <FeedbackSection>
      <Container>
        <SectionTitle>What Our Students Say</SectionTitle>
        <SectionSubtitle>
          Real feedback from students who are improving their typing skills with Typogram
        </SectionSubtitle>
        
        <FeedbackGrid>
          {feedbacks.map((feedback, index) => (
            <FeedbackCard
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <QuoteIcon>
                <FaQuoteLeft />
              </QuoteIcon>
              
              {feedback.rating && (
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} filled={star <= feedback.rating} />
                  ))}
                </StarRating>
              )}
              
              <FeedbackMessage>{feedback.message}</FeedbackMessage>
              
              <FeedbackAuthor>
                <AuthorAvatar>
                  {getInitials(feedback.name)}
                </AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>{feedback.name}</AuthorName>
                  {feedback.email && (
                    <AuthorEmail>{feedback.email}</AuthorEmail>
                  )}
                </AuthorInfo>
              </FeedbackAuthor>
            </FeedbackCard>
          ))}
        </FeedbackGrid>
      </Container>
    </FeedbackSection>
  );
};

export default FeedbackDisplay;


