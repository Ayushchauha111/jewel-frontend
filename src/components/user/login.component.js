import React, { Component } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import AuthService from "../../service/auth.service";
import { Navigate } from "react-router-dom";
import { withRouter } from '../common/with-router';
import image1 from '../../assets/login/image-1.png';
import image2 from '../../assets/login/image-2.png';
import { FcGoogle } from "react-icons/fc";

// Styled Components
const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #050507 0%, #0d0d1a 50%, #1a1a3e 100%);
  margin: 0;
  padding: 100px 20px 40px;
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 40%);
    pointer-events: none;
    z-index: -1;
  }

  @media (max-width: 768px) {
    padding: 80px 15px 30px;
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

const Image1 = styled.img`
  position: absolute;
  bottom: -12px;
  left: -191px;
  z-index: 99;
  max-width: 200px;
  opacity: 0.8;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
  
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

const Image2 = styled.img`
  position: absolute;
  bottom: 0;
  right: -129px;
  max-width: 200px;
  opacity: 0.8;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
  
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
  max-width: 450px;
  position: relative;
  z-index: 9;
  padding: 50px 50px 40px;
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.95) 0%, rgba(15, 15, 30, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1);
  
  @media (max-width: 767px) {
    padding: 40px 25px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 30px 20px;
    border-radius: 12px;
  }
`;

const Title = styled.h3`
  text-transform: uppercase;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  text-align: center;
  margin-bottom: 40px;
  
  @media (max-width: 767px) {
    font-size: 22px;
    margin-bottom: 30px;
  }
`;

const FormHolder = styled.div`
  position: relative;
  margin-bottom: 24px;
  
  @media (max-width: 767px) {
    margin-bottom: 18px;
  }
`;

const Icon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: rgba(139, 92, 246, 0.7);
  
  @media (max-width: 767px) {
    font-size: 14px;
  }
`;

const InputField = styled.input`
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  display: block;
  width: 100%;
  height: 52px;
  background: rgba(255, 255, 255, 0.03);
  padding: 0 20px 0 48px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &::placeholder {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    border-color: rgba(139, 92, 246, 0.6);
    background: rgba(139, 92, 246, 0.05);
    outline: none;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
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
  margin-top: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: #fff;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 2px;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 767px) {
    height: 48px;
    margin-top: 24px;
    font-size: 14px;
  }
`;

const Message = styled.div`
  color: #f87171;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  padding: 12px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(248, 113, 113, 0.2);
  
  @media (max-width: 767px) {
    font-size: 0.8rem;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 28px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(139, 92, 246, 0.2);
  }
  
  span {
    padding: 0 15px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const GoogleButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  height: 52px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 1px;
  transition: all 0.3s;
  border-radius: 12px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
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
      <Wrapper>
        <Inner>
          <Image1 src={image1} alt="" />
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
          <Image2 src={image2} alt="" />
        </Inner>
      </Wrapper>
    );
  }
}

export default withRouter(Login);