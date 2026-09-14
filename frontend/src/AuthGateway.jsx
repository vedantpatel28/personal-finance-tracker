import { useState } from 'react';
import { Wallet, Lock, User, Mail, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function AuthGateway({ onAuthSuccess }) {
  // Modes: 'login' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [infoMessage, setInfoMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = () => {
    setErrorMessage('');
    setInfoMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim()
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            localStorage.setItem('vault_token', data.token);
            onAuthSuccess();
          }
        } else {
          const errText = await res.text();
          setErrorMessage(errText || 'Invalid username or password.');
        }
      } else if (mode === 'register') {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim(),
            email: email.trim().toLowerCase()
          })
        });
        if (res.ok) {
          setInfoMessage('Account created successfully! Please sign in.');
          setMode('login');
          setPassword('');
        } else {
          const errText = await res.text();
          setErrorMessage(errText || 'Registration failed.');
        }
      } else if (mode === 'forgot') {
        const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() })
        });
        const data = await res.json();
        if (res.ok) {
          setInfoMessage(data.message || 'Verification code sent to your email.');
          setMode('reset');
        } else {
          setErrorMessage(typeof data === 'string' ? data : 'Failed to dispatch verification code.');
        }
      } else if (mode === 'reset') {
        const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken.trim(),
            newPassword: newPassword.trim()
          })
        });

        if (res.ok) {
          // Pre-fill username with the email used during reset so the user can immediately log in
          setUsername(email.trim().toLowerCase());
          setPassword('');
          setResetToken('');
          setNewPassword('');
          setInfoMessage('Password updated successfully! Please sign in below.');
          setMode('login');
        } else {
          const errText = await res.text();
          setErrorMessage(errText || 'Failed to reset password.');
        }
      }
    } catch (err) {
      setErrorMessage('Unable to communicate with the server. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0b1120', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '10px', borderRadius: '12px' }}>
            <Wallet size={22} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>FinanceOS</span>
        </div>

        <h3 style={{ margin: '0 0 6px 0', textAlign: 'center', color: '#f8fafc', fontSize: '17px', fontWeight: '600' }}>
          {mode === 'login' && 'Sign in to your account'}
          {mode === 'register' && 'Create your account'}
          {mode === 'forgot' && 'Forgot Password'}
          {mode === 'reset' && 'Enter Verification Code'}
        </h3>

        <p style={{ margin: '0 0 20px 0', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          {mode === 'login' && 'Enter your username or email and password'}
          {mode === 'register' && 'Track custom accounts and financial trajectory'}
          {mode === 'forgot' && 'We will send a 6-digit verification code to your email'}
          {mode === 'reset' && `Check your inbox at ${email} for the 6-digit code`}
        </p>

        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {(mode === 'login' || mode === 'register') && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>
                {mode === 'login' ? 'Username or Email' : 'Username'}
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', boxSizing: 'border-box', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  placeholder={mode === 'login' ? "Enter username or email" : "Choose username"}
                />
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'forgot') && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Registered Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', boxSizing: 'border-box', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  placeholder="name@example.com"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#94a3b8' }}>Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => { setMode('forgot'); clearMessages(); }} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '11px', cursor: 'pointer' }}>
                    Forgot?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', boxSizing: 'border-box', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>6-Digit Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', boxSizing: 'border-box', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', letterSpacing: '4px', textAlign: 'center', outline: 'none' }}
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', boxSizing: 'border-box', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '11px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Code' : 'Update Password'}
            {!isLoading && <ArrowRight size={15} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          {mode === 'login' && (
            <button onClick={() => { setMode('register'); clearMessages(); }} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '12px', cursor: 'pointer' }}>
              Don't have an account? Sign Up
            </button>
          )}
          {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
            <button onClick={() => { setMode('login'); clearMessages(); }} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '12px', cursor: 'pointer' }}>
              Back to Sign In
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default AuthGateway;