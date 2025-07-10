import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Modal from '../Common/Modal';
import MenuDrawer from '../Common/MenuDrawer';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

const Header = forwardRef((props, ref) => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [blink, setBlink] = useState(false);

  useImperativeHandle(ref, () => ({
    startBlink: () => setBlink(true),
    stopBlink: () => setBlink(false),
  }));

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setAuthenticated(!!token);
      if (token) {
        const payload = parseJwt(token);
        setUsername(payload?.username || null);
      } else {
        setUsername(null);
      }
    };
    checkAuth();
    // Listen for storage changes (cross-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token') checkAuth();
    };
    window.addEventListener('storage', handleStorage);
    // Optionally, poll every second for local changes
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Remove blinking after 4 seconds automatically
  useEffect(() => {
    if (blink) {
      const timeout = setTimeout(() => setBlink(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [blink]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md rounded-lg shadow-xl px-8 py-3 flex items-center border border-gray-200 max-w-[90vw] w-[800px] min-w-[320px] justify-between">
      {/* App Logo/Name on the left */}
      <div className="flex items-center font-extrabold text-xl text-black-300 tracking-tight select-none min-w-[200px]">
        <span>Route Optimization</span>
      </div>
      {/* Navigation Links in the center */}
      <nav className="flex-1 flex justify-center gap-6 text-base font-medium text-gray-700">
        <a href="/" className="hover:text-blue-600 transition">Home</a>
        <a href="/about" className="hover:text-blue-600 transition">About</a>
        <a href="/history" className="hover:text-blue-600 transition">History</a>
      </nav>
      {/* Auth button or profile button on the right */}
      {!authenticated ? (
        <div className="ml-6">
          <Link
            to="/login"
            className={`px-5 py-2 rounded-lg text-black font-semibold hover:bg-black hover:text-white transition ${blink ? 'animate-pulse' : ''}`}
            onClick={() => setBlink(false)}
          >
            Login / Sign Up
          </Link>
        </div>
      ) : (
        <div className="ml-6">
          <ProfileMenu />
        </div>
      )}
    </header>
  );
});

export default Header; 