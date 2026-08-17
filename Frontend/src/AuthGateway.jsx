import { useState } from 'react';
import { Wallet, Lock, User, Mail, ArrowRight } from 'lucide-react';

function AuthGateway({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { username, password } : { username, password, email };

    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (isLogin) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem('vault_token', data.token);
            onAuthSuccess();
          } else {
            setErrorMessage('Authentication token was missing in server response.');
          }
        } else {
          alert('Account registered successfully. Please sign in.');
          setIsLogin(true);
          setPassword('');
        }
      } else {
        const text = await response.text();
        setErrorMessage(text || 'Invalid username or password.');
      }
    } catch (err) {
      setErrorMessage('Unable to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0b1120', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '400px', padding: '36px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '10px', borderRadius: '12px' }}>
            <Wallet size={24} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.5px' }}>FinanceOS</span>
        </div>

        <h3 style={{ margin: '0 0 6px 0', textAlign: 'center', color: '#f8fafc', fontSize: '18px', fontWeight: '600' }}>
          {isLogin ? 'Sign in to your account' : 'Create an account'}
        </h3>
        <p style={{ margin: '0 0 24px 0', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          {isLogin ? 'Access your financial intelligence dashboard' : 'Start tracking institutional-grade financial analytics'}
        </p>

        {errorMessage && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 36px', boxSizing: 'border-box', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                placeholder="Enter username"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', boxSizing: 'border-box', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                  placeholder="name@company.com"
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
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

          <button
            type="submit"
            disabled={isLoading}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '11px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            {!isLoading && <ArrowRight size={15} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); }}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AuthGateway;