import React, { Component } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import AuthService from "../../service/auth.service";
import ReferralService from "../../service/referral.service";
import image1 from '../../assets/login/image-1.png';
import image2 from '../../assets/login/image-2.png';
import { Navigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";

// Styled Components
const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #050507 0%, #0d0d1a 50%, #1a1a3e 100%);
  padding: 100px 20px 40px;
  margin: 0;
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
  width: 480px;
  z-index: 1;
  
  @media (max-width: 991px) {
    width: 420px;
  }
  
  @media (max-width: 767px) {
    width: 100%;
    padding: 0 20px;
  }
`;

const Image1 = styled(motion.img)`
  position: absolute;
  top: -50px;
  left: -150px;
  z-index: 1;
  max-width: 180px;
  opacity: 0.8;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
  
  @media (max-width: 767px) {
    max-width: 100px;
    left: -40px;
    top: -30px;
  }
`;

const Image2 = styled(motion.img)`
  position: absolute;
  bottom: -20px;
  right: -140px;
  z-index: 1;
  max-width: 180px;
  opacity: 0.8;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
  
  @media (max-width: 767px) {
    max-width: 100px;
    right: -30px;
    bottom: -10px;
  }
`;

const FormCard = styled(motion.div)`
  position: relative;
  z-index: 9;
  padding: 50px 50px 40px;
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.95) 0%, rgba(15, 15, 30, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1);
  width: 100%;
  max-width: 450px;
  
  @media (max-width: 767px) {
    padding: 40px 25px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 30px 20px;
    border-radius: 12px;
  }
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 2px;
  text-transform: uppercase;
  
  @media (max-width: 767px) {
    font-size: 22px;
    margin-bottom: 30px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const InputField = styled.input`
  width: 100%;
  padding: 14px 18px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: rgba(139, 92, 246, 0.6);
    background: rgba(139, 92, 246, 0.05);
    outline: none;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 767px) {
    padding: 12px 15px;
    font-size: 14px;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 767px) {
    padding: 12px;
    font-size: 14px;
  }
`;

const Message = styled(motion.div)`
  margin-top: 20px;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  font-size: 14px;
  background: ${props => props.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(248, 113, 113, 0.1)'};
  color: ${props => props.success ? '#10b981' : '#f87171'};
  border: 1px solid ${props => props.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)'};
  
  @media (max-width: 767px) {
    font-size: 13px;
    padding: 10px;
  }
`;

const DisposableWarning = styled(motion.div)`
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '⚠️';
    font-size: 14px;
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

const GoogleButton = styled(motion.button)`
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  padding: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 15px;
  border-radius: 12px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 767px) {
    padding: 12px;
    font-size: 14px;
  }
`;

// Google Client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Common disposable email domains for client-side check
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'throwaway.email', 'fakeinbox.com', 'getnada.com',
  'maildrop.cc', 'yopmail.com', 'trashmail.com', 'dispostable.com',
  'mailcatch.com', 'meltmail.com', 'sharklasers.com', 'spam4.me',
  'tempinbox.com', 'temporaryemail.net', 'mailnull.com', 'emailondeck.com',
  'getairmail.com', 'mailexpire.com', 'mailforspam.com', 'spamgourmet.com',
  'guerrillamail.org', 'guerrillamail.net', '10minmail.com', 'yopmail.fr',
  'tempmail.net', 'temp-mail.io', 'fakemailgenerator.com', 'mailnesia.com',
  'mohmal.com', 'burnermail.io', 'inboxkitten.com', '33mail.com'
]);

// Valid TLDs for checking fake domains
const VALID_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'in', 'us', 'uk', 'ca',
  'au', 'de', 'fr', 'jp', 'cn', 'ru', 'br', 'it', 'es', 'nl', 'se', 'no',
  'fi', 'dk', 'pl', 'cz', 'at', 'ch', 'be', 'ie', 'nz', 'sg', 'hk', 'kr',
  'tw', 'mx', 'ar', 'cl', 'za', 'ae', 'sa', 'il', 'tr', 'gr', 'pt', 'info',
  'biz', 'app', 'dev', 'page', 'blog', 'shop', 'online', 'site', 'tech',
  'cloud', 'email', 'live', 'me', 'tv', 'cc', 'ai', 'xyz'
]);

// Suspicious patterns in username
const SUSPICIOUS_PATTERNS = ['test', 'fake', 'spam', 'trash', 'temp', 'admin', 
  'administrator', 'user', 'demo', 'sample', 'example', 'dummy', 'asdf', 'qwerty'];

// Suspicious domain names
const SUSPICIOUS_DOMAIN_NAMES = ['ceo', 'cto', 'cfo', 'vip', 'boss', 'chief', 'owner'];

const isDisposableEmail = (email) => {
  if (!email || !email.includes('@')) return false;
  
  const parts = email.split('@');
  const localPart = parts[0]?.toLowerCase();
  const domain = parts[1]?.toLowerCase();
  
  // Check known disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  
  // Check for invalid TLD
  if (domain) {
    const tld = domain.split('.').pop();
    const domainName = domain.split('.')[0];
    
    // Invalid TLD (not in known list and longer than 2 chars)
    if (tld && tld.length > 2 && !VALID_TLDS.has(tld)) {
      return true;
    }
    
    // Very short suspicious domain name
    if (domainName && domainName.length <= 3 && SUSPICIOUS_DOMAIN_NAMES.includes(domainName)) {
      return true;
    }
  }
  
  // Check for suspicious patterns in username + bad domain combo
  let suspicionScore = 0;
  
  if (SUSPICIOUS_PATTERNS.some(p => localPart?.includes(p))) {
    suspicionScore++;
  }
  
  if (domain) {
    const tld = domain.split('.').pop();
    if (tld && tld.length > 2 && !VALID_TLDS.has(tld)) {
      suspicionScore += 2; // Invalid TLD is severe
    }
  }
  
  return suspicionScore >= 2;
};

// Animation Variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const buttonVariants = {
  hover: { scale: 1.03 },
  tap: { scale: 0.98 }
};

class Register extends Component {
  constructor(props) {
    super(props);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleGoogleSignUp = this.handleGoogleSignUp.bind(this);
    this.googleButtonRef = React.createRef();
    this.state = {
      username: "",
      email: "",
      password: "",
      successful: false,
      message: "",
      loading: false,
      googleLoading: false,
      googleReady: false,
      redirect: false,
      isDisposableEmail: false
    };
  }

  componentDidMount() {
    this.loadGoogleScript();
  }

  loadGoogleScript() {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      this.initializeGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initializeGoogle();
    document.head.appendChild(script);
  }

  initializeGoogle() {
    const checkGoogle = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogle);
        
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: this.handleGoogleSignUp,
          auto_select: false,
        });

        if (this.googleButtonRef.current) {
          const containerWidth = Math.min(this.googleButtonRef.current.offsetWidth || 280, 320);
          window.google.accounts.id.renderButton(
            this.googleButtonRef.current,
            { 
              theme: 'outline', 
              size: 'large', 
              width: containerWidth,
              text: 'signup_with',
              shape: 'rectangular',
            }
          );
          this.setState({ googleReady: true });
        }
      }
    }, 100);

    setTimeout(() => clearInterval(checkGoogle), 5000);
  }

  handleGoogleSignUp(response) {
    if (response.credential) {
      this.setState({ googleLoading: true, message: "" });
      
      AuthService.googleAuth(response.credential).then(
        () => {
          window.location.href = '/';
        },
        error => {
          const resMessage = error.response?.data?.message || error.message || "Google sign-up failed";
          this.setState({ googleLoading: false, message: resMessage });
        }
      );
    }
  }

  handleRegister(e) {
    e.preventDefault();
    
    // Client-side disposable email check
    if (isDisposableEmail(this.state.email)) {
      this.setState({
        message: "⚠️ Disposable or temporary email addresses are not allowed. Please use a valid email address.",
        successful: false,
        loading: false
      });
      return;
    }
    
    this.setState({ message: "", loading: true });

    AuthService.register(
      this.state.username,
      this.state.email,
      this.state.password
    ).then(
      response => {
        this.setState({
          message: response.data.message,
          successful: true,
          loading: false
        });
        
        // Track referral if there's a stored referral code
        const referralCode = ReferralService.getStoredReferralCode();
        if (referralCode) {
          ReferralService.trackReferral(referralCode, this.state.username)
            .then(() => {
              ReferralService.clearStoredReferralCode();
            })
            .catch(err => {
              // Silently fail - don't block registration
              console.log('Referral tracking failed:', err);
            });
        }
        
        // Set redirect after a delay
        setTimeout(() => {
          this.setState({ redirect: true });
        }, 2000); // 2 second delay before redirect
      },
      error => {
        const resMessage =
          (error.response?.data?.message) ||
          error.message ||
          error.toString();
        this.setState({
          successful: false,
          message: resMessage,
          loading: false
        });
      }
    );
  }

  render() {
    const { successful, loading, message, redirect } = this.state;

    // Redirect to login page if registration is successful and redirect is true
    if (redirect) {
      return <Navigate to="/login" />;
    }

    return (
      <Wrapper>
        <Inner>
          <Image1 
            src={image1} 
            alt="decoration" 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          />
          
          <FormCard
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Title>Sign Up</Title>
            
            <form onSubmit={this.handleRegister}>
              {!successful && (
                <>
                  <FormGroup>
                    <InputField
                      type="text"
                      placeholder="Username"
                      value={this.state.username}
                      onChange={e => this.setState({ username: e.target.value })}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <InputField
                      type="email"
                      placeholder="Email"
                      value={this.state.email}
                      onChange={e => this.setState({ 
                        email: e.target.value,
                        isDisposableEmail: isDisposableEmail(e.target.value)
                      })}
                      style={this.state.isDisposableEmail ? { borderColor: '#ffc107' } : {}}
                      required
                    />
                    {this.state.isDisposableEmail && (
                      <DisposableWarning
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        Temporary emails are not allowed
                      </DisposableWarning>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <InputField
                      type="password"
                      placeholder="Password"
                      value={this.state.password}
                      onChange={e => this.setState({ password: e.target.value })}
                      required
                    />
                  </FormGroup>

                  <Button
                    type="submit"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register"}
                  </Button>

                  <Divider>
                    <span>OR</span>
                  </Divider>

                  {/* Google Sign-Up Button Container */}
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
                      Signing up with Google...
                    </div>
                  )}
                </>
              )}

              {message && (
                <Message
                  success={successful}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {successful 
                    ? "Registration successful! Redirecting to login..."
                    : message}
                </Message>
              )}
            </form>
          </FormCard>

          <Image2 
            src={image2} 
            alt="decoration" 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          />
        </Inner>
      </Wrapper>
    );
  }
}

export default Register;