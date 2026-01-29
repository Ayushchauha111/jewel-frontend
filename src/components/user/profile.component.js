import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../../service/auth.service";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import ProfileService from "../../service/profile.service";
import DailyChallengeService from "../../service/dailyChallenge.service";
import AllActiveTypingCourses from "../course/AllActiveTypingCourses";
import TypingInsights from "../features/TypogramAI/TypingInsights";
import ConfigService from "../../service/config.service";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeInOut" } },
};

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #050507 0%, #0d0d1a 50%, #1a1a3e 100%);
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem;
  padding-top: 100px;
  box-sizing: border-box;
  margin: 0;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 40%);
    pointer-events: none;
    z-index: -1;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: 80px;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    padding-top: 70px;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  
  h3 {
    font-size: 2.5rem;
    background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1.25rem;
    h3 {
      font-size: 1.75rem;
    }
  }
`;

const ProfileCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.9) 0%, rgba(15, 15, 30, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  z-index: 1;

  p {
    font-size: 1.1rem;
    margin: 0.75rem 0;
    color: rgba(255, 255, 255, 0.7);
    word-break: break-word;
    text-align: center;
  }
  strong {
    color: #a855f7;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    width: 100%;
    border-radius: 16px;

    p {
      font-size: 0.95rem;
      margin: 0.5rem 0;
    }
  }
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  position: relative;
  border: 3px solid rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.2);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
  }
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  margin: 1.5rem 0;

  @media (max-width: 480px) {
    gap: 0.5rem;
    margin: 1rem 0;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || 'rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%'});
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  color: white;
  backdrop-filter: blur(10px);
  
  .value {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: #a855f7;
  }
  
  .label {
    font-size: 0.8rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 0.5rem;
    border-radius: 10px;

    .value {
      font-size: 1.25rem;
    }

    .label {
      font-size: 0.65rem;
      letter-spacing: 0.3px;
    }
  }
`;

const Profile = () => {
  const [redirect, setRedirect] = useState(null);
  const [userReady, setUserReady] = useState(false);
  const [file, setFile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(true); // Default to true for backward compatibility
  const [currentUser, setCurrentUser] = useState({
    username: "",
    accessToken: "",
    id: "",
    email: "",
    roles: [],
    profileImageUrl: "",
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 100 * 1024; // 100KB

    if (!validTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Please upload a JPEG, PNG, or GIF image.");
      return;
    }

    if (selectedFile.size > maxSize) {
      alert("File size is too large. Please upload an image smaller than 100KB.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }
    try {
      await ProfileService.uploadProfileImage(currentUser.id, file);
      const updatedUser = await ProfileService.getUser(currentUser.id);
      setCurrentUser({
        ...currentUser,
        profileImageUrl: updatedUser.data.data.profileImageUrl,
      });
      AuthService.updateCurrentUserProfile(updatedUser.data.data.profileImageUrl);
      setFile(null);
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
  };

  const PROFILE_IMAGE_BASE_URL = process.env.REACT_APP_PROFILE_IMAGE_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      const user = AuthService.getCurrentUser();
      if (!user) {
        setRedirect("/home");
      } else {
        setCurrentUser(user);
        setUserReady(true);
        
        // Fetch user stats (XP, Level, Streak)
        try {
          const streakResponse = await DailyChallengeService.getUserStreak();
          setUserStats(streakResponse.data);
        } catch (error) {
          console.error("Error fetching user stats:", error);
        }
        
        // Check if AI features are enabled
        try {
          const configResponse = await ConfigService.isAiEnabled();
          if (configResponse.data && configResponse.data.success) {
            setAiEnabled(configResponse.data.data);
          }
        } catch (error) {
          console.error("Error fetching AI config:", error);
          // Default to enabled if config fetch fails
          setAiEnabled(true);
        }
      }
    };

    fetchUser();
  }, []);

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <Container
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <AnimatePresence>
        {userReady && (
          <ProfileCard key="profile-card">
            <Header>
              <h3>
                <strong>{currentUser.username}</strong>
              </h3>
            </Header>
            <ProfileImage>
              <img
                src={
                  currentUser.profileImageUrl
                    ? PROFILE_IMAGE_BASE_URL + currentUser.profileImageUrl
                    : `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`
                }
                alt="Profile"
              />
              <input type="file" onChange={handleFileChange} />
            </ProfileImage>
            {file && <UploadButton onClick={handleUpload}>Upload</UploadButton>}
            <p>
              <strong>UserName:</strong> {currentUser.username}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
            
            {/* User Stats */}
            {userStats && (
              <StatsGrid>
                <StatCard gradient="#ffd700 0%, #ff9500 100%">
                  <div className="value">{userStats.totalXp?.toLocaleString() || 0}</div>
                  <div className="label">Total XP</div>
                </StatCard>
                <StatCard gradient="#10b981 0%, #059669 100%">
                  <div className="value">Lv.{userStats.level || 1}</div>
                  <div className="label">Level</div>
                </StatCard>
                <StatCard gradient="#ef4444 0%, #dc2626 100%">
                  <div className="value">🔥 {userStats.currentStreak || 0}</div>
                  <div className="label">Day Streak</div>
                </StatCard>
              </StatsGrid>
            )}
          </ProfileCard>
        )}
      </AnimatePresence>
      <AllActiveTypingCourses></AllActiveTypingCourses>
      {userReady && currentUser.id && aiEnabled && (
        <TypingInsights userId={currentUser.id} />
      )}
    </Container>
  );
};

export default Profile;