import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import PasswordService from "../../service/password.service";
import { useNavigate } from "react-router-dom";
import image1 from '../../assets/login/image-1.png'; // Adjust path as needed
import image2 from '../../assets/login/image-2.png'; // Adjust path as needed

// Styled Components
const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #accffe;
`;

const Inner = styled.div`
  position: relative;
  width: 435px;
  
  @media (max-width: 991px) {
    width: 400px;
  }
  
  @media (max-width: 767px) {
    width: 100%;
    padding: 0 15px;
  }
`;

const Image1 = styled(motion.img)`
  position: absolute;
  bottom: -12px;
  left: -191px;
  z-index: 99;
  max-width: 200px;
  
  @media (max-width: 767px) {
    max-width: 100px;
    left: -50px;
    bottom: -5px;
  }
  
  @media (max-width: 480px) {
    max-width: 80px;
    left: -40px;
  }
`;

const Image2 = styled(motion.img)`
  position: absolute;
  bottom: 0;
  right: -129px;
  max-width: 200px;
  
  @media (max-width: 767px) {
    max-width: 100px;
    right: -30px;
    bottom: -5px;
  }
  
  @media (max-width: 480px) {
    max-width: 80px;
    right: -20px;
  }
`;

const Form = styled(motion.form)`
  width: 100%;
  position: relative;
  z-index: 9;
  padding: 77px 61px 66px;
  background: #fff;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 767px) {
    padding: 40px 20px;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 480px) {
    padding: 30px 15px;
  }
`;

const Title = styled.h3`
  text-transform: uppercase;
  font-size: 25px;
  font-family: "Muli-SemiBold", sans-serif;
  color: #333;
  letter-spacing: 3px;
  text-align: center;
  margin-bottom: 33px;
  
  @media (max-width: 767px) {
    font-size: 20px;
    margin-bottom: 25px;
  }
`;

const FormHolder = styled.div`
  position: relative;
  margin-bottom: 21px;
  
  @media (max-width: 767px) {
    margin-bottom: 15px;
  }
`;

const InputField = styled.input`
  border: none;
  border-bottom: 1px solid #e6e6e6;
  display: block;
  width: 100%;
  height: 38px;
  background: none;
  padding: 3px 15px 0px; /* Adjusted padding to remove icon space */
  color: #666;
  font-family: "Muli-SemiBold", sans-serif;
  font-size: 16px;
  
  &::placeholder {
    font-size: 14px;
    font-family: "Muli-Regular", sans-serif;
    color: #999;
    transform: translateY(1px);
  }
  
  &:focus {
    border-bottom: 1px solid #accffe;
    outline: none;
  }
  
  @media (max-width: 767px) {
    height: 34px;
    font-size: 14px;
    padding: 3px 12px 0px;
  }
`;

const Button = styled(motion.button)`
  border: none;
  width: 100%;
  height: 49px;
  margin-top: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #99ccff;
  color: #fff;
  text-transform: uppercase;
  font-family: "Muli-SemiBold", sans-serif;
  font-size: 15px;
  letter-spacing: 2px;
  transition: all 0.5s;
  position: relative;
  overflow: hidden;
  
  span {
    position: relative;
    z-index: 2;
  }
  
  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: rgba(52, 152, 253, 0.25);
    transition: all 0.3s;
    transform: translate(-100%, 0);
    transition-timing-function: cubic-bezier(0.75, 0, 0.125, 1);
  }
  
  &:after {
    transition-delay: 0.2s;
  }
  
  &:hover:not(:disabled):before,
  &:hover:not(:disabled):after {
    transform: translate(0, 0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 767px) {
    height: 42px;
    margin-top: 30px;
    font-size: 14px;
  }
`;

const Message = styled(motion.div)`
  color: ${props => props.error ? '#ff4d4d' : '#333'};
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  
  @media (max-width: 767px) {
    font-size: 0.8rem;
  }
`;

// Animation Variants
const formVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(true);
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await PasswordService.forgotPassword(email);
      setMessage(response.data.message || "OTP sent successfully!");
      setTimeout(() => {
        navigate(`/verify-otp?email=${email}`);
      }, 1500);
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Inner>
        <Image1 
          src={image1} 
          alt="" 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        />
        <Form
          onSubmit={handleSendOTP}
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <Title>Forgot Password</Title>
          
          <FormHolder>
            <InputField
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </FormHolder>

          <Button
            type="submit"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={loading}
          >
            <span>{loading ? "Sending..." : "Send OTP"}</span>
          </Button>

          {message && (
            <Message
              error={error}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </Message>
          )}
        </Form>
        <Image2 
          src={image2} 
          alt="" 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        />
      </Inner>
    </Wrapper>
  );
};

export default ForgotPassword;