import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PasswordService from "../../service/password.service";
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

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");
  const otp = location.state?.otp || "";

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await PasswordService.resetPassword(email, password, otp);
      setMessage(response.data.message);
      navigate("/login"); // Redirect to login page
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>Reset Password</h2>
      <Input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variants={inputVariants}
        whileHover="hover"
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        variants={inputVariants}
        whileHover="hover"
      />
      <Button
        onClick={handleResetPassword}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        Reset Password
      </Button>
      {message && (
        <Message style={{ color: error ? "#ff4d4d" : "#00ffcc" }}>
          {message}
        </Message>
      )}
    </Container>
  );
};

export default ResetPassword;