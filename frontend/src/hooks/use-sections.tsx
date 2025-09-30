"use client";

import { useQuery } from '@apollo/client/react';
import { graphql } from '../gql';
import type { SectionsQuery, SectionByIdQuery } from '../gql/graphql';

// GraphQL Documents
const SECTIONS_QUERY = graphql(/* GraphQL */ `
  query Sections($active: Boolean) {
    sections(active: $active) {
      id
      title
      active
      sort_order
      section_type
      created_at
      updated_at
      products_count
      active_products_count
      has_products
      products {
        id
        name
        slug
        price
        effective_price
        discount_percentage
        is_featured
        is_on_sale
        is_in_stock
        featured_image
        description
        category {
          id
          name
          slug
        }
        brand {
          id
          name
          slug
        }
      }
    }
  }
`);

const SECTION_BY_ID_QUERY = graphql(/* GraphQL */ `
  query SectionById($id: ID!) {
    section(id: $id) {
      id
      title
      active
      sort_order
      section_type
      created_at
      updated_at
      products_count
      active_products_count
      has_products
      products {
        id
        name
        slug
        price
        effective_price
        discount_percentage
        is_featured
        is_on_sale
        is_in_stock
        featured_image
        description
        category {
          id
          name
          slug
        }
        brand {
          id
          name
          slug
        }
      }
    }
  }
`);

// Hook interfaces
interface UseSectionsOptions {
  active?: boolean;
  skip?: boolean;
}

interface UseSectionOptions {
  id: string;
  skip?: boolean;
}

// Custom hooks
export function useSections(options: UseSectionsOptions = {}) {
  const {
    active = true,
    skip = false,
  } = options;

  const { data, loading, error, refetch } = useQuery<SectionsQuery>(SECTIONS_QUERY, {
    variables: {
      active,
    },
    skip,
    errorPolicy: 'all',
  });

  return {
    sections: data?.sections || [],
    loading,
    error,
    refetch,
  };
}

export function useSection(options: UseSectionOptions) {
  const { id, skip = false } = options;

  const { data, loading, error, refetch } = useQuery<SectionByIdQuery>(SECTION_BY_ID_QUERY, {
    variables: { id },
    skip: skip || !id,
    errorPolicy: 'all',
  });

  return {
    section: data?.section,
    loading,
    error,
    refetch,
  };
}