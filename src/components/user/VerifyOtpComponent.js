import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OtpService from "../../service/otp.service";
import styled from "styled-components";
import { motion } from "framer-motion";

// Styled Components
const Container = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  background: linear-gradient(145deg, #0f0c29, #302b63);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  margin: 5rem auto;
  color: #fff;
`;

const Input = styled(motion.input)`
  padding: 0.75rem;
  margin: 0.5rem;
  border: 1px solid #00ffcc;
  border-radius: 10px;
  width: 80%;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #00ffcc;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00ccaa;
    box-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 2rem;
  margin-top: 1rem;
  background: linear-gradient(145deg, #00ffcc, #00ccaa);
  color: #0f0c29;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(145deg, #00ccaa, #00ffcc);
    transform: scale(1.05);
  }
`;

const Message = styled(motion.p)`
  margin-top: 1rem;
  font-size: 0.9rem;
`;

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const inputVariants = {
  hover: { scale: 1.02 },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  const handleVerifyOtp = async () => {
    try {
      const response = await OtpService.verifyOtp(email, otp);
      setMessage(response.data.message);
      navigate(`/reset-password?email=${email}`, { state: { otp } }); // Redirect to Reset Password
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || "Invalid OTP.");
    }
  };

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>Verify OTP</h2>
      <p>Enter the OTP sent to your email</p>
      <Input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        variants={inputVariants}
        whileHover="hover"
      />
      <Button
        onClick={handleVerifyOtp}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        Verify OTP
      </Button>
      {message && (
        <Message style={{ color: error ? "#ff4d4d" : "#00ffcc" }}>
          {message}
        </Message>
      )}
    </Container>
  );
};

export default VerifyOtp;