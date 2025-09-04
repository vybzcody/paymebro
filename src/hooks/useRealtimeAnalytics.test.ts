import { renderHook } from '@testing-library/react';
import { useRealtimeAnalytics } from './useRealtimeAnalytics';
import { AnalyticsFilters } from './useAnalytics';

// Mock the context and supabase
jest.mock('@/contexts/MultiChainWeb3AuthContext', () => ({
  useMultiChainWeb3Auth: () => ({
    user: { userId: 'test-user-id', id: 'test-user-id' }
  })
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn()
      }))
    }))
  }
}));

describe('useRealtimeAnalytics', () => {
  const defaultFilters: AnalyticsFilters = {
    dateRange: 'month',
    currency: 'all',
    status: 'all'
  };

  it('should return zero metrics when no transactions exist', () => {
    const { result } = renderHook(() => useRealtimeAnalytics(defaultFilters));
    
    expect(result.current.metrics.totalRevenue).toBe(0);
    expect(result.current.metrics.totalTransactions).toBe(0);
    expect(result.current.metrics.mrr).toBe(0);
    expect(result.current.metrics.arr).toBe(0);
  });
});
