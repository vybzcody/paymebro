import { useState, useCallback } from 'react';

export function useDashboardRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  return {
    refreshKey,
    triggerRefresh
  };
}