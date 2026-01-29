import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 20px; /* Small hover area */
  z-index: 1000;

  &:hover {
    width: 100px; /* Expand hover area */
  }
`;

const NavContainer = styled.div`
  width: 100px;
  height: 100vh;
  background-color: #1e1e1e;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 10px;
  position: fixed;
  left: -100px;
  top: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  transition: left 0.3s ease;

  ${Wrapper}:hover & {
    left: 0;
  }
`;

const NavItem = styled(Link)`
  padding: 12px;
  color: white;
  text-decoration: none;
  font-size: 16px;
  border-radius: 5px;
  margin-bottom: 10px;

  &:hover {
    background-color: #333;
  }
`;

const SideNavigation = () => {
  return (
    <Wrapper>
      <NavContainer>
        <NavItem to="/">🏠 Home</NavItem>
        <NavItem to="/courses">📚 Courses</NavItem>
        <NavItem to="/add">➕ Add Course</NavItem>
        <NavItem to="/profile">👤 Profile</NavItem>
        <NavItem to="/settings">⚙️ Settings</NavItem>
      </NavContainer>
    </Wrapper>
  );
};

export default SideNavigation;