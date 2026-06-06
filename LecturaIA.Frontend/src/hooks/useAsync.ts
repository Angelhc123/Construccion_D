import { useState, useCallback } from 'react';

export const useAsync = <T = any>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Allow manual state updates if needed
  return { 
    data, 
    loading, 
    error, 
    execute, 
    setError, 
    setData 
  };
};
