import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaPercent, FaKeyboard, FaRedo } from 'react-icons/fa';
import http from '../../http-common';

// Styled Components
const LeaderboardContainer = styled.div`
    margin-top: 1rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 16px;
    padding: 1.25rem;
    overflow: hidden;
`;

const LeaderboardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    h4 {
        color: #a855f7;
        font-size: 1.1rem;
        margin: 0;
        font-weight: 600;
        font-family: 'Poppins', sans-serif;
    }
    
    svg {
        color: #fbbf24;
        font-size: 1.25rem;
    }
`;

const TableWrapper = styled.div`
    overflow-x: auto;
    overflow-y: auto;
    max-height: 600px;
    
    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.4);
        border-radius: 4px;
        
        &:hover {
            background: rgba(139, 92, 246, 0.6);
        }
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    color: #fff;
    font-family: 'Poppins', sans-serif;
`;

const TableHead = styled.thead`
    tr {
        background: rgba(0, 0, 0, 0.3);
    }
    
    th {
        padding: 0.75rem 1rem;
        text-align: left;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
    }
`;

const TableBody = styled.tbody`
    tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: background-color 0.2s ease;
        
        &:hover {
            background: rgba(139, 92, 246, 0.1);
        }
        
        &.current-user {
            background: rgba(251, 191, 36, 0.1);
            
            &:hover {
                background: rgba(251, 191, 36, 0.15);
            }
        }
        
        &:last-child {
            border-bottom: none;
        }
    }
    
    td {
        padding: 0.75rem 1rem;
        white-space: nowrap;
    }
`;

const RankCell = styled.td`
    font-weight: 700;
    font-size: 1rem;
`;

const RankBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    font-size: ${props => props.isTop3 ? '1.1rem' : '0.85rem'};
    background: ${props => {
        if (props.rank === 1) return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
        if (props.rank === 2) return 'linear-gradient(135deg, #9ca3af, #6b7280)';
        if (props.rank === 3) return 'linear-gradient(135deg, #d97706, #b45309)';
        return 'rgba(255, 255, 255, 0.1)';
    }};
    color: ${props => props.rank <= 3 ? '#000' : 'rgba(255, 255, 255, 0.7)'};
`;

const NameCell = styled.td`
    font-weight: 500;
    color: ${props => props.isCurrentUser ? '#fbbf24' : '#fff'};
`;

const AccuracyCell = styled.td`
    color: #22c55e;
    font-weight: 600;
`;

const WpmCell = styled.td`
    color: ${props => props.isTop3 ? '#fbbf24' : 'rgba(255, 255, 255, 0.8)'};
    font-weight: ${props => props.isTop3 ? '700' : '500'};
`;

const AttemptsCell = styled.td`
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
`;

const LoadingState = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
`;

const Spinner = styled(motion.div)`
    width: 24px;
    height: 24px;
    border: 2px solid rgba(139, 92, 246, 0.2);
    border-top-color: #a855f7;
    border-radius: 50%;
    margin-right: 0.75rem;
`;

const Leaderboard = ({ userId, testId }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                let response;
                
                // Debug log
                console.log('Leaderboard - testId:', testId, 'userId:', userId);
                
                if (testId) {
                    // Fetch test-specific leaderboard (best accuracy per user) - increased limit
                    response = await http.get(`/leaderboard/test/${testId}?limit=200`);
                    const transformedData = response.data.map((entry) => ({
                        rank: entry.rank,
                        id: entry.userId,
                        name: entry.username,
                        accuracy: entry.bestAccuracy || 0,
                        wpm: entry.bestWpm || 0,
                        attempts: entry.attempts || 1
                    }));
                    setLeaderboardData(transformedData);
                } else {
                    // Fallback to overall speed leaderboard - increased limit
                    response = await http.get('/leaderboard/speed?limit=200');
                    const transformedData = response.data.map((entry, index) => ({
                        rank: entry.rank || index + 1,
                        id: entry.id || index,
                        name: entry.username,
                        accuracy: entry.accuracy || 0,
                        wpm: entry.wpm || 0,
                        attempts: 1
                    }));
                    setLeaderboardData(transformedData);
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [testId]);

    if (loading) {
        return (
            <LeaderboardContainer>
                <LoadingState>
                    <Spinner
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Loading leaderboard...
                </LoadingState>
            </LeaderboardContainer>
        );
    }

    const getRankDisplay = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    return (
        <LeaderboardContainer>
            <LeaderboardHeader>
                <FaTrophy />
                <h4>{testId ? 'Test Leaderboard' : 'Speed Leaderboard'}</h4>
            </LeaderboardHeader>
            
            {leaderboardData.length === 0 ? (
                <EmptyState>
                    No leaderboard data yet. Be the first to complete this test!
                </EmptyState>
            ) : (
                <TableWrapper>
                    <Table>
                        <TableHead>
                            <tr>
                                <th>Rank</th>
                                <th>Name</th>
                                <th><FaPercent style={{ marginRight: '4px', fontSize: '0.65rem' }} /> Accuracy</th>
                                <th><FaKeyboard style={{ marginRight: '4px', fontSize: '0.7rem' }} /> WPM</th>
                                {testId && <th><FaRedo style={{ marginRight: '4px', fontSize: '0.65rem' }} /> Attempts</th>}
                            </tr>
                        </TableHead>
                        <TableBody>
                            {leaderboardData.map((student) => {
                                const isCurrentUser = student.id === userId;
                                const isTop3 = student.rank <= 3;
                                
                                return (
                                    <tr 
                                        key={student.id} 
                                        className={isCurrentUser ? 'current-user' : ''}
                                    >
                                        <RankCell>
                                            <RankBadge rank={student.rank} isTop3={isTop3}>
                                                {getRankDisplay(student.rank)}
                                            </RankBadge>
                                        </RankCell>
                                        <NameCell isCurrentUser={isCurrentUser}>
                                            {student.name || 'Anonymous'}
                                            {isCurrentUser && ' (You)'}
                                        </NameCell>
                                        <AccuracyCell>
                                            {(student.accuracy || 0).toFixed(1)}%
                                        </AccuracyCell>
                                        <WpmCell isTop3={isTop3}>
                                            {student.wpm || 0}
                                        </WpmCell>
                                        {testId && (
                                            <AttemptsCell>
                                                {student.attempts}
                                            </AttemptsCell>
                                        )}
                                    </tr>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableWrapper>
            )}
        </LeaderboardContainer>
    );
};

export default Leaderboard;
