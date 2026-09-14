import React, { useState, useEffect } from 'react';

function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [errStatus, setErrStatus] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Lifecycle hook executes instantly on view load to extract URL parameters
  useEffect(() => {
    // URLSearchParams scans the browser search bar string (e.g., ?token=abcdef123)
    const queryParameters = new URLSearchParams(window.location.search);
    const urlTokenValue = queryParameters.get('token');

    if (urlTokenValue) {
      setToken(urlTokenValue);
    } else {
      setErrStatus(true);
      setMsg("Error: Missing authorized security link clearance token.");
    }
  }, []);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrStatus(false);

    if (newPassword !== confirmPassword) {
      setErrStatus(true);
      setMsg("Error: Passwords do not match structural alignment.");
      return;
    }

    try {
      // Send parameters directly using standard URL query params required by our @RequestParam annotations
      const response = await fetch(`http://localhost:8080/api/auth/reset-password?token=${token}&newPassword=${encodeURIComponent(newPassword)}`, {
        method: 'POST'
      });

      const responseText = await response.text();

      if (response.ok) {
        setErrStatus(false);
        setMsg(responseText);
        setIsCompleted(true);
      } else {
        setErrStatus(true);
        setMsg(responseText);
      }
    } catch (error) {
      setErrStatus(true);
      setMsg("Communication loop fault: Recovery server is offline.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '360px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: '#0f172a' }}>Update Password</h2>
        <p style={{ textAlign: 'center', margin: '0 0 24px 0', fontSize: '14px', color: '#64748b' }}>Re-engineer your core cryptographic session credentials</p>

        {msg && (
          <div style={{ padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', backgroundColor: errStatus ? '#fef2f2' : '#f0fdf4', color: errStatus ? '#991b1b' : '#166534', border: `1px solid ${errStatus ? '#fca5a5' : '#86efac'}` }}>
            {msg}
          </div>
        )}

        {!isCompleted ? (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>New Password</label>
              <input type="password" required disabled={!token} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Confirm New Password</label>
              <input type="password" required disabled={!token} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>

            <button type="submit" disabled={!token} style={{ width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: token ? 'pointer' : 'not-allowed', opacity: token ? 1 : 0.6, marginTop: '8px' }}>
              Commit New Password
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button onClick={() => window.location.href = '/'} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
              Return to Login Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;