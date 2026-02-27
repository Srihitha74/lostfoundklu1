import React, { createContext, useContext, useEffect, useState } from 'react';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check for JWT token in localStorage for local auth
      const token = localStorage.getItem('token');
      if (token) {
        // For simplicity, set user to true if token exists
        // In a real app, you might decode the token to get user info
        setUser({ token });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for custom auth change event
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);

    return () => window.removeEventListener('authChange', handleAuthChange);

    // Commented out Firebase auth
    /*
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
    */
  }, []);

  const value = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};