import React, { Component } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import AuthService from "../../service/auth.service";
import { Navigate } from "react-router-dom";
import { withRouter } from '../common/with-router';
import { FcGoogle } from "react-icons/fc";
import CustomerNav from "../customer/CustomerNav";

// Gold & white jewellery theme (matches CustomerHome / GangaJewellers)
const GOLD = '#a68b5b';
const GOLD_DARK = '#8e7340';
const CREAM = '#faf9f6';
const CREAM_SOFT = '#f9f7f2';
const TEXT = '#2c2c2c';
const TEXT_MUTED = '#5c5c5c';

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${CREAM};
  margin: 0;
  padding: 2rem 20px 40px;
  box-sizing: border-box;
  font-family: 'Playfair Display', Georgia, serif;

  @media (max-width: 768px) {
    padding: 1.5rem 15px 30px;
    align-items: flex-start;
  }
`;

const Inner = styled.div`
  position: relative;
  width: 435px;
  z-index: 1;
  
  @media (max-width: 991px) {
    width: 400px;
  }
  
  @media (max-width: 767px) {
    width: 100%;
    padding: 0 15px;
  }
`;

const Form = styled(motion.form)`
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 9;
  padding: 48px 44px 40px;
  background: #fff;
  border: 1px solid rgba(166, 139, 91, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(166, 139, 91, 0.12), 0 1px 0 rgba(166, 139, 91, 0.08);
  
  @media (max-width: 767px) {
    padding: 36px 24px 32px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 28px 20px 24px;
  }
`;

const Title = styled.h3`
  font-family: 'Playfair Display', Georgia, serif;
  text-transform: uppercase;
  font-size: 26px;
  font-weight: 600;
  color: ${GOLD_DARK};
  letter-spacing: 3px;
  text-align: center;
  margin-bottom: 2rem;
  
  @media (max-width: 767px) {
    font-size: 22px;
    margin-bottom: 1.5rem;
  }
`;

const FormHolder = styled.div`
  position: relative;
  margin-bottom: 20px;
  
  @media (max-width: 767px) {
    margin-bottom: 16px;
  }
`;

const Icon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: ${GOLD};
  
  @media (max-width: 767px) {
    font-size: 14px;
  }
`;

const InputField = styled.input`
  border: 1px solid rgba(166, 139, 91, 0.35);
  border-radius: 10px;
  display: block;
  width: 100%;
  height: 52px;
  background: ${CREAM_SOFT};
  padding: 0 20px 0 48px;
  color: ${TEXT};
  font-size: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &::placeholder {
    color: ${TEXT_MUTED};
    font-size: 14px;
  }
  
  &:focus {
    border-color: ${GOLD};
    outline: none;
    box-shadow: 0 0 0 3px rgba(166, 139, 91, 0.15);
  }
  
  @media (max-width: 767px) {
    height: 48px;
    font-size: 14px;
  }
`;

const Button = styled.button`
  border: none;
  width: 100%;
  height: 52px;
  margin-top: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${GOLD};
  color: #fff;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 2px;
  border-radius: 10px;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 12px rgba(166, 139, 91, 0.3);
  
  &:hover {
    background: ${GOLD_DARK};
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(166, 139, 91, 0.35);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 767px) {
    height: 48px;
    margin-top: 22px;
    font-size: 13px;
  }
`;

const Message = styled.div`
  color: #b91c1c;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  padding: 12px;
  background: rgba(185, 28, 28, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(185, 28, 28, 0.2);
  
  @media (max-width: 767px) {
    font-size: 0.8rem;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(166, 139, 91, 0.25);
  }
  
  span {
    padding: 0 14px;
    color: ${TEXT_MUTED};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const GoogleButton = styled.button`
  border: 1px solid rgba(166, 139, 91, 0.4);
  width: 100%;
  height: 52px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #fff;
  color: ${TEXT};
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.5px;
  transition: background 0.2s, border-color 0.2s;
  border-radius: 10px;
  
  &:hover {
    background: ${CREAM_SOFT};
    border-color: ${GOLD};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 767px) {
    height: 48px;
    font-size: 14px;
  }
`;

// Google Client ID - Replace with your actual client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

class Login extends Component {
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    this.googleButtonRef = React.createRef();
    this.state = {
      username: "",
      password: "",
      loading: false,
      googleLoading: false,
      message: "",
      googleReady: false
    };
  }

  componentDidMount() {
    // Load Google Sign-In SDK
    this.loadGoogleScript();
  }

  loadGoogleScript() {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured');
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      this.initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeGoogle();
    };
    document.head.appendChild(script);
  }

  initializeGoogle() {
    // Wait for google to be available
    const checkGoogle = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogle);
        
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: this.handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        if (this.googleButtonRef.current) {
          const containerWidth = Math.min(this.googleButtonRef.current.offsetWidth || 280, 320);
          window.google.accounts.id.renderButton(
            this.googleButtonRef.current,
            { 
              theme: 'outline', 
              size: 'large', 
              width: containerWidth,
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left'
            }
          );
          this.setState({ googleReady: true });
        }
      }
    }, 100);

    // Clear interval after 5 seconds if not loaded
    setTimeout(() => clearInterval(checkGoogle), 5000);
  }

  handleGoogleLogin(response) {
    if (response.credential) {
      this.setState({ googleLoading: true, message: "" });
      
      AuthService.googleAuth(response.credential).then(
        (userData) => {
          // Check user roles to determine redirect
          // Backend returns roles as array of strings like ["ROLE_ADMIN", "ROLE_USER"]
          const roles = userData.roles || [];
          const isAdmin = roles.some(role => 
            role === 'ROLE_ADMIN' || role === 'ADMIN' || role.includes('ADMIN')
          );
          
          if (isAdmin) {
            this.props.router.navigate("/admin", { replace: true });
          } else {
            this.props.router.navigate("/", { replace: true });
          }
          window.location.reload();
        },
        error => {
          const resMessage = error.response?.data?.message || error.message || "Google sign-in failed";
          this.setState({ googleLoading: false, message: resMessage });
        }
      );
    } else {
      this.setState({ message: "Google sign-in was cancelled" });
    }
  }

  handleLogin(e) {
    e.preventDefault();
    this.setState({ loading: true, message: "" });

    AuthService.login(this.state.username, this.state.password).then(
      (response) => {
        // Check user roles to determine redirect
        // Backend returns roles as array of strings like ["ROLE_ADMIN", "ROLE_USER"]
        const roles = response.roles || [];
        const isAdmin = roles.some(role => 
          role === 'ROLE_ADMIN' || role === 'ADMIN' || role.includes('ADMIN')
        );
        
        if (isAdmin) {
          this.props.router.navigate("/admin", { replace: true });
        } else {
          this.props.router.navigate("/", { replace: true });
        }
        window.location.reload();
      },
      error => {
        const resMessage = error.response?.data?.message || error.message || error.toString();
        this.setState({ loading: false, message: resMessage });
      }
    );
  }

  render() {
    // If already logged in, redirect based on role
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const roles = currentUser.roles || [];
      const isAdmin = roles.some(role => 
        role === 'ROLE_ADMIN' || role === 'ADMIN' || (typeof role === 'string' && role.includes('ADMIN'))
      );
      return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
    }

    return (
      <>
        <CustomerNav cartCount={0} />
        <Wrapper>
          <Inner>
          <Form
            onSubmit={this.handleLogin}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <Title>Login</Title>
            
            <FormHolder>
              <Icon className="lnr lnr-user" />
              <InputField
                type="text"
                placeholder="Username"
                value={this.state.username}
                onChange={e => this.setState({ username: e.target.value })}
                required
              />
            </FormHolder>

            <FormHolder>
              <Icon className="lnr lnr-lock" />
              <InputField
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={e => this.setState({ password: e.target.value })}
                required
              />
            </FormHolder>

            <Button type="submit" disabled={this.state.loading}>
              <span>{this.state.loading ? "Logging in..." : "Login"}</span>
            </Button>

            <Divider>
              <span>OR</span>
            </Divider>

            {/* Google Sign-In Button Container */}
            {!this.state.googleReady && (
              <GoogleButton type="button" disabled style={{ marginBottom: '10px' }}>
                <FcGoogle size={22} />
                Loading Google...
              </GoogleButton>
            )}
            <div 
              ref={this.googleButtonRef}
              style={{ 
                display: this.state.googleReady ? 'flex' : 'none', 
                justifyContent: 'center',
                minHeight: '44px',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            />
            
            {this.state.googleLoading && (
              <div style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
                Signing in with Google...
              </div>
            )}

            <Button 
              type="button"
              onClick={() => this.props.router.navigate("/forgot-password")}
              style={{ marginTop: '15px' }}
            >
              <span>Forgot Password?</span>
            </Button>

            {this.state.message && (
              <Message>{this.state.message}</Message>
            )}
          </Form>
          </Inner>
        </Wrapper>
      </>
    );
  }
}

export default withRouter(Login);