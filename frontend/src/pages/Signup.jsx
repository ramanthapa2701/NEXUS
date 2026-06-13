import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import '../App.css'; // Uses your core layout parameters

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/signup', { username, password });
      
      // Store verification session keys securely in client cache
      localStorage.setItem('nexus_user_token', response.data.token);
      localStorage.setItem('nexus_username', response.data.username);
      
      // Navigate to clean dashboard workspace view
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nexus-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section className="task-form-panel" style={{ width: '100%', maxWidth: '400px', margin: '0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Nexus Account</h2>
        
        {error && <p style={{ color: '#d32f2f', fontSize: '0.85rem', textAlign: 'center', background: '#ffebee', padding: '8px', borderRadius: '4px' }}>{error}</p>}
        
        <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="username">Choose Username</label>
            <input
              id="username"
              type="text"
              className="custom-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Secure Password</label>
            <input
              id="password"
              type="password"
              className="custom-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-task-btn" disabled={loading}>
            {loading ? 'Processing Registration...' : 'Register Account'}
          </button>
        </form>

        <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '15px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </section>
    </div>
  );
}

export default Signup;