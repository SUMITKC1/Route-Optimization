import React, { useState, useRef, useEffect } from 'react';
import {
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword,
  uploadAvatar,
} from '../../services/userApi';
import Modal from '../Common/Modal';

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-400',
};

const ProfileMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string; avatar: string }>({ username: '', email: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfile();
        setUser(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Avatar fallback
  const getInitials = (name?: string) =>
    name && typeof name === 'string'
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : '';

  // Dummy handlers
  const handleLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Handle hover/focus for dropdown
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle avatar change
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      setError(null);
      try {
        const res = await uploadAvatar(file);
        setUser((prev) => ({ ...prev, avatar: res.avatar }));
      } catch (err: any) {
        setError(err.message || 'Failed to upload avatar');
      } finally {
        setLoading(false);
      }
    }
  };

  // Change handlers
  const handleUsernameChange = async (newUsername: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateUserProfile({ username: newUsername });
      setUser((prev) => ({ ...prev, username: res.username }));
      setShowUsernameModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };
  const handleEmailChange = async (newEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateUserProfile({ email: newEmail });
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      // Re-fetch user profile to ensure latest email is shown
      const updated = await fetchUserProfile();
      setUser(updated);
      setShowEmailModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordChange = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await changeUserPassword(oldPassword, newPassword);
      setShowPasswordModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = () => {
    window.location.href = '/history';
  };

  return (
    <div className="relative">
      {/* Profile Button (avatar only) */}
      <button
        ref={buttonRef}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 transition focus:outline-none"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={handleOpen}
        onFocus={handleOpen}
        aria-haspopup="true"
        aria-expanded={open}
        tabIndex={0}
      >
        <span className="relative inline-block w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-lg font-bold text-gray-700">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            user.username ? getInitials(user.username) : ''
          )}
        </span>
      </button>
      {/* Dropdown Menu (show on hover/click) */}
      {(open) && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-green-200 z-50 animate-fade-in overflow-hidden"
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          tabIndex={-1}
        >
          {/* User Info */}
          <div className="flex text-green-800 items-center gap-3 p-4 border-b border-green-100 bg-green-50">
            <span className="relative inline-block w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xl font-bold text-gray-700 group">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user.username ? getInitials(user.username) : ''
              )}
              {/* Edit (camera) icon overlay */}
              <button
                className="absolute top-1/2 left-1/2 w-9 h-9 flex items-center justify-center bg-black/70 hover:bg-black/90 rounded-full text-white opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200"
                style={{ transform: 'translate(-50%, -50%)' }}
                onClick={handleAvatarClick}
                tabIndex={0}
                aria-label="Change avatar"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l1.536 1.536M9 13a4 4 0 100-8 4 4 0 000 8zm0 0v1a4 4 0 004 4h1m-5-5h.01" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </span>
            <div className="flex-1">
              <div className="font-bold text-green-700 text-lg">{user.username}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
          {/* Menu Items */}
          <div className="py-2 bg-white">
            <MenuItem label="Change Username" onClick={() => setShowUsernameModal(true)} />
            <MenuItem label="Change Email" onClick={() => setShowEmailModal(true)} />
            <MenuItem label="Change Password" onClick={() => setShowPasswordModal(true)} />
            <MenuItem label="Logout" onClick={() => setShowLogoutModal(true)} danger />
          </div>
          {error && <div className="text-red-500 text-center text-sm py-2">{error}</div>}
        </div>
      )}
      {/* Modals for editing */}
      <EditUsernameModal
        open={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSave={handleUsernameChange}
        loading={loading}
        current={user.username}
      />
      <EditEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSave={handleEmailChange}
        loading={loading}
        current={user.email}
      />
      <EditPasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handlePasswordChange}
        loading={loading}
      />
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed z-[100] top-56 right-8 w-[320px] bg-white border border-green-200 rounded-2xl shadow-2xl animate-fade-in">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-black">Confirm Logout</h3>
            <p className="mb-4 text-gray-600">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-4">
              <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-black font-semibold" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Menu item component
const MenuItem: React.FC<{ label: string; onClick: () => void; danger?: boolean }> = ({ label, onClick, danger }) => (
  <button
    className={`w-full px-6 py-3 text-left text-base font-semibold rounded-lg transition focus:outline-none
      ${danger ? 'text-red-600 hover:bg-red-50' : 'text-green-800 hover:bg-green-50'}
      bg-white`}
    onClick={onClick}
    tabIndex={0}
  >
    {label}
  </button>
);

// Username modal
const EditUsernameModal: React.FC<{ open: boolean; onClose: () => void; onSave: (username: string) => void; loading: boolean; current: string }> = ({ open, onClose, onSave, loading, current }) => {
  const [value, setValue] = useState(current || '');
  useEffect(() => { setValue(current || ''); }, [current, open]);
  if (!open) return null;
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !(loading || !(value && value.trim()))) {
      onSave(value);
    }
  };
  return (
    <div className="fixed z-[100] top-20 right-8 w-[320px] bg-white border border-green-200 rounded-2xl shadow-2xl animate-fade-in">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-green-800">Change Username</h2>
        <input
          className="w-full border border-green-200 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={loading}
          onKeyDown={handleKeyDown}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-black font-semibold" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={() => onSave(value)} disabled={loading || !(value && value.trim())}>Save</button>
        </div>
      </div>
    </div>
  );
};
// Email modal
const EditEmailModal: React.FC<{ open: boolean; onClose: () => void; onSave: (email: string) => void; loading: boolean; current: string }> = ({ open, onClose, onSave, loading, current }) => {
  const [value, setValue] = useState(current || '');
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (open) {
      setValue(current || '');
      setTouched(false);
    }
  }, [current, open]);
  if (!open) return null;
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^ 0-\s@]+\.[^\s@]+$/.test(email) && email.endsWith('@gmail.com');
  const showError = touched && (!value || !isValidEmail(value));
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidEmail(value) && !loading) {
      onSave(value);
      setValue(''); // Reset after save
      setTouched(false);
    }
  };
  const handleClose = () => {
    setValue(current || '');
    setTouched(false);
    onClose();
  };
  return (
    <div className="fixed z-[100] top-32 right-8 w-[320px] bg-white border border-green-200 rounded-2xl shadow-2xl animate-fade-in">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-green-800">Change Email</h2>
        <input
          className={`w-full border ${showError ? 'border-red-400' : 'border-green-200'} rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400`}
          value={value}
          onChange={e => { setValue(e.target.value); setTouched(true); }}
          disabled={loading}
          onBlur={() => setTouched(true)}
          onKeyDown={handleKeyDown}
        />
        {showError && (
          <div className="text-red-500 text-xs mb-2">Please enter a valid Gmail address (must end with @gmail.com)</div>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-black font-semibold" onClick={handleClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={() => { onSave(value); setValue(''); setTouched(false); }} disabled={loading || !isValidEmail(value)}>Save</button>
        </div>
      </div>
    </div>
  );
};
// Password modal
const EditPasswordModal: React.FC<{ open: boolean; onClose: () => void; onSave: (oldPass: string, newPass: string) => void; loading: boolean }> = ({ open, onClose, onSave, loading }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  if (!open) return null;
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !(loading || !(oldPass && oldPass.trim()) || !(newPass && newPass.trim()))) {
      onSave(oldPass, newPass);
    }
  };
  return (
    <div className="fixed z-[100] top-44 right-8 w-[320px] bg-white border border-green-200 rounded-2xl shadow-2xl animate-fade-in">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-green-800">Change Password</h2>
        <input
          type="password"
          className="w-full border border-green-200 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Old Password"
          value={oldPass || ''}
          onChange={e => setOldPass(e.target.value)}
          disabled={loading}
          onKeyDown={handleKeyDown}
        />
        <input
          type="password"
          className="w-full border border-green-200 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="New Password"
          value={newPass || ''}
          onChange={e => setNewPass(e.target.value)}
          disabled={loading}
          onKeyDown={handleKeyDown}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-black font-semibold" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={() => onSave(oldPass, newPass)} disabled={loading || !(oldPass && oldPass.trim()) || !(newPass && newPass.trim())}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu; 