"use client";

import { useQuery } from '@apollo/client/react';
import { graphql } from '../gql';
import type { ProductOrderByClause, ProductSearchInput } from '../gql/graphql';

// GraphQL Documents
const PRODUCTS_QUERY = graphql(/* GraphQL */ `
  query Products(
    $search: ProductSearchInput
    $orderBy: [ProductOrderByClause!]
    $first: Int
    $page: Int
  ) {
    products(
      search: $search
      orderBy: $orderBy
      first: $first
      page: $page
    ) {
      data {
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
        }
        brand {
          id
          name
        }
        default_variant {
          id
          name
          sku
          price
          effective_price
          quantity
          is_active
          is_default
        }
        options {
          id
          name
          values
        }
      }
      paginatorInfo {
        count
        currentPage
        firstItem
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`);

const PRODUCT_BY_ID_QUERY = graphql(/* GraphQL */ `
  query ProductById($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      price
      effective_price
      discount_percentage
      is_featured
      is_on_sale
      is_in_stock
      featured_image
      images
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
      variants {
        id
        name
        price
        effective_price
        is_in_stock
        quantity
        attributes_string
        attribute_values {
          id
          value
          color_code
          attribute {
            id
            name
            type
          }
        }
      }
      default_variant {
        id
        name
        sku
        price
        effective_price
        quantity
        is_active
        is_default
      }
      options {
        id
        name
        values
      }
    }
  }
`);

const PRODUCT_BY_SLUG_QUERY = graphql(/* GraphQL */ `
  query ProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      id
      name
      slug
      description
      price
      effective_price
      discount_percentage
      is_featured
      is_on_sale
      is_in_stock
      featured_image
      images
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
      variants {
        id
        name
        price
        effective_price
        is_in_stock
        quantity
        attributes_string
        attribute_values {
          id
          value
          color_code
          attribute {
            id
            name
            type
          }
        }
      }
      default_variant {
        id
        name
        sku
        price
        effective_price
        quantity
        is_active
        is_default
      }
      options {
        id
        name
        values
      }
    }
  }
`);

// Hook interfaces
interface UseProductsOptions {
  first?: number;
  page?: number;
  search?: ProductSearchInput;
  orderBy?: ProductOrderByClause[];
  skip?: boolean;
}

interface UseProductOptions {
  id?: string;
  slug?: string;
  skip?: boolean;
}

// Custom hooks
export function useProducts(options: UseProductsOptions = {}) {
  const {
    first = 24,
    page = 1,
    search,
    orderBy,
    skip = false,
  } = options;

  const { data, loading, error, refetch, fetchMore } = useQuery(PRODUCTS_QUERY, {
    variables: {
      first,
      page,
      search,
      orderBy,
    },
    skip,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    products: data?.products?.data || [],
    paginatorInfo: data?.products?.paginatorInfo,
    loading,
    error,
    refetch,
    fetchMore,
  };
}

export function useProduct(options: UseProductOptions) {
  const { id, slug, skip = false } = options;

  // Use the appropriate query based on whether we have id or slug
  const { data: dataById, loading: loadingById, error: errorById } = useQuery(PRODUCT_BY_ID_QUERY, {
    variables: { id: id! },
    skip: skip || !id,
    errorPolicy: 'all',
  });

  const { data: dataBySlug, loading: loadingBySlug, error: errorBySlug } = useQuery(PRODUCT_BY_SLUG_QUERY, {
    variables: { slug: slug! },
    skip: skip || !slug,
    errorPolicy: 'all',
  });

  const product = id ? dataById?.product : dataBySlug?.productBySlug;
  const loading = id ? loadingById : loadingBySlug;
  const error = id ? errorById : errorBySlug;

  return {
    product,
    loading,
    error,
  };
}