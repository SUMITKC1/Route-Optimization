import React from 'react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose} />
      {/* Drawer */}
      <div className="relative w-64 h-full bg-white shadow-lg p-6 flex flex-col animate-slide-in-right">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close menu"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4">Menu</h3>
        <ul className="space-y-4">
          <li className="text-lg cursor-pointer hover:text-indigo-700">Settings (coming soon)</li>
          <li className="text-lg cursor-pointer hover:text-indigo-700">Help (coming soon)</li>
        </ul>
      </div>
    </div>
  );
};

export default MenuDrawer; 