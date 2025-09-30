"use client";

import { useQuery } from '@apollo/client/react';
import { graphql } from '../gql';

// GraphQL Documents
const NAVIGATION_DATA_QUERY = graphql(/* GraphQL */ `
  query NavigationData {
    brands(is_active: true, parents_only: true) {
      id
      name
      slug
      image
      display_order
      is_active
      active_products_count
    }
    categories(is_active: true, parents_only: true) {
      id
      name
      slug
      image
      display_order
      is_active
      active_products_count
    }
  }
`);

// Hook interface
interface UseNavigationOptions {
  skip?: boolean;
}

// Custom hook
export function useNavigation(options: UseNavigationOptions = {}) {
  const { skip = false } = options;

  const { data, loading, error, refetch } = useQuery(NAVIGATION_DATA_QUERY, {
    skip,
    errorPolicy: 'all',
  });
  return {
    brands: data?.brands || [],
    categories: data?.categories || [],
    loading,
    error,
    refetch,
  };
}