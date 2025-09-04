import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children, module = 'admin' }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    // Load dark mode preference from Firebase
    const loadDarkMode = async () => {
      if (user?.username) {
        try {
          const { ref, get } = await import('firebase/database');
          const { db } = await import('../../services/firebase');
          
          const safeUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
          const darkModeRef = ref(db, `userPreferences/${safeUsername}/darkMode_${module}`);
          const snapshot = await get(darkModeRef);
          
          if (snapshot.exists()) {
            setDarkMode(snapshot.val());
          }
        } catch (error) {
          console.error('Error loading dark mode preference:', error);
        }
      }
    };
    
    loadDarkMode();
  }, [user, module]);

  useEffect(() => {
    // Apply dark mode only to current module
    const moduleClass = `dark-${module}`;
    if (darkMode) {
      document.documentElement.classList.add(moduleClass);
      document.body.classList.add(moduleClass);
    } else {
      document.documentElement.classList.remove(moduleClass);
      document.body.classList.remove(moduleClass);
    }
  }, [darkMode, module]);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Save to Firebase
    if (user?.username) {
      try {
        const { ref, set } = await import('firebase/database');
        const { db } = await import('../../services/firebase');
        
        const safeUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
        const darkModeRef = ref(db, `userPreferences/${safeUsername}/darkMode_${module}`);
        await set(darkModeRef, newDarkMode);
      } catch (error) {
        console.error('Error saving dark mode preference:', error);
      }
    }
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);