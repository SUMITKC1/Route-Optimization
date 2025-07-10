import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup as signupApi, googleLogin } from '../services/authApi';
import { GoogleLogin } from '@react-oauth/google';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Email must be a valid Gmail address
    const isValidGmail = /^[^\s@]+@gmail\.com$/.test(email);
    if (!isValidGmail) {
      setError('Email must be a valid Gmail address (ending with @gmail.com)');
      setLoading(false);
      return;
    }
    try {
      const res = await signupApi(username, email, password);
      localStorage.setItem('token', res.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-animate">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl flex overflow-hidden">
        {/* Left: Signup Form */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-black mb-2">Create your account</h2>
          <p className="text-gray-500 mb-8">Hey Explorer, join the ride! Sign up to unlock clever route hacks, and time-saving shortcuts.</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-base bg-white placeholder-gray-400"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-base bg-white placeholder-gray-400"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-base bg-white placeholder-gray-400"
              disabled={loading}
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold text-lg shadow hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-4 text-gray-400 text-sm">or sign up with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex justify-center gap-4 mb-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  try {
                    const res = await googleLogin(credentialResponse.credential);
                    localStorage.setItem('token', res.token);
                    navigate('/');
                  } catch (err: any) {
                    setError(err.message || 'Google signup failed');
                  }
                }
              }}
              onError={() => {
                setError('Google signup failed');
              }}
              useOneTap
            />
          </div>
          <div className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-green-600 font-semibold hover:underline">Login</Link>
          </div>
        </div>
        {/* Right: Illustration and message */}
        <div className="hidden md:flex flex-1 relative bg-green-50 overflow-hidden">
          <img
            src="/images/signupPage.png"
            alt="Signup page illustration"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 