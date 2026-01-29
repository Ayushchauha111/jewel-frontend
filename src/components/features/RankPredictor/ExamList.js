import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiFilter, FiTrendingUp, FiStar, FiChevronRight, FiUsers, FiClock, FiTarget, FiUploadCloud } from 'react-icons/fi';
import RankPredictorService from '../../../service/rankPredictor.service';

// Animations
const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
`;

// Styled Components
const PageWrapper = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
    padding: 0;
`;

const HeroSection = styled.div`
    position: relative;
    padding: 4rem 2rem 3rem;
    text-align: center;
    background: linear-gradient(180deg, rgba(226, 183, 20, 0.1) 0%, transparent 100%);
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 0%, rgba(226, 183, 20, 0.15) 0%, transparent 50%);
        pointer-events: none;
    }
    
    @media (max-width: 768px) {
        padding: 2rem 1rem;
    }
`;

const HeroTitle = styled(motion.h1)`
    font-size: 3rem;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 1rem;
    
    span {
        background: linear-gradient(135deg, #e2b714, #f39c12, #e2b714);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: ${shimmer} 3s linear infinite;
    }
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const HeroSubtitle = styled(motion.p)`
    font-size: 1.2rem;
    color: #a0a0a0;
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.6;
    
    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const SearchContainer = styled(motion.div)`
    max-width: 600px;
    margin: 0 auto;
    position: relative;
`;

const AnalyzeResultButton = styled(motion.button)`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    border: 2px solid rgba(226, 183, 20, 0.5);
    background: rgba(226, 183, 20, 0.1);
    color: #e2b714;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1.5rem;
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(226, 183, 20, 0.2);
        border-color: #e2b714;
        transform: translateY(-2px);
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 1rem 1rem 1rem 3.5rem;
    border-radius: 50px;
    border: 2px solid rgba(226, 183, 20, 0.3);
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: #e2b714;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 30px rgba(226, 183, 20, 0.2);
    }
    
    &::placeholder {
        color: #666;
    }
`;

const SearchIcon = styled(FiSearch)`
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    color: #e2b714;
    font-size: 1.3rem;
`;

const ContentWrapper = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
    
    @media (max-width: 768px) {
        padding: 0 1rem 2rem;
    }
`;

const CategoryFilters = styled(motion.div)`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    margin-bottom: 3rem;
    padding: 1rem;
`;

const CategoryButton = styled(motion.button)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    border: 1px solid ${props => props.$active ? '#e2b714' : 'rgba(255, 255, 255, 0.1)'};
    background: ${props => props.$active ? 'linear-gradient(135deg, rgba(226, 183, 20, 0.2), rgba(243, 156, 18, 0.1))' : 'rgba(255, 255, 255, 0.03)'};
    color: ${props => props.$active ? '#e2b714' : '#a0a0a0'};
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        border-color: #e2b714;
        color: #e2b714;
        transform: translateY(-2px);
    }
    
    .count {
        background: ${props => props.$active ? '#e2b714' : 'rgba(255, 255, 255, 0.1)'};
        color: ${props => props.$active ? '#1a1a1a' : '#888'};
        padding: 0.2rem 0.5rem;
        border-radius: 10px;
        font-size: 0.8rem;
    }
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    color: #ffffff;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
        color: #e2b714;
    }
`;

const ExamGrid = styled(motion.div)`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1.5rem;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ExamCard = styled(motion.div)`
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1.5rem;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${props => props.$categoryColor || 'linear-gradient(90deg, #e2b714, #f39c12)'};
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    &:hover {
        transform: translateY(-5px);
        border-color: rgba(226, 183, 20, 0.3);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        
        &::before {
            opacity: 1;
        }
    }
`;

const ExamHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
`;

const ExamIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${props => props.$bg || 'linear-gradient(135deg, rgba(226, 183, 20, 0.2), rgba(243, 156, 18, 0.1))'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
`;

const ExamBadge = styled.span`
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    background: ${props => {
        switch(props.$type) {
            case 'FEATURED': return 'linear-gradient(135deg, #e2b714, #f39c12)';
            case 'NEW': return 'linear-gradient(135deg, #00d4ff, #0099ff)';
            case 'HOT': return 'linear-gradient(135deg, #ff6b6b, #ff4757)';
            default: return 'rgba(255, 255, 255, 0.1)';
        }
    }};
    color: ${props => props.$type ? '#1a1a1a' : '#888'};
`;

const ExamTitle = styled.h3`
    font-size: 1.2rem;
    color: #ffffff;
    margin-bottom: 0.5rem;
    font-weight: 600;
`;

const ExamDescription = styled.p`
    font-size: 0.9rem;
    color: #888;
    line-height: 1.5;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const ExamMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: #a0a0a0;
    
    svg {
        color: #e2b714;
        font-size: 1rem;
    }
`;

const ExamFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const UsageCount = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: #666;
    
    svg {
        color: #e2b714;
    }
`;

const CalculateButton = styled(motion.button)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    border: none;
    background: linear-gradient(135deg, #e2b714, #f39c12);
    color: #1a1a1a;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 5px 20px rgba(226, 183, 20, 0.4);
    }
`;

const EmptyState = styled(motion.div)`
    text-align: center;
    padding: 4rem 2rem;
    
    svg {
        font-size: 4rem;
        color: #333;
        margin-bottom: 1rem;
    }
    
    h3 {
        color: #666;
        margin-bottom: 0.5rem;
    }
    
    p {
        color: #555;
    }
`;

const LoadingGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1.5rem;
`;

const LoadingCard = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 1.5rem;
    height: 250px;
    animation: ${pulse} 1.5s ease-in-out infinite;
`;

// Category colors and icons
const categoryConfig = {
    SSC: { icon: '📋', color: 'linear-gradient(135deg, #e2b714, #f39c12)' },
    RAILWAY: { icon: '🚂', color: 'linear-gradient(135deg, #3498db, #2980b9)' },
    BANKING: { icon: '🏦', color: 'linear-gradient(135deg, #2ecc71, #27ae60)' },
    STATE: { icon: '🏛️', color: 'linear-gradient(135deg, #9b59b6, #8e44ad)' },
    DEFENCE: { icon: '⚔️', color: 'linear-gradient(135deg, #e74c3c, #c0392b)' },
    POLICE: { icon: '👮', color: 'linear-gradient(135deg, #1abc9c, #16a085)' },
    IB: { icon: '🔍', color: 'linear-gradient(135deg, #34495e, #2c3e50)' },
    OTHER: { icon: '📝', color: 'linear-gradient(135deg, #95a5a6, #7f8c8d)' }
};

const ExamList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [exams, setExams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [totalExams, setTotalExams] = useState(0);
    
    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await RankPredictorService.getCategories();
                setCategories(data.categories || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);
    
    // Fetch exams when filters change
    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            try {
                const params = {};
                if (searchTerm) params.search = searchTerm;
                if (selectedCategory) params.category = selectedCategory;
                
                const data = await RankPredictorService.getExams(params);
                setExams(data.exams || []);
                setTotalExams(data.total || 0);
            } catch (error) {
                console.error('Error fetching exams:', error);
                setExams([]);
            } finally {
                setLoading(false);
            }
        };
        
        const debounce = setTimeout(fetchExams, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, selectedCategory]);
    
    // Update URL params
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory);
        setSearchParams(params);
    }, [searchTerm, selectedCategory, setSearchParams]);
    
    const handleCategoryClick = (category) => {
        setSelectedCategory(selectedCategory === category ? '' : category);
    };
    
    const handleExamClick = (exam) => {
        navigate(`/rank-predictor/${exam.code || exam.id}`);
    };
    
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };
    
    return (
        <PageWrapper>
            <Helmet>
                <title>Rank Predictor & Marks Calculator | Typogram</title>
                <meta name="description" content="Calculate your marks and predict your rank for SSC, Railway, Banking, and other government exams. Free instant rank prediction based on collective data." />
                <meta name="keywords" content="rank predictor, marks calculator, SSC CGL, SSC CHSL, RRB NTPC, government exams, cutoff prediction" />
            </Helmet>
            
            {/* Hero Section */}
            <HeroSection>
                <HeroTitle
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span>Rank Predictor</span> & Marks Calculator
                </HeroTitle>
                <HeroSubtitle
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Calculate your marks and get instant rank predictions for SSC, Railway, Banking, and other competitive exams
                </HeroSubtitle>
                
                <SearchContainer
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <SearchIcon />
                    <SearchInput
                        type="text"
                        placeholder="Search exams... (e.g., SSC CGL, RRB NTPC)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchContainer>
                
                <AnalyzeResultButton
                    onClick={() => navigate('/rank-predictor/analyze')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FiUploadCloud /> Upload Result PDF/URL to Analyze
                </AnalyzeResultButton>
            </HeroSection>
            
            <ContentWrapper>
                {/* Category Filters */}
                <CategoryFilters
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <CategoryButton
                        $active={!selectedCategory}
                        onClick={() => setSelectedCategory('')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        All Exams
                        <span className="count">{totalExams}</span>
                    </CategoryButton>
                    {categories.map((cat) => (
                        <CategoryButton
                            key={cat.value}
                            $active={selectedCategory === cat.value}
                            onClick={() => handleCategoryClick(cat.value)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {cat.icon} {cat.label}
                            <span className="count">{cat.count}</span>
                        </CategoryButton>
                    ))}
                </CategoryFilters>
                
                {/* Exam Grid */}
                {loading ? (
                    <LoadingGrid>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <LoadingCard key={i} />
                        ))}
                    </LoadingGrid>
                ) : exams.length > 0 ? (
                    <>
                        <SectionTitle>
                            <FiTrendingUp />
                            {selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : 'All Exams'}
                            ({exams.length})
                        </SectionTitle>
                        
                        <ExamGrid
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <AnimatePresence>
                                {exams.map((exam, index) => (
                                    <ExamCard
                                        key={exam.id}
                                        $categoryColor={categoryConfig[exam.category]?.color}
                                        onClick={() => handleExamClick(exam)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <ExamHeader>
                                            <ExamIcon $bg={categoryConfig[exam.category]?.color}>
                                                {categoryConfig[exam.category]?.icon || '📝'}
                                            </ExamIcon>
                                            {exam.isFeatured && <ExamBadge $type="FEATURED">⭐ Featured</ExamBadge>}
                                        </ExamHeader>
                                        
                                        <ExamTitle>{exam.name}</ExamTitle>
                                        <ExamDescription>{exam.description}</ExamDescription>
                                        
                                        <ExamMeta>
                                            <MetaItem>
                                                <FiTarget />
                                                {exam.totalQuestions} Questions
                                            </MetaItem>
                                            <MetaItem>
                                                <FiClock />
                                                {exam.totalTime} mins
                                            </MetaItem>
                                            <MetaItem>
                                                <FiStar />
                                                {exam.totalMarks} Marks
                                            </MetaItem>
                                        </ExamMeta>
                                        
                                        <ExamFooter>
                                            <UsageCount>
                                                <FiUsers />
                                                {formatNumber(exam.usageCount || 0)} used
                                            </UsageCount>
                                            <CalculateButton
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Calculate <FiChevronRight />
                                            </CalculateButton>
                                        </ExamFooter>
                                    </ExamCard>
                                ))}
                            </AnimatePresence>
                        </ExamGrid>
                    </>
                ) : (
                    <EmptyState
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <FiSearch />
                        <h3>No exams found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                    </EmptyState>
                )}
            </ContentWrapper>
        </PageWrapper>
    );
};

export default ExamList;
