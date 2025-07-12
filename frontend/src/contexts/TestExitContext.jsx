// frontend/src/contexts/TestExitContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const TestExitContext = createContext();

export function TestExitProvider({ children }) {
  const [isTestInProgress, setIsTestInProgress] = useState(false); // El estado clave
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  const navigate = useNavigate();

  // Función que los componentes llamarán para intentar navegar
  const attemptToNavigate = (path) => {
    if (isTestInProgress) {
      setNextPath(path);
      setIsExitModalOpen(true);
    } else {
      navigate(path);
    }
  };

  const confirmAndNavigate = () => {
    setIsTestInProgress(false); // Desactivamos el modo test
    setIsExitModalOpen(false);
    if (nextPath) {
      navigate(nextPath);
      setNextPath(null);
    }
  };

  const cancelExit = () => {
    setIsExitModalOpen(false);
    setNextPath(null);
  };

  const value = {
    setIsTestInProgress, // Permitimos que TestDetail cambie el estado
    isExitModalOpen,
    attemptToNavigate,
    confirmAndNavigate,
    cancelExit,
  };

  return (
    <TestExitContext.Provider value={value}>
      {children}
    </TestExitContext.Provider>
  );
}

export const useTestExit = () => useContext(TestExitContext);