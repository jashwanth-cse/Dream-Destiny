import { useState } from 'react';

/**
 * Custom hook for managing button loading states
 * @param {number} defaultDelay - Default delay in milliseconds
 * @returns {object} - Loading state and control functions
 */
export const useButtonLoading = (defaultDelay = 1500) => {
  const [loadingStates, setLoadingStates] = useState({});

  const setButtonLoading = (buttonId, isLoading, customMessage = null) => {
    setLoadingStates(prev => ({
      ...prev,
      [buttonId]: {
        isLoading,
        message: customMessage
      }
    }));
  };

  const startButtonLoading = (buttonId, message = 'Loading...', delay = defaultDelay) => {
    setButtonLoading(buttonId, true, message);
    
    if (delay > 0) {
      setTimeout(() => {
        setButtonLoading(buttonId, false);
      }, delay);
    }
  };

  const stopButtonLoading = (buttonId) => {
    setButtonLoading(buttonId, false);
  };

  const isButtonLoading = (buttonId) => {
    return loadingStates[buttonId]?.isLoading || false;
  };

  const getButtonMessage = (buttonId) => {
    return loadingStates[buttonId]?.message || 'Loading...';
  };

  const executeWithLoading = async (buttonId, asyncFunction, loadingMessage = 'Processing...') => {
    try {
      setButtonLoading(buttonId, true, loadingMessage);
      const result = await asyncFunction();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setButtonLoading(buttonId, false);
    }
  };

  return {
    loadingStates,
    setButtonLoading,
    startButtonLoading,
    stopButtonLoading,
    isButtonLoading,
    getButtonMessage,
    executeWithLoading
  };
};

export default useButtonLoading;
