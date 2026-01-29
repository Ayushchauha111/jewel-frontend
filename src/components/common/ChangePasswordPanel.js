import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiShield, FiAlertCircle } from 'react-icons/fi';
import AuthService from '../../service/auth.service';

const Container = styled(motion.div)`
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
`;

const Card = styled(motion.div)`
    background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
    border-radius: 20px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const IconWrapper = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(226, 183, 20, 0.2), rgba(243, 156, 18, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        font-size: 1.5rem;
        color: #e2b714;
    }
`;

const Title = styled.h2`
    font-size: 1.5rem;
    color: #ffffff;
    margin: 0;
    font-weight: 600;
`;

const Subtitle = styled.p`
    font-size: 0.9rem;
    color: #888;
    margin: 0.25rem 0 0;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const InputGroup = styled.div`
    position: relative;
`;

const Label = styled.label`
    display: block;
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 0.5rem;
    font-weight: 500;
`;

const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const Input = styled.input`
    width: 100%;
    padding: 1rem 3rem 1rem 1rem;
    border-radius: 12px;
    border: 2px solid ${props => props.$error ? '#e74c3c' : props.$valid ? '#2ecc71' : 'rgba(255, 255, 255, 0.1)'};
    background: rgba(255, 255, 255, 0.03);
    color: #ffffff;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: ${props => props.$error ? '#e74c3c' : '#e2b714'};
        background: rgba(255, 255, 255, 0.05);
    }
    
    &::placeholder {
        color: #666;
    }
`;

const ToggleButton = styled.button`
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        color: #e2b714;
    }
`;

const ErrorText = styled.span`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    color: #e74c3c;
    margin-top: 0.5rem;
`;

const PasswordRequirements = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    padding: 1rem;
    margin-top: 0.5rem;
`;

const RequirementTitle = styled.p`
    font-size: 0.85rem;
    color: #888;
    margin: 0 0 0.5rem;
`;

const RequirementList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    
    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const RequirementItem = styled.li`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: ${props => props.$met ? '#2ecc71' : '#888'};
    
    svg {
        font-size: 0.9rem;
    }
`;

const SubmitButton = styled(motion.button)`
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #e2b714, #f39c12);
    color: #1a1a1a;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Alert = styled(motion.div)`
    padding: 1rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    
    ${props => props.$type === 'success' && `
        background: rgba(46, 204, 113, 0.1);
        border: 1px solid rgba(46, 204, 113, 0.3);
        color: #2ecc71;
    `}
    
    ${props => props.$type === 'error' && `
        background: rgba(231, 76, 60, 0.1);
        border: 1px solid rgba(231, 76, 60, 0.3);
        color: #e74c3c;
    `}
    
    svg {
        font-size: 1.2rem;
        flex-shrink: 0;
    }
`;

const ChangePasswordPanel = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [touched, setTouched] = useState({ current: false, new: false, confirm: false });

    // Password requirements
    const requirements = [
        { label: 'At least 6 characters', met: newPassword.length >= 6 },
        { label: 'Has uppercase letter', met: /[A-Z]/.test(newPassword) },
        { label: 'Has lowercase letter', met: /[a-z]/.test(newPassword) },
        { label: 'Has a number', met: /\d/.test(newPassword) },
    ];

    const isPasswordValid = newPassword.length >= 6;
    const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const canSubmit = currentPassword.length > 0 && isPasswordValid && doPasswordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!canSubmit) return;
        
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const response = await AuthService.changePassword(currentPassword, newPassword);
            
            // Update local storage with new token
            if (response.data.accessToken) {
                const user = JSON.parse(localStorage.getItem('user'));
                user.accessToken = response.data.accessToken;
                localStorage.setItem('user', JSON.stringify(user));
            }
            
            setMessage({ type: 'success', text: 'Password changed successfully! All other sessions have been logged out.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTouched({ current: false, new: false, confirm: false });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card>
                <Header>
                    <IconWrapper>
                        <FiShield />
                    </IconWrapper>
                    <div>
                        <Title>Change Password</Title>
                        <Subtitle>Update your account password</Subtitle>
                    </div>
                </Header>

                <AnimatePresence>
                    {message.text && (
                        <Alert
                            $type={message.type}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {message.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
                            {message.text}
                        </Alert>
                    )}
                </AnimatePresence>

                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>Current Password</Label>
                        <InputWrapper>
                            <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                onBlur={() => setTouched({ ...touched, current: true })}
                                placeholder="Enter current password"
                                $error={touched.current && currentPassword.length === 0}
                            />
                            <ToggleButton
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                            </ToggleButton>
                        </InputWrapper>
                        {touched.current && currentPassword.length === 0 && (
                            <ErrorText><FiX /> Current password is required</ErrorText>
                        )}
                    </InputGroup>

                    <InputGroup>
                        <Label>New Password</Label>
                        <InputWrapper>
                            <Input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                onBlur={() => setTouched({ ...touched, new: true })}
                                placeholder="Enter new password"
                                $error={touched.new && !isPasswordValid}
                                $valid={touched.new && isPasswordValid}
                            />
                            <ToggleButton
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <FiEyeOff /> : <FiEye />}
                            </ToggleButton>
                        </InputWrapper>
                        
                        <PasswordRequirements>
                            <RequirementTitle>Password requirements:</RequirementTitle>
                            <RequirementList>
                                {requirements.map((req, index) => (
                                    <RequirementItem key={index} $met={req.met}>
                                        {req.met ? <FiCheck /> : <FiX />}
                                        {req.label}
                                    </RequirementItem>
                                ))}
                            </RequirementList>
                        </PasswordRequirements>
                    </InputGroup>

                    <InputGroup>
                        <Label>Confirm New Password</Label>
                        <InputWrapper>
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onBlur={() => setTouched({ ...touched, confirm: true })}
                                placeholder="Confirm new password"
                                $error={touched.confirm && !doPasswordsMatch}
                                $valid={doPasswordsMatch}
                            />
                            <ToggleButton
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </ToggleButton>
                        </InputWrapper>
                        {touched.confirm && confirmPassword.length > 0 && !doPasswordsMatch && (
                            <ErrorText><FiX /> Passwords do not match</ErrorText>
                        )}
                    </InputGroup>

                    <SubmitButton
                        type="submit"
                        disabled={!canSubmit || loading}
                        whileHover={{ scale: canSubmit ? 1.02 : 1 }}
                        whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid transparent',
                                    borderTop: '2px solid currentColor',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                                Changing Password...
                            </>
                        ) : (
                            <>
                                <FiLock /> Change Password
                            </>
                        )}
                    </SubmitButton>
                </Form>
            </Card>
            
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Container>
    );
};

export default ChangePasswordPanel;
