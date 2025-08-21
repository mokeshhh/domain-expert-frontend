// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On mount, fetch user info from localStorage and backend
    const email = localStorage.getItem('email');
    if (!email) {
      setUser(null);
      return;
    }
    fetch(`/api/auth/me?email=${encodeURIComponent(email)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const updateUser = (userData) => setUser(userData);
  const clearUser = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}
