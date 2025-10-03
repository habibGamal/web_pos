"use client";

import { useQuery } from '@apollo/client/react';
import { graphql } from '../gql';
import type { OrderStatus, ReturnStatus } from '../gql/graphql';

// GraphQL Documents
const ORDERS_QUERY = graphql(/* GraphQL */ `
  query Orders(
    $status: OrderStatus
    $date_from: DateTime
    $date_to: DateTime
    $first: Int
    $page: Int
  ) {
    orders(
      status: $status
      date_from: $date_from
      date_to: $date_to
      first: $first
      page: $page
    ) {
      data {
        id
        user_id
        order_status
        payment_status
        subtotal
        shipping_cost
        discount
        total
        notes
        created_at
        updated_at
        can_be_cancelled
        can_be_returned
        tracking_number
        estimated_delivery_date
        delivered_at
        items {
          id
          quantity
          unit_price
          total_price
          options
          variant_details
          returnable_quantity
          product {
            id
            name
            slug
            featured_image
          }
          variant {
            id
            name
            sku
          }
        }
        shipping_address {
          id
          content
          phone
          area {
            id
            name
            shipping_cost
            gov {
              id
              name
            }
          }
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

const ORDER_BY_ID_QUERY = graphql(/* GraphQL */ `
  query OrderById($id: ID!) {
    order(id: $id) {
      id
      user_id
      order_status
      payment_status
      subtotal
      shipping_cost
      discount
      total
      notes
      created_at
      updated_at
      can_be_cancelled
      can_be_returned
      tracking_number
      estimated_delivery_date
      delivered_at
      items {
        id
        quantity
        unit_price
        total_price
        options
        variant_details
        returnable_quantity
        product {
          id
          name
          slug
          featured_image
        }
        variant {
          id
          name
          sku
        }
      }
      shipping_address {
        id
        content
        phone
        area {
          id
          name
          shipping_cost
          gov {
            id
            name
          }
        }
      }
      returns {
        id
        return_number
        status
        reason
        notes
        refund_amount
        created_at
        approved_at
        refunded_at
      }
    }
  }
`);

const RETURNS_QUERY = graphql(/* GraphQL */ `
  query Returns(
    $status: ReturnStatus
    $first: Int
    $page: Int
  ) {
    returns(
      status: $status
      first: $first
      page: $page
    ) {
      data {
        id
        return_number
        order_id
        status
        reason
        notes
        refund_amount
        created_at
        updated_at
        approved_at
        refunded_at
        order {
          id
          order_status
          created_at
        }
        returnItems {
          id
          quantity
          unit_price
          subtotal
          orderItem {
            id
            product {
              id
              name
              slug
              featured_image
            }
            variant {
              id
              name
              sku
            }
          }
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

const RETURN_BY_ID_QUERY = graphql(/* GraphQL */ `
  query ReturnById($id: ID!) {
    returnOrder(id: $id) {
      id
      return_number
      order_id
      status
      reason
      notes
      refund_amount
      created_at
      updated_at
      approved_at
      refunded_at
      order {
        id
        order_status
        created_at
        total
      }
      returnItems {
        id
        quantity
        unit_price
        subtotal
        orderItem {
          id
          quantity
          unit_price
          product {
            id
            name
            slug
            featured_image
          }
          variant {
            id
            name
            sku
          }
        }
      }
      statusHistory {
        id
        previous_status
        new_status
        notes
        created_at
        changedBy {
          id
          name
        }
      }
    }
  }
`);

// Hook interfaces
interface UseOrdersOptions {
  first?: number;
  page?: number;
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  skip?: boolean;
}

interface UseOrderOptions {
  id?: string;
  skip?: boolean;
}

interface UseReturnsOptions {
  first?: number;
  page?: number;
  status?: ReturnStatus;
  skip?: boolean;
}

interface UseReturnOptions {
  id?: string;
  skip?: boolean;
}

// Custom hooks
export function useOrders(options: UseOrdersOptions = {}) {
  const {
    first = 10,
    page = 1,
    status,
    date_from,
    date_to,
    skip = false,
  } = options;

  const { data, loading, error, refetch, fetchMore } = useQuery(ORDERS_QUERY, {
    variables: {
      first,
      page,
      status,
      date_from,
      date_to,
    },
    skip,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    orders: data?.orders?.data || [],
    paginatorInfo: data?.orders?.paginatorInfo,
    loading,
    error,
    refetch,
    fetchMore,
  };
}

export function useOrder(options: UseOrderOptions) {
  const { id, skip = false } = options;

  const { data, loading, error, refetch } = useQuery(ORDER_BY_ID_QUERY, {
    variables: { id: id! },
    skip: skip || !id,
    errorPolicy: 'all',
  });

  return {
    order: data?.order,
    loading,
    error,
    refetch,
  };
}

export function useReturns(options: UseReturnsOptions = {}) {
  const {
    first = 10,
    page = 1,
    status,
    skip = false,
  } = options;

  const { data, loading, error, refetch, fetchMore } = useQuery(RETURNS_QUERY, {
    variables: {
      first,
      page,
      status,
    },
    skip,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    returns: data?.returns?.data || [],
    paginatorInfo: data?.returns?.paginatorInfo,
    loading,
    error,
    refetch,
    fetchMore,
  };
}

export function useReturn(options: UseReturnOptions) {
  const { id, skip = false } = options;

  const { data, loading, error, refetch } = useQuery(RETURN_BY_ID_QUERY, {
    variables: { id: id! },
    skip: skip || !id,
    errorPolicy: 'all',
  });

  return {
    returnOrder: data?.returnOrder,
    loading,
    error,
    refetch,
  };
}