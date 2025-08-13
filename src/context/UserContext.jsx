import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Al cargar, busca en localStorage
        let initialUser = null;
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser && storedUser !== 'undefined') {
            initialUser = JSON.parse(storedUser);
          }
        } catch (error) {
          console.error('Error al parsear user desde localStorage:', error);
          localStorage.removeItem('user');
        }
      
        return initialUser; // ← ESTA LÍNEA FALTABA
    });
      

  // Siempre que el usuario cambie, actualiza el localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
