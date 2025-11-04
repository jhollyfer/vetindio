import { QueryClient as Base } from '@tanstack/react-query';

export const QueryClient = new Base({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: true,
      staleTime: 60 * 60 * 1000, // 1 hour
    },
  },
});

export const QUERY_KEY = {
  CATEGORY: {
    LIST_PAGINATED: 'category-list-paginated',
    SHOW: 'category-show',
  },
  PRODUCT: {
    LIST_PAGINATED: 'product-list-paginated',
    SHOW: 'product-show',
  },
} as const;
