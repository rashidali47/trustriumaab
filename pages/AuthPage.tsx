
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import { Mail, Key, LogIn, UserPlus, Phone, User as UserIcon, Eye, EyeOff, AtSign, Lock, Gift, ArrowRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { COUNTRIES } from '../lib/countries';
import { db, auth } from "../lib/firebase";

const TrustriumLogo = ({ className }: { className?: string }) => (
    <img src="https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png" alt="Trustrium Logo" className={className} />
);

// Simple Google Icon SVG
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isSetupView, setIsSetupView] = useState(false);
  const [isForgotPassView, setIsForgotPassView] = useState(false);
  
  // For Password Reset Flow
  const [resetStep, setResetStep] = useState<'email' | 'code_new_pass'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { isGuest, continueAsGuest, signup, attemptLogin, continueWithGoogle, completeGoogleSignup, resetPassword, confirmPasswordResetWithCode, emailSystemType } = useContext(UserContext);
  const { theme } = useContext(AppContext);

  useEffect(() => {
    const refCode = sessionStorage.getItem('trustrium-referral-code');
    if (refCode) {
        setReferralCode(refCode);
        // If user was directed via referral link, show signup by default unless setup mode
        if (!isSetupView) setIsLoginView(false); 
    }
  }, [isSetupView]);

  // Pre-fill name from Google auth if available in auth.currentUser
  useEffect(() => {
    if (isSetupView && auth.currentUser?.displayName) {
        setFullName(auth.currentUser.displayName);
    }
  }, [isSetupView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (isForgotPassView) {
        // STEP 1: Send Reset Email
        if (resetStep === 'email') {
            if (!email) {
                setError('Please enter your email address.');
                setIsLoading(false);
                return;
            }
            const result = await resetPassword(email);
            if (result === 'SUCCESS') {
                if (emailSystemType === 'link') {
                    setSuccessMessage('Password reset link sent! Please check your inbox.');
                    // For link system, we don't go to step 2
                } else {
                    setSuccessMessage('Verification code sent! Check your email inbox.');
                    setResetStep('code_new_pass'); 
                }
            } else {
                setError('Failed to send reset link. Please check the email address.');
            }
        } 
        // STEP 2: Confirm Code & Reset Password (ONLY for Code System)
        else if (resetStep === 'code_new_pass') {
             if (!resetCode || !newPassword) {
                setError('Please enter the code and your new password.');
                setIsLoading(false);
                return;
            }
            const result = await confirmPasswordResetWithCode(email, resetCode, newPassword);
            if (result === 'SUCCESS') {
                setSuccessMessage('Password reset successfully! You can now log in.');
                setTimeout(() => {
                     switchView(); // Go to login
                }, 2000);
            } else if (result === 'INVALID_CODE') {
                setError('Invalid code. Please try again.');
            } else {
                setError('Failed to reset password. Please try again.');
            }
        }
        setIsLoading(false);
        return;
    } 

    if (isSetupView) {
       // Handle Google Setup completion
       if (!/^\d{4}$/.test(pin)) {
        setError('PIN must be exactly 4 digits.');
        setIsLoading(false);
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match.');
        setIsLoading(false);
        return;
      }
      if (fullName && username && phoneNumber && pin) {
          const result = await completeGoogleSignup(
              { name: fullName, username, walletPin: pin, phone: { countryCode, number: phoneNumber } },
              referralCode || null
          );
          
           if (result !== 'SUCCESS') {
              if (result === 'USERNAME_EXISTS') {
                  setError('This username is already taken.');
              } else {
                  setError('An unknown error occurred. Please try again.');
              }
           } else {
               // Success handled by auth state listener redirect
               sessionStorage.removeItem('trustrium-referral-code');
           }
      } else {
          setError('Please fill all required fields.');
      }

    } else if (isLoginView) {
      // Handle standard login
      const result = await attemptLogin(email, password);
      if (result === 'INVALID_CREDENTIALS') {
        setError('Invalid credentials. Please try again.');
      } else if (result !== 'SUCCESS') {
        setError('An error occurred. Please try again.');
      }
    } else { 
      // Handle standard signup
      if (!/^\d{4}$/.test(pin)) {
        setError('PIN must be exactly 4 digits.');
        setIsLoading(false);
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match.');
        setIsLoading(false);
        return;
      }
      if (email && fullName && username && phoneNumber && password && pin) {
        const result = await signup(
          { email, name: fullName, username, phone: { countryCode, number: phoneNumber }, walletPin: pin },
          password, 
          referralCode || null
        );
        
        if (result !== 'SUCCESS') {
            if (result === 'EMAIL_EXISTS') {
                setError('An account with this email already exists.');
            } else if (result === 'USERNAME_EXISTS') {
                setError('This username is already taken.');
            } else if (result === 'WEAK_PASSWORD') {
                setError('Password is too weak. Please use at least 6 characters.');
            } else if (result === 'INVALID_EMAIL') {
                setError('Please enter a valid email address.');
            } else { 
                setError('An unknown error occurred. Please try again.');
            }
        } else if (result === 'SUCCESS') {
            sessionStorage.removeItem('trustrium-referral-code');
        }
      } else {
        setError('Please fill all required fields for signup.');
      }
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
      setError('');
      setIsLoading(true);
      const result = await continueWithGoogle();
      setIsLoading(false);

      if (result === 'NEEDS_SETUP') {
          setIsSetupView(true);
      } else if (result === 'UNAUTHORIZED_DOMAIN') {
          setError(`Domain (${window.location.hostname}) is not authorized. Please add it to Authorized Domains in Firebase Console.`);
      } else if (result === 'FAILED') {
          setError('Google Sign-In failed. Please try again.');
      }
  }

  const switchView = () => {
    setIsLoginView(!isLoginView);
    setIsForgotPassView(false);
    setResetStep('email'); // Reset reset flow
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setFullName('');
    setUsername('');
    setPhoneNumber('');
    setPin('');
    setConfirmPin('');
    setResetCode('');
    setNewPassword('');
  };
  
  const toggleForgotPass = () => {
      setIsForgotPassView(!isForgotPassView);
      setResetStep('email');
      setError('');
      setSuccessMessage('');
  }

  // Render Setup View (Complete Profile after Google Auth)
  if (isSetupView) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-gray-900 to-brand-gray-950 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-brand-gray-900 rounded-2xl shadow-2xl shadow-brand-blue/20 border border-brand-gray-800">
            <div className="text-center">
                <TrustriumLogo className="w-24 h-24 mx-auto mb-4"/>
                <h2 className="text-3xl font-bold text-white">Complete Setup</h2>
                <p className="mt-2 text-brand-gray-400">Just a few more details to finish your account.</p>
            </div>

            {error && <p className="text-sm text-center text-red-500 bg-red-500/10 p-2 rounded-lg">{error}</p>}

            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Setup form fields... same as before */}
                 <div className="relative">
                    <UserIcon className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                    <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                </div>
                <div className="relative">
                    <AtSign className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                </div>
                
                <div className="relative flex">
                    <div className="absolute inset-y-0 left-0 flex items-center">
                        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="py-3 pl-3 pr-8 text-white bg-brand-gray-800 border-r border-brand-gray-700 rounded-l-lg focus:ring-2 focus:ring-brand-blue focus:outline-none appearance-none max-w-[100px]">
                            {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.code} {c.dial_code}</option>)}
                        </select>
                    </div>
                    <Phone className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-[110px]" />
                    <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full py-3 pl-[140px] pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                </div>

                <div className="relative">
                    <Gift className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                    <input type="text" placeholder="Referral Code (Optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toLowerCase())} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <Lock className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                        <input type="password" placeholder="4-Digit PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={4} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                        <input type="password" placeholder="Confirm PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} maxLength={4} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-gray-900 focus:ring-brand-blue transition-all duration-300 disabled:bg-brand-blue/50">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ArrowRight size={20}/>}
                    {isLoading ? 'Creating Account...' : 'Complete Setup'}
                </button>
            </form>
        </div>
        </div>
      )
  }

  // Standard Auth View
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-gray-900 to-brand-gray-950 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-brand-gray-900 rounded-2xl shadow-2xl shadow-brand-blue/20 border border-brand-gray-800">
        <div className="text-center">
            <TrustriumLogo className="w-24 h-24 mx-auto mb-4"/>
            <h2 className="text-4xl font-bold text-white">
              {isForgotPassView ? 'Reset Password' : (
                  <>Welcome to <span className="text-brand-blue-light">Trustrium</span></>
              )}
            </h2>
            <p className="mt-2 text-brand-gray-400">
              {isForgotPassView 
                ? (resetStep === 'email' 
                    ? (emailSystemType === 'link' ? 'Enter your email to receive a reset link' : 'Enter your email to receive a code') 
                    : 'Enter the code and new password') 
                : (isLoginView ? 'Sign in to start your journey' : 'Create an account to join us')}
            </p>
        </div>

        {error && <p className="text-sm text-center text-red-500 bg-red-500/10 p-2 rounded-lg">{error}</p>}
        {successMessage && <p className="text-sm text-center text-green-500 bg-green-500/10 p-2 rounded-lg">{successMessage}</p>}

        {!isForgotPassView && (
            <div className="space-y-4">
                <button 
                    onClick={handleGoogleSignIn}
                    type="button"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 py-3.5 font-semibold text-brand-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                >
                    <GoogleIcon className="w-5 h-5"/>
                    Continue with Google
                </button>

                <button 
                    id="guest-login-button"
                    onClick={continueAsGuest}
                    type="button"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 py-3.5 font-semibold text-white bg-brand-purple rounded-xl hover:bg-brand-purple-dark transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-purple/20"
                >
                    <LogIn className="w-5 h-5"/>
                    Visit as Guest
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-brand-gray-800"></div>
                    <span className="flex-shrink-0 mx-4 text-brand-gray-500 text-xs font-medium uppercase tracking-wider">OR CONTINUE WITH EMAIL</span>
                    <div className="flex-grow border-t border-brand-gray-800"></div>
                </div>
            </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLoginView && !isForgotPassView && (
            <>
              <div className="relative">
                <UserIcon className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
              </div>
              <div className="relative">
                <AtSign className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
              </div>
            </>
          )}
          
          {/* Email Input - Hidden in Step 2 of Reset */}
          {( !isForgotPassView || (isForgotPassView && resetStep === 'email') ) && (
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                required
                />
            </div>
          )}
          
          {/* Password Reset Step 2 Fields (Only for Code System) */}
          {isForgotPassView && resetStep === 'code_new_pass' && emailSystemType === 'code' && (
            <>
                <div className="relative">
                    <ShieldCheck className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                    <input
                    type="text"
                    placeholder="Verification Code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    required
                    />
                </div>
                <div className="relative">
                    <Key className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                    <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full py-3 pl-12 pr-12 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    required
                    />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-4 text-brand-gray-500 hover:text-white">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </>
          )}
          
          {!isForgotPassView && (
              <div className="relative">
                <Key className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 pl-12 pr-12 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-4 text-brand-gray-500 hover:text-white">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          )}

          {!isLoginView && !isForgotPassView && (
            <div className="relative flex">
                <div className="absolute inset-y-0 left-0 flex items-center">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="py-3 pl-3 pr-8 text-white bg-brand-gray-800 border-r border-brand-gray-700 rounded-l-lg focus:ring-2 focus:ring-brand-blue focus:outline-none appearance-none max-w-[100px]">
                        {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.code} {c.dial_code}</option>)}
                    </select>
                </div>
                <Phone className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-[110px]" />
                <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full py-3 pl-[140px] pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
            </div>
          )}
          
          {!isLoginView && !isForgotPassView && (
            <>
              <div className="relative">
                  <Gift className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                  <input type="text" placeholder="Referral Code (Optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toLowerCase())} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                  <input type="password" placeholder="4-Digit PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={4} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                </div>
                 <div className="relative">
                  <Lock className="absolute w-5 h-5 text-brand-gray-500 top-3.5 left-4" />
                  <input type="password" placeholder="Confirm PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} maxLength={4} className="w-full py-3 pl-12 pr-4 text-white bg-brand-gray-800 border border-brand-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none" required />
                </div>
              </div>
            </>
          )}

          {isLoginView && !isForgotPassView && (
              <div className="flex justify-end">
                  <button type="button" onClick={toggleForgotPass} className="text-sm text-brand-blue-light hover:underline">
                      Forgot Password?
                  </button>
              </div>
          )}
          
          {!isForgotPassView && (
            <>
                <p className="text-xs text-brand-gray-500 mt-2 text-center">
                    By clicking {isLoginView ? '"Sign In"' : '"Sign Up"'} you agree to the <a href="https://www.trustrium.com/legal" target="_blank" rel="noopener noreferrer" className="text-brand-blue-light hover:underline">Privacy Policy and Terms & Conditions</a>.
                </p>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-gray-900 focus:ring-brand-blue transition-all duration-300 disabled:bg-brand-blue/50 disabled:cursor-not-allowed"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isForgotPassView ? (resetStep === 'email' ? <Mail size={20}/> : <Key size={20}/>) : (isLoginView ? <LogIn size={20}/> : <UserPlus size={20}/>))}
            {isLoading ? 'Processing...' : (isForgotPassView ? (resetStep === 'email' ? (emailSystemType === 'link' ? 'Send Reset Link' : 'Send Reset Code') : 'Reset Password') : (isLoginView ? 'Sign In' : 'Sign Up'))}
          </button>
        </form>
        
        <div className="text-center">
            {isForgotPassView ? (
                <button onClick={toggleForgotPass} className="text-sm text-brand-gray-500 hover:text-white flex items-center justify-center gap-1 mx-auto">
                   <ChevronLeft size={16} /> Back to Login
                </button>
            ) : (
                <p className="text-sm text-center text-brand-gray-500 pt-6">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button
                    onClick={switchView}
                    className="ml-2 font-medium text-brand-blue-light hover:underline"
                >
                    {isLoginView ? 'Sign Up' : 'Sign In'}
                </button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
