import React, { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import { AuthContext } from '../context/AuthContext';

const backendUrl = import.meta.env.VITE_API_URL;

export default function Login() {
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
        localStorage.setItem('name', data.name);
        localStorage.setItem('email', data.email);
        updateUser({ name: data.name, email: data.email });
        navigate('/');
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch {
      alert('Server error during login. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      const res = await fetch(`${backendUrl}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        login(token);
        localStorage.setItem('name', data.name);
        localStorage.setItem('email', data.email);
        updateUser({ name: data.name, email: data.email });
        navigate('/');
      } else {
        alert('Google login failed: ' + data.message);
      }
    } catch {
      alert('Server error during Google login. Please try again.');
    }
  };

  const handleGoogleLoginFailure = () => {
    alert('Google login failed. Please try again.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9fb' }}>
      <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.1)', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
        <h2>Login</h2>
        <form style={{ marginTop: '16px' }} onSubmit={handleEmailLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            style={inputStyle}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            style={inputStyle}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <hr style={{ margin: '24px 0' }} />
        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginFailure} />
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#8b5cf6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '1rem',
};
