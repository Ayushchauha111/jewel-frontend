import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
    FiUploadCloud, FiLink, FiFileText, FiCheckCircle, FiXCircle, 
    FiUser, FiAward, FiTarget, FiArrowLeft, FiDownload, FiShare2,
    FiAlertTriangle, FiBarChart2, FiPercent, FiHash
} from 'react-icons/fi';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Animations
const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
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
    max-width: 1000px;
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

const Header = styled(motion.div)`
    text-align: center;
    margin-bottom: 3rem;
`;

const Title = styled.h1`
    font-size: 2.5rem;
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
        font-size: 1.8rem;
    }
`;

const Subtitle = styled.p`
    color: #888;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
`;

const UploadSection = styled(motion.div)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const UploadCard = styled(motion.div)`
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border-radius: 20px;
    border: 2px dashed ${props => props.$active ? '#e2b714' : 'rgba(255, 255, 255, 0.1)'};
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &:hover {
        border-color: #e2b714;
        background: rgba(226, 183, 20, 0.05);
    }
    
    ${props => props.$active && `
        border-color: #e2b714;
        background: rgba(226, 183, 20, 0.1);
    `}
`;

const UploadIcon = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(226, 183, 20, 0.2), rgba(243, 156, 18, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        font-size: 2.5rem;
        color: #e2b714;
    }
`;

const UploadTitle = styled.h3`
    font-size: 1.3rem;
    color: #ffffff;
    margin-bottom: 0.5rem;
`;

const UploadDescription = styled.p`
    font-size: 0.9rem;
    color: #888;
    margin-bottom: 1rem;
`;

const FileInput = styled.input`
    display: none;
`;

const URLInput = styled.input`
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: #ffffff;
    font-size: 1rem;
    margin-top: 1rem;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: #e2b714;
    }
    
    &::placeholder {
        color: #666;
    }
`;

const AnalyzeButton = styled(motion.button)`
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #e2b714, #f39c12);
    color: #1a1a1a;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SelectedFile = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(46, 204, 113, 0.1);
    border-radius: 8px;
    margin-top: 1rem;
    color: #2ecc71;
    font-size: 0.9rem;
    
    svg {
        flex-shrink: 0;
    }
`;

const LoadingOverlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const LoadingContent = styled.div`
    text-align: center;
    color: #fff;
    
    .spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(226, 183, 20, 0.2);
        border-top-color: #e2b714;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1.5rem;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const ResultsContainer = styled(motion.div)`
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
`;

const ResultHeader = styled.div`
    padding: 2rem;
    background: linear-gradient(135deg, rgba(226, 183, 20, 0.1), rgba(243, 156, 18, 0.05));
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ConfidenceBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    background: ${props => {
        if (props.$score >= 70) return 'rgba(46, 204, 113, 0.2)';
        if (props.$score >= 40) return 'rgba(241, 196, 15, 0.2)';
        return 'rgba(231, 76, 60, 0.2)';
    }};
    color: ${props => {
        if (props.$score >= 70) return '#2ecc71';
        if (props.$score >= 40) return '#f1c40f';
        return '#e74c3c';
    }};
`;

const ExamTypeBadge = styled.span`
    display: inline-block;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    background: linear-gradient(135deg, #e2b714, #f39c12);
    color: #1a1a1a;
    margin-left: 1rem;
`;

const CandidateInfo = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e2b714;
    }
    
    .info {
        .label {
            font-size: 0.8rem;
            color: #666;
        }
        .value {
            font-size: 1rem;
            color: #fff;
            font-weight: 600;
        }
    }
`;

const ScoreSection = styled.div`
    padding: 2rem;
`;

const ScoreGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const ScoreCard = styled(motion.div)`
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
    
    .icon {
        font-size: 1.5rem;
        color: ${props => props.$color || '#e2b714'};
        margin-bottom: 0.5rem;
    }
    
    .value {
        font-size: 1.8rem;
        font-weight: 800;
        color: ${props => props.$color || '#fff'};
    }
    
    .label {
        font-size: 0.85rem;
        color: #888;
        margin-top: 0.3rem;
    }
`;

const SubjectsSection = styled.div`
    padding: 0 2rem 2rem;
`;

const SectionTitle = styled.h3`
    font-size: 1.2rem;
    color: #fff;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
        color: #e2b714;
    }
`;

const SubjectTable = styled.div`
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    overflow: hidden;
`;

const SubjectRow = styled.div`
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    align-items: center;
    
    &:last-child {
        border-bottom: none;
    }
    
    &.header {
        background: rgba(255, 255, 255, 0.03);
        font-weight: 600;
        color: #888;
        font-size: 0.85rem;
    }
    
    @media (max-width: 600px) {
        grid-template-columns: 1fr auto;
        
        .hide-mobile {
            display: none;
        }
    }
`;

const SubjectName = styled.span`
    color: #fff;
    font-weight: 500;
`;

const SubjectMarks = styled.span`
    color: #e2b714;
    font-weight: 600;
    font-size: 1.1rem;
`;

const ProgressBar = styled.div`
    width: 100px;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    
    .fill {
        height: 100%;
        background: ${props => {
            if (props.$percentage >= 70) return '#2ecc71';
            if (props.$percentage >= 50) return '#f39c12';
            return '#e74c3c';
        }};
        border-radius: 3px;
        transition: width 0.5s ease;
    }
`;

const QualificationStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: ${props => props.$qualified ? 
        'linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.05))' : 
        'linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.05))'};
    color: ${props => props.$qualified ? '#2ecc71' : '#e74c3c'};
    font-weight: 600;
    font-size: 1.1rem;
    
    svg {
        font-size: 1.3rem;
    }
`;

const WarningsSection = styled.div`
    padding: 1rem 2rem;
    background: rgba(241, 196, 15, 0.1);
    border-top: 1px solid rgba(241, 196, 15, 0.2);
`;

const Warning = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #f1c40f;
    font-size: 0.9rem;
    
    svg {
        flex-shrink: 0;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 1rem;
    padding: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    ${props => props.$primary ? `
        background: linear-gradient(135deg, #e2b714, #f39c12);
        color: #1a1a1a;
        border: none;
    ` : `
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        
        &:hover {
            border-color: #e2b714;
        }
    `}
`;

const ResultAnalyzer = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please select a PDF file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };
    
    const handleAnalyzePDF = async () => {
        if (!selectedFile) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            const response = await axios.post(`${API_URL}/api/rank-predictor/analyze/pdf`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.error || 'Failed to analyze PDF');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to analyze PDF');
        } finally {
            setLoading(false);
        }
    };
    
    const handleAnalyzeURL = async () => {
        if (!url.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post(`${API_URL}/api/rank-predictor/analyze/url`, { url });
            
            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.error || 'Failed to analyze URL');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to analyze URL');
        } finally {
            setLoading(false);
        }
    };
    
    const handleShare = () => {
        if (!result) return;
        
        const text = `📊 My ${result.examType} Result Analysis:\n` +
            `📝 Total Marks: ${result.totalMarks}/${result.maxMarks || '?'}\n` +
            `📈 Percentage: ${result.percentage?.toFixed(1) || '?'}%\n` +
            `🏆 Rank: ${result.rank || 'N/A'}\n\n` +
            `Analyzed on typogram.in/rank-predictor/analyze`;
        
        if (navigator.share) {
            navigator.share({ title: 'My Exam Result', text });
        } else {
            navigator.clipboard.writeText(text);
            alert('Result copied to clipboard!');
        }
    };
    
    const resetAnalysis = () => {
        setResult(null);
        setSelectedFile(null);
        setUrl('');
        setError(null);
    };
    
    return (
        <PageWrapper>
            <Helmet>
                <title>Result Analyzer - Upload PDF or URL | Typogram</title>
                <meta name="description" content="Upload your exam result PDF or paste result URL to get detailed analysis including marks, subject-wise scores, rank, and qualification status." />
            </Helmet>
            
            <Container>
                <BackButton
                    onClick={() => navigate('/rank-predictor')}
                    whileHover={{ x: -5 }}
                >
                    <FiArrowLeft /> Back to Rank Predictor
                </BackButton>
                
                <Header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Title>
                        <span>Result</span> Analyzer
                    </Title>
                    <Subtitle>
                        Upload your exam result PDF or paste the result URL to extract marks, subject scores, and rank
                    </Subtitle>
                </Header>
                
                {!result ? (
                    <>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'rgba(231, 76, 60, 0.1)',
                                    border: '1px solid rgba(231, 76, 60, 0.3)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    marginBottom: '1.5rem',
                                    color: '#e74c3c',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <FiXCircle /> {error}
                            </motion.div>
                        )}
                        
                        <UploadSection
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* PDF Upload */}
                            <UploadCard
                                $active={selectedFile}
                                onClick={() => fileInputRef.current?.click()}
                                whileHover={{ scale: 1.02 }}
                            >
                                <UploadIcon>
                                    <FiUploadCloud />
                                </UploadIcon>
                                <UploadTitle>Upload Result PDF</UploadTitle>
                                <UploadDescription>
                                    Drop your result PDF here or click to browse
                                </UploadDescription>
                                <FileInput
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                />
                                
                                {selectedFile && (
                                    <SelectedFile onClick={(e) => e.stopPropagation()}>
                                        <FiFileText />
                                        {selectedFile.name}
                                    </SelectedFile>
                                )}
                                
                                <AnalyzeButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnalyzePDF();
                                    }}
                                    disabled={!selectedFile || loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Analyzing...' : 'Analyze PDF'}
                                </AnalyzeButton>
                            </UploadCard>
                            
                            {/* URL Input */}
                            <UploadCard $active={url.length > 0}>
                                <UploadIcon>
                                    <FiLink />
                                </UploadIcon>
                                <UploadTitle>Paste Result URL</UploadTitle>
                                <UploadDescription>
                                    Enter the URL of your online result page
                                </UploadDescription>
                                
                                <URLInput
                                    type="url"
                                    placeholder="https://ssc.nic.in/result/..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                
                                <AnalyzeButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAnalyzeURL();
                                    }}
                                    disabled={!url.trim() || loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'Analyzing...' : 'Analyze URL'}
                                </AnalyzeButton>
                            </UploadCard>
                        </UploadSection>
                    </>
                ) : (
                    <ResultsContainer
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header */}
                        <ResultHeader>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <ConfidenceBadge $score={result.confidenceScore}>
                                    {result.confidenceScore >= 70 ? <FiCheckCircle /> : <FiAlertTriangle />}
                                    {result.confidenceScore}% Confidence
                                </ConfidenceBadge>
                                {result.examType && result.examType !== 'UNKNOWN' && (
                                    <ExamTypeBadge>{result.examType.replace('_', ' ')}</ExamTypeBadge>
                                )}
                            </div>
                            
                            <CandidateInfo>
                                {result.candidateName && (
                                    <InfoItem>
                                        <div className="icon"><FiUser /></div>
                                        <div className="info">
                                            <div className="label">Candidate Name</div>
                                            <div className="value">{result.candidateName}</div>
                                        </div>
                                    </InfoItem>
                                )}
                                {result.rollNumber && (
                                    <InfoItem>
                                        <div className="icon"><FiHash /></div>
                                        <div className="info">
                                            <div className="label">Roll Number</div>
                                            <div className="value">{result.rollNumber}</div>
                                        </div>
                                    </InfoItem>
                                )}
                                {result.category && (
                                    <InfoItem>
                                        <div className="icon"><FiTarget /></div>
                                        <div className="info">
                                            <div className="label">Category</div>
                                            <div className="value">{result.category}</div>
                                        </div>
                                    </InfoItem>
                                )}
                            </CandidateInfo>
                        </ResultHeader>
                        
                        {/* Score Cards */}
                        <ScoreSection>
                            <ScoreGrid>
                                {result.totalMarks !== null && (
                                    <ScoreCard
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="icon"><FiBarChart2 /></div>
                                        <div className="value">{result.totalMarks}</div>
                                        <div className="label">
                                            Total Marks {result.maxMarks ? `/ ${result.maxMarks}` : ''}
                                        </div>
                                    </ScoreCard>
                                )}
                                
                                {result.percentage !== null && (
                                    <ScoreCard
                                        $color={result.percentage >= 70 ? '#2ecc71' : result.percentage >= 50 ? '#f39c12' : '#e74c3c'}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="icon"><FiPercent /></div>
                                        <div className="value">{result.percentage.toFixed(1)}%</div>
                                        <div className="label">Percentage</div>
                                    </ScoreCard>
                                )}
                                
                                {result.rank !== null && (
                                    <ScoreCard
                                        $color="#e2b714"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="icon"><FiAward /></div>
                                        <div className="value">{result.rank.toLocaleString()}</div>
                                        <div className="label">Rank</div>
                                    </ScoreCard>
                                )}
                                
                                {result.normalizedScore !== null && (
                                    <ScoreCard
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <div className="icon"><FiTarget /></div>
                                        <div className="value">{result.normalizedScore}</div>
                                        <div className="label">Normalized Score</div>
                                    </ScoreCard>
                                )}
                            </ScoreGrid>
                        </ScoreSection>
                        
                        {/* Subject-wise Marks */}
                        {Object.keys(result.subjectWiseMarks || {}).length > 0 && (
                            <SubjectsSection>
                                <SectionTitle>
                                    <FiBarChart2 /> Subject-wise Marks
                                </SectionTitle>
                                <SubjectTable>
                                    <SubjectRow className="header">
                                        <span>Subject</span>
                                        <span>Marks</span>
                                        <span className="hide-mobile">Max</span>
                                        <span className="hide-mobile">Progress</span>
                                    </SubjectRow>
                                    {Object.entries(result.subjectWiseMarks).map(([subject, data], index) => (
                                        <SubjectRow key={subject}>
                                            <SubjectName>{subject}</SubjectName>
                                            <SubjectMarks>{data.obtainedMarks}</SubjectMarks>
                                            <span className="hide-mobile" style={{ color: '#888' }}>
                                                {data.maxMarks || '-'}
                                            </span>
                                            <span className="hide-mobile">
                                                {data.maxMarks && (
                                                    <ProgressBar $percentage={(data.obtainedMarks / data.maxMarks) * 100}>
                                                        <div 
                                                            className="fill" 
                                                            style={{ width: `${(data.obtainedMarks / data.maxMarks) * 100}%` }}
                                                        />
                                                    </ProgressBar>
                                                )}
                                            </span>
                                        </SubjectRow>
                                    ))}
                                </SubjectTable>
                            </SubjectsSection>
                        )}
                        
                        {/* Qualification Status */}
                        {result.qualificationStatus && (
                            <QualificationStatus $qualified={result.qualificationStatus === 'QUALIFIED'}>
                                {result.qualificationStatus === 'QUALIFIED' ? <FiCheckCircle /> : <FiXCircle />}
                                {result.qualificationStatus.replace('_', ' ')}
                            </QualificationStatus>
                        )}
                        
                        {/* Warnings */}
                        {result.warnings && result.warnings.length > 0 && (
                            <WarningsSection>
                                {result.warnings.map((warning, index) => (
                                    <Warning key={index}>
                                        <FiAlertTriangle />
                                        {warning}
                                    </Warning>
                                ))}
                            </WarningsSection>
                        )}
                        
                        {/* Actions */}
                        <ActionButtons>
                            <ActionButton
                                onClick={resetAnalysis}
                                whileHover={{ scale: 1.02 }}
                            >
                                <FiUploadCloud /> Analyze Another
                            </ActionButton>
                            <ActionButton
                                onClick={handleShare}
                                whileHover={{ scale: 1.02 }}
                            >
                                <FiShare2 /> Share Result
                            </ActionButton>
                            <ActionButton
                                $primary
                                onClick={() => navigate('/rank-predictor')}
                                whileHover={{ scale: 1.02 }}
                            >
                                <FiBarChart2 /> Calculate Rank
                            </ActionButton>
                        </ActionButtons>
                    </ResultsContainer>
                )}
            </Container>
            
            {/* Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <LoadingOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <LoadingContent>
                            <div className="spinner" />
                            <p style={{ fontSize: '1.2rem' }}>Analyzing your result...</p>
                            <p style={{ color: '#888', marginTop: '0.5rem' }}>
                                Extracting marks, subjects, and rank
                            </p>
                        </LoadingContent>
                    </LoadingOverlay>
                )}
            </AnimatePresence>
        </PageWrapper>
    );
};

export default ResultAnalyzer;
