import React, { useEffect, useState, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { isLoggedIn, logout } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, clearUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn());
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    setUserLoggedIn(isLoggedIn());
  }, [location]);

  useEffect(() => {
    if (user) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
    }
  }, [user]);

  const getNavLinkClass = ({ isActive }) =>
    isActive ? 'mr-4 font-semibold text-blue-600 underline' : 'mr-4 hover:text-blue-600';

  const handleLogout = () => {
    clearUser();
    logout();
    navigate('/login');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow relative">
      <NavLink to="/" className="text-xl font-bold text-blue-600">
        Domain Expert Discovery
      </NavLink>

      <AnimatePresence>
        {user && showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              position: 'absolute',
              left: '36%',
              top: '12px',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '20px',
              borderRadius: '24px',
              padding: '10px 32px',
              boxShadow: '0 4px 24px rgba(124, 58, 237, 0.16)',
              zIndex: 50,
            }}
          >
            👋 Welcome back, {user.name || 'User'}!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center">
        <NavLink to="/" className={getNavLinkClass} end>
          Home
        </NavLink>
        <NavLink to="/experts" className={getNavLinkClass}>
          Experts
        </NavLink>
        <NavLink to="/about" className={getNavLinkClass}>
          About
        </NavLink>
        <NavLink to="/contact" className={getNavLinkClass}>
          Contact
        </NavLink>
        {userLoggedIn ? (
          <>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/analytics" className={getNavLinkClass}>
              Analytics
            </NavLink>
            <button
              onClick={goToProfile}
              title="Profile"
              className="ml-4 rounded-full w-10 h-10 bg-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-400"
              aria-label="Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6 text-gray-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={getNavLinkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={getNavLinkClass}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
