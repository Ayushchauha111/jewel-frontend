import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
    FiArrowLeft, FiTarget, FiClock, FiStar, FiUsers, FiTrendingUp, 
    FiCheck, FiX, FiMinus, FiAward, FiBarChart2, FiShare2, FiInfo 
} from 'react-icons/fi';
import RankPredictorService from '../../../service/rankPredictor.service';

// Animations
const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
`;

const confetti = keyframes`
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`;

// Styled Components
const PageWrapper = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
    padding: 2rem;
    
    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const BackButton = styled(motion.button)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: #a0a0a0;
    font-size: 0.95rem;
    cursor: pointer;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
    
    &:hover {
        border-color: #e2b714;
        color: #e2b714;
    }
`;

const ExamHeader = styled(motion.div)`
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 2rem;
    margin-bottom: 2rem;
    
    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const ExamTitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const ExamIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: ${props => props.$bg || 'linear-gradient(135deg, rgba(226, 183, 20, 0.2), rgba(243, 156, 18, 0.1))'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
`;

const ExamTitle = styled.h1`
    font-size: 2rem;
    color: #ffffff;
    margin: 0.5rem 0;
    font-weight: 700;
    
    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const ExamDescription = styled.p`
    color: #888;
    font-size: 1rem;
    line-height: 1.6;
    max-width: 800px;
`;

const ExamStats = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(226, 183, 20, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e2b714;
    }
    
    .info {
        .label {
            font-size: 0.85rem;
            color: #666;
        }
        .value {
            font-size: 1.1rem;
            color: #fff;
            font-weight: 600;
        }
    }
`;

const MainContent = styled.div`
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const CalculatorCard = styled(motion.div)`
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 2rem;
    
    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const CardTitle = styled.h2`
    font-size: 1.3rem;
    color: #ffffff;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
        color: #e2b714;
    }
`;

const InputGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const InputLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: #a0a0a0;
    margin-bottom: 0.75rem;
    
    svg {
        color: ${props => props.$iconColor || '#e2b714'};
    }
`;

const InputRow = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const NumberInput = styled.input`
    flex: 1;
    padding: 1rem;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: ${props => props.$focusColor || '#e2b714'};
        background: rgba(255, 255, 255, 0.05);
    }
    
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
        opacity: 1;
    }
`;

const IncrementButton = styled.button`
    width: 45px;
    height: 45px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(226, 183, 20, 0.2);
        border-color: #e2b714;
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

const CategorySelect = styled.select`
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: #ffffff;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: #e2b714;
    }
    
    option {
        background: #1a1a2e;
        color: #fff;
    }
`;

const CalculateButton = styled(motion.button)`
    width: 100%;
    padding: 1.2rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #e2b714, #f39c12);
    color: #1a1a1a;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const QuickInput = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
    
    button {
        padding: 0.4rem 0.8rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.03);
        color: #888;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
            border-color: #e2b714;
            color: #e2b714;
        }
    }
`;

const ResultCard = styled(motion.div)`
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 2rem;
    position: sticky;
    top: 2rem;
    
    @media (max-width: 768px) {
        position: relative;
        top: 0;
        padding: 1.5rem;
    }
`;

const ResultScore = styled.div`
    text-align: center;
    padding: 2rem;
    background: ${props => props.$positive ? 
        'linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.05))' : 
        'linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.05))'};
    border-radius: 16px;
    margin-bottom: 1.5rem;
`;

const ScoreLabel = styled.div`
    font-size: 0.95rem;
    color: #888;
    margin-bottom: 0.5rem;
`;

const ScoreValue = styled.div`
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(135deg, #e2b714, #f39c12);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

const ScoreSubtext = styled.div`
    font-size: 1rem;
    color: #666;
    margin-top: 0.5rem;
`;

const ResultStats = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const ResultStatItem = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    
    .label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.3rem;
    }
    
    .value {
        font-size: 1.3rem;
        font-weight: 700;
        color: ${props => props.$color || '#fff'};
    }
`;

const RankPrediction = styled(motion.div)`
    background: linear-gradient(135deg, rgba(226, 183, 20, 0.15), rgba(243, 156, 18, 0.05));
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    border: 1px solid rgba(226, 183, 20, 0.2);
    margin-bottom: 1.5rem;
`;

const RankLabel = styled.div`
    font-size: 0.9rem;
    color: #a0a0a0;
    margin-bottom: 0.5rem;
`;

const RankValue = styled.div`
    font-size: 2rem;
    font-weight: 800;
    color: #e2b714;
`;

const QualificationBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-size: 0.95rem;
    font-weight: 600;
    margin-top: 1rem;
    
    background: ${props => {
        switch(props.$status) {
            case 'HIGH': return 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.1))';
            case 'MODERATE': return 'linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(230, 126, 34, 0.1))';
            case 'BORDERLINE': return 'linear-gradient(135deg, rgba(241, 196, 15, 0.2), rgba(243, 156, 18, 0.1))';
            case 'LOW': return 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.1))';
            default: return 'rgba(255, 255, 255, 0.05)';
        }
    }};
    
    color: ${props => {
        switch(props.$status) {
            case 'HIGH': return '#2ecc71';
            case 'MODERATE': return '#f39c12';
            case 'BORDERLINE': return '#f1c40f';
            case 'LOW': return '#e74c3c';
            default: return '#888';
        }
    }};
    
    border: 1px solid currentColor;
`;

const InfoBox = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 1rem;
    margin-top: 1rem;
    
    p {
        font-size: 0.9rem;
        color: #888;
        line-height: 1.5;
        margin: 0;
    }
`;

const ShareButton = styled(motion.button)`
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: #a0a0a0;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    transition: all 0.3s ease;
    
    &:hover {
        border-color: #e2b714;
        color: #e2b714;
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #888;
    
    .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(226, 183, 20, 0.2);
        border-top-color: #e2b714;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

// Category configuration
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

const reservationCategories = [
    { value: 'UR', label: 'Unreserved (General)' },
    { value: 'OBC', label: 'OBC (Other Backward Classes)' },
    { value: 'EWS', label: 'EWS (Economically Weaker Section)' },
    { value: 'SC', label: 'SC (Scheduled Caste)' },
    { value: 'ST', label: 'ST (Scheduled Tribe)' },
    { value: 'ESM', label: 'Ex-Serviceman' },
    { value: 'PH', label: 'PH (Physically Handicapped)' }
];

const ExamCalculator = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    
    // Input states
    const [correct, setCorrect] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [unattempted, setUnattempted] = useState(0);
    const [category, setCategory] = useState('UR');
    
    // Result states
    const [result, setResult] = useState(null);
    
    // Fetch exam details
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const data = await RankPredictorService.getExam(examId);
                setExam(data);
                setUnattempted(data.totalQuestions);
            } catch (error) {
                console.error('Error fetching exam:', error);
                navigate('/rank-predictor');
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [examId, navigate]);
    
    // Auto-calculate unattempted
    useEffect(() => {
        if (exam) {
            const total = exam.totalQuestions;
            const newUnattempted = Math.max(0, total - correct - wrong);
            setUnattempted(newUnattempted);
        }
    }, [correct, wrong, exam]);
    
    const handleIncrement = (setter, value, max) => {
        if (value < max) setter(value + 1);
    };
    
    const handleDecrement = (setter, value) => {
        if (value > 0) setter(value - 1);
    };
    
    const handleQuickSet = (setter, value) => {
        setter(value);
    };
    
    const handleCalculate = async () => {
        if (!exam) return;
        
        setCalculating(true);
        try {
            const data = await RankPredictorService.predictRank(
                exam.id,
                correct,
                wrong,
                unattempted,
                category
            );
            setResult(data);
        } catch (error) {
            console.error('Error calculating:', error);
        } finally {
            setCalculating(false);
        }
    };
    
    const handleShare = () => {
        if (!result) return;
        
        const text = `📊 My ${exam.name} Score:\n` +
            `✅ Correct: ${correct}\n` +
            `❌ Wrong: ${wrong}\n` +
            `📝 Score: ${result.calculation.obtainedMarks.toFixed(2)}/${exam.totalMarks}\n` +
            `📈 Predicted Rank: ${result.rankPrediction.rankMin} - ${result.rankPrediction.rankMax}\n\n` +
            `Check your score at typogram.in/rank-predictor`;
        
        if (navigator.share) {
            navigator.share({ title: `${exam.name} Score`, text });
        } else {
            navigator.clipboard.writeText(text);
            alert('Result copied to clipboard!');
        }
    };
    
    if (loading) {
        return (
            <PageWrapper>
                <Container>
                    <LoadingState>
                        <div className="spinner" />
                        <p style={{ marginTop: '1rem' }}>Loading exam details...</p>
                    </LoadingState>
                </Container>
            </PageWrapper>
        );
    }
    
    if (!exam) return null;
    
    const maxQuestions = exam.totalQuestions;
    const maxCorrect = maxQuestions - wrong;
    const maxWrong = maxQuestions - correct;
    
    return (
        <PageWrapper>
            <Helmet>
                <title>{exam.name} - Marks Calculator & Rank Predictor | Typogram</title>
                <meta name="description" content={`Calculate your ${exam.name} marks and predict your rank. Free instant rank prediction based on collective data from thousands of students.`} />
            </Helmet>
            
            <Container>
                <BackButton
                    onClick={() => navigate('/rank-predictor')}
                    whileHover={{ x: -5 }}
                >
                    <FiArrowLeft /> Back to All Exams
                </BackButton>
                
                {/* Exam Header */}
                <ExamHeader
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ExamTitleRow>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <ExamIcon $bg={categoryConfig[exam.category]?.color}>
                                {categoryConfig[exam.category]?.icon || '📝'}
                            </ExamIcon>
                            <div>
                                <ExamTitle>{exam.name}</ExamTitle>
                                <ExamDescription>{exam.description}</ExamDescription>
                            </div>
                        </div>
                    </ExamTitleRow>
                    
                    <ExamStats>
                        <StatItem>
                            <div className="icon"><FiTarget /></div>
                            <div className="info">
                                <div className="label">Total Questions</div>
                                <div className="value">{exam.totalQuestions}</div>
                            </div>
                        </StatItem>
                        <StatItem>
                            <div className="icon"><FiStar /></div>
                            <div className="info">
                                <div className="label">Total Marks</div>
                                <div className="value">{exam.totalMarks}</div>
                            </div>
                        </StatItem>
                        <StatItem>
                            <div className="icon"><FiClock /></div>
                            <div className="info">
                                <div className="label">Duration</div>
                                <div className="value">{exam.totalTime} mins</div>
                            </div>
                        </StatItem>
                        <StatItem>
                            <div className="icon"><FiX /></div>
                            <div className="info">
                                <div className="label">Negative Marking</div>
                                <div className="value">-{exam.negativeMarking}</div>
                            </div>
                        </StatItem>
                        <StatItem>
                            <div className="icon"><FiUsers /></div>
                            <div className="info">
                                <div className="label">Used By</div>
                                <div className="value">{exam.usageCount || 0}+</div>
                            </div>
                        </StatItem>
                    </ExamStats>
                </ExamHeader>
                
                <MainContent>
                    {/* Calculator */}
                    <CalculatorCard
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <CardTitle>
                            <FiBarChart2 /> Marks Calculator
                        </CardTitle>
                        
                        {/* Correct Answers */}
                        <InputGroup>
                            <InputLabel $iconColor="#2ecc71">
                                <FiCheck /> Correct Answers
                            </InputLabel>
                            <InputRow>
                                <IncrementButton onClick={() => handleDecrement(setCorrect, correct)}>-</IncrementButton>
                                <NumberInput
                                    type="number"
                                    min="0"
                                    max={maxCorrect}
                                    value={correct}
                                    onChange={(e) => setCorrect(Math.min(maxCorrect, Math.max(0, parseInt(e.target.value) || 0)))}
                                    $focusColor="#2ecc71"
                                />
                                <IncrementButton onClick={() => handleIncrement(setCorrect, correct, maxCorrect)}>+</IncrementButton>
                            </InputRow>
                            <QuickInput>
                                {[10, 25, 50, 75].map(val => (
                                    <button key={val} onClick={() => handleQuickSet(setCorrect, Math.min(val, maxCorrect))}>
                                        {val}
                                    </button>
                                ))}
                            </QuickInput>
                        </InputGroup>
                        
                        {/* Wrong Answers */}
                        <InputGroup>
                            <InputLabel $iconColor="#e74c3c">
                                <FiX /> Wrong Answers
                            </InputLabel>
                            <InputRow>
                                <IncrementButton onClick={() => handleDecrement(setWrong, wrong)}>-</IncrementButton>
                                <NumberInput
                                    type="number"
                                    min="0"
                                    max={maxWrong}
                                    value={wrong}
                                    onChange={(e) => setWrong(Math.min(maxWrong, Math.max(0, parseInt(e.target.value) || 0)))}
                                    $focusColor="#e74c3c"
                                />
                                <IncrementButton onClick={() => handleIncrement(setWrong, wrong, maxWrong)}>+</IncrementButton>
                            </InputRow>
                            <QuickInput>
                                {[5, 10, 15, 20].map(val => (
                                    <button key={val} onClick={() => handleQuickSet(setWrong, Math.min(val, maxWrong))}>
                                        {val}
                                    </button>
                                ))}
                            </QuickInput>
                        </InputGroup>
                        
                        {/* Unattempted */}
                        <InputGroup>
                            <InputLabel $iconColor="#95a5a6">
                                <FiMinus /> Unattempted
                            </InputLabel>
                            <InputRow>
                                <NumberInput
                                    type="number"
                                    value={unattempted}
                                    readOnly
                                    style={{ opacity: 0.6 }}
                                />
                            </InputRow>
                        </InputGroup>
                        
                        {/* Category Selection */}
                        <InputGroup>
                            <InputLabel>
                                <FiUsers /> Reservation Category
                            </InputLabel>
                            <CategorySelect
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {reservationCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </CategorySelect>
                        </InputGroup>
                        
                        <CalculateButton
                            onClick={handleCalculate}
                            disabled={calculating}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {calculating ? (
                                <>Calculating...</>
                            ) : (
                                <>
                                    <FiTrendingUp /> Calculate & Predict Rank
                                </>
                            )}
                        </CalculateButton>
                    </CalculatorCard>
                    
                    {/* Results */}
                    <ResultCard
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <CardTitle>
                            <FiAward /> Your Results
                        </CardTitle>
                        
                        {result ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    {/* Score */}
                                    <ResultScore $positive={result.calculation.obtainedMarks > 0}>
                                        <ScoreLabel>Your Score</ScoreLabel>
                                        <ScoreValue>
                                            {result.calculation.obtainedMarks.toFixed(2)}
                                        </ScoreValue>
                                        <ScoreSubtext>
                                            out of {exam.totalMarks} ({result.calculation.percentage.toFixed(1)}%)
                                        </ScoreSubtext>
                                    </ResultScore>
                                    
                                    {/* Stats Grid */}
                                    <ResultStats>
                                        <ResultStatItem $color="#2ecc71">
                                            <div className="label">Positive</div>
                                            <div className="value">+{result.calculation.positiveMarks.toFixed(1)}</div>
                                        </ResultStatItem>
                                        <ResultStatItem $color="#e74c3c">
                                            <div className="label">Negative</div>
                                            <div className="value">-{result.calculation.negativeMarks.toFixed(1)}</div>
                                        </ResultStatItem>
                                    </ResultStats>
                                    
                                    {/* Rank Prediction */}
                                    <RankPrediction
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <RankLabel>🎯 Predicted Rank Range</RankLabel>
                                        <RankValue>
                                            {result.rankPrediction.rankMin.toLocaleString()} - {result.rankPrediction.rankMax.toLocaleString()}
                                        </RankValue>
                                        
                                        <QualificationBadge $status={result.rankPrediction.qualification?.chance}>
                                            {result.rankPrediction.qualification?.chance === 'HIGH' && '✅ '}
                                            {result.rankPrediction.qualification?.chance === 'MODERATE' && '🟡 '}
                                            {result.rankPrediction.qualification?.chance === 'BORDERLINE' && '⚠️ '}
                                            {result.rankPrediction.qualification?.chance === 'LOW' && '❌ '}
                                            {result.rankPrediction.qualification?.message || 'Qualification chances calculated'}
                                        </QualificationBadge>
                                    </RankPrediction>
                                    
                                    {/* Info */}
                                    <InfoBox>
                                        <p>
                                            <FiInfo style={{ marginRight: '0.5rem' }} />
                                            Rank prediction is based on {result.rankPrediction.totalSubmissions || 0}+ student submissions. 
                                            Average score: {(result.rankPrediction.averageScore || 0).toFixed(1)}
                                        </p>
                                    </InfoBox>
                                    
                                    {/* Share */}
                                    <ShareButton
                                        onClick={handleShare}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <FiShare2 /> Share Result
                                    </ShareButton>
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <motion.div
                                style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <FiBarChart2 style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                                <p>Enter your answers above and click "Calculate" to see your predicted rank</p>
                            </motion.div>
                        )}
                    </ResultCard>
                </MainContent>
            </Container>
        </PageWrapper>
    );
};

export default ExamCalculator;
