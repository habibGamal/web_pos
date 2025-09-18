"use client";

import { useQuery } from '@apollo/client/react';
import { graphql } from '../gql';

// GraphQL Documents
const CATEGORIES_QUERY = graphql(/* GraphQL */ `
  query Categories($is_active: Boolean, $parents_only: Boolean) {
    categories(is_active: $is_active, parents_only: $parents_only) {
      id
      name
      slug
      description
      display_image
      display_order
      is_active
      url
      products_count
      active_products_count
      has_products
      parent_id
      parent {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        active_products_count
      }
    }
  }
`);

const CATEGORY_BY_ID_QUERY = graphql(/* GraphQL */ `
  query CategoryById($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      description
      display_image
      display_order
      is_active
      url
      products_count
      active_products_count
      has_products
      parent_id
      parent {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        active_products_count
      }
      products {
        id
        name
        slug
        price
        effective_price
        is_featured
        is_on_sale
        is_in_stock
        featured_image
      }
    }
  }
`);

const CATEGORY_BY_SLUG_QUERY = graphql(/* GraphQL */ `
  query CategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      name
      slug
      description
      display_image
      display_order
      is_active
      url
      products_count
      active_products_count
      has_products
      parent_id
      parent {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        active_products_count
      }
      products {
        id
        name
        slug
        price
        effective_price
        is_featured
        is_on_sale
        is_in_stock
        featured_image
      }
    }
  }
`);

// Hook interfaces
interface UseCategoriesOptions {
  is_active?: boolean;
  parents_only?: boolean;
  skip?: boolean;
}

interface UseCategoryOptions {
  id?: string;
  slug?: string;
  skip?: boolean;
}

// Custom hooks
export function useCategories(options: UseCategoriesOptions = {}) {
  const {
    is_active = true,
    parents_only = false,
    skip = false,
  } = options;

  const { data, loading, error, refetch } = useQuery(CATEGORIES_QUERY, {
    variables: {
      is_active,
      parents_only,
    },
    skip,
    errorPolicy: 'all',
  });

  return {
    categories: data?.categories || [],
    loading,
    error,
    refetch,
  };
}

export function useCategory(options: UseCategoryOptions) {
  const { id, slug, skip = false } = options;

  // Use the appropriate query based on whether we have id or slug
  const { data: dataById, loading: loadingById, error: errorById } = useQuery(CATEGORY_BY_ID_QUERY, {
    variables: { id: id! },
    skip: skip || !id,
    errorPolicy: 'all',
  });

  const { data: dataBySlug, loading: loadingBySlug, error: errorBySlug } = useQuery(CATEGORY_BY_SLUG_QUERY, {
    variables: { slug: slug! },
    skip: skip || !slug,
    errorPolicy: 'all',
  });

  const category = id ? dataById?.category : dataBySlug?.categoryBySlug;
  const loading = id ? loadingById : loadingBySlug;
  const error = id ? errorById : errorBySlug;

  return {
    category,
    loading,
    error,
  };
}