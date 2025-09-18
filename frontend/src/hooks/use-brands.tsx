"use client";

import { useQuery } from '@apollo/client/react';
import { graphql } from '../gql';

// GraphQL Documents
const BRANDS_QUERY = graphql(/* GraphQL */ `
  query Brands($is_active: Boolean, $parents_only: Boolean) {
    brands(is_active: $is_active, parents_only: $parents_only) {
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

const BRAND_BY_ID_QUERY = graphql(/* GraphQL */ `
  query BrandById($id: ID!) {
    brand(id: $id) {
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

const BRAND_BY_SLUG_QUERY = graphql(/* GraphQL */ `
  query BrandBySlug($slug: String!) {
    brandBySlug(slug: $slug) {
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
interface UseBrandsOptions {
  is_active?: boolean;
  parents_only?: boolean;
  skip?: boolean;
}

interface UseBrandOptions {
  id?: string;
  slug?: string;
  skip?: boolean;
}

// Custom hooks
export function useBrands(options: UseBrandsOptions = {}) {
  const {
    is_active = true,
    parents_only = false,
    skip = false,
  } = options;

  const { data, loading, error, refetch } = useQuery(BRANDS_QUERY, {
    variables: {
      is_active,
      parents_only,
    },
    skip,
    errorPolicy: 'all',
  });

  return {
    brands: data?.brands || [],
    loading,
    error,
    refetch,
  };
}

export function useBrand(options: UseBrandOptions) {
  const { id, slug, skip = false } = options;

  // Use the appropriate query based on whether we have id or slug
  const { data: dataById, loading: loadingById, error: errorById } = useQuery(BRAND_BY_ID_QUERY, {
    variables: { id: id! },
    skip: skip || !id,
    errorPolicy: 'all',
  });

  const { data: dataBySlug, loading: loadingBySlug, error: errorBySlug } = useQuery(BRAND_BY_SLUG_QUERY, {
    variables: { slug: slug! },
    skip: skip || !slug,
    errorPolicy: 'all',
  });

  const brand = id ? dataById?.brand : dataBySlug?.brandBySlug;
  const loading = id ? loadingById : loadingBySlug;
  const error = id ? errorById : errorBySlug;

  return {
    brand,
    loading,
    error,
  };
}