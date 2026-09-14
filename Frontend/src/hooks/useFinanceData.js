import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';

export function useFinanceData(isAuthenticated, onUnauthorized) {
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [userPaymentSubtypes, setUserPaymentSubtypes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMetadata = useCallback(async () => {
    try {
      const res = await apiRequest('/api/metadata');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setPaymentMethods(data.paymentMethods || []);
        setUserPaymentSubtypes(data.userPaymentSubtypes || []);
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else if (res.status === 401 || res.status === 403) {
        onUnauthorized();
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetadata();
      fetchTransactions();
    }
  }, [isAuthenticated, fetchMetadata, fetchTransactions]);

  const addCustomAccount = async (paymentMethodId, accountName) => {
    const res = await apiRequest('/api/metadata/custom-account', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId, accountName }),
    });

    if (res.ok) {
      const saved = await res.json();
      setUserPaymentSubtypes(prev => [...prev, saved]);
      return saved;
    }
    throw new Error('Failed to create account');
  };

  const createTransaction = async (payload) => {
    const res = await apiRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchTransactions();
      return true;
    }
    return false;
  };

  return {
    categories,
    paymentMethods,
    userPaymentSubtypes,
    transactions,
    loading,
    refreshTransactions: fetchTransactions,
    addCustomAccount,
    createTransaction,
  };
}