import { ApolloClient, HttpLink, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Function to get CSRF token from cookie
const getCsrfToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; XSRF-TOKEN=`);
  if (parts.length === 2) {
    const token = parts.pop()?.split(';').shift();
    return token ? decodeURIComponent(token) : null;
  }
  return null;
};

// Function to fetch CSRF cookie from Laravel Sanctum
const fetchCsrfCookie = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
    });
  } catch (error) {
    console.warn('Failed to fetch CSRF cookie:', error);
  }
};

// HTTP Link for GraphQL endpoint
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
  credentials: "include", // Include cookies for authentication
});

// Auth link to add Bearer token and CSRF token to requests
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from localStorage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // Ensure we have a CSRF token for state-changing operations
  let csrfToken = getCsrfToken();
  if (!csrfToken && typeof window !== 'undefined') {
    await fetchCsrfCookie();
    csrfToken = getCsrfToken();
  }
  
  const requestHeaders: Record<string, string> = {
    ...headers,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    requestHeaders.authorization = `Bearer ${token}`;
  }

  // Add CSRF token header if available
  if (csrfToken) {
    requestHeaders['X-XSRF-TOKEN'] = csrfToken;
  }
  
  return {
    headers: requestHeaders,
  };
});

// Error link to handle authentication errors
const errorLink = onError((errorResponse) => {
  const { graphQLErrors, networkError } = errorResponse as any;
  
  if (graphQLErrors) {
    graphQLErrors.forEach((error: any) => {
      console.error(
        `[GraphQL error]: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`
      );

      // Handle authentication errors
      if (error.extensions?.code === 'UNAUTHENTICATED' || error.message.includes('Unauthenticated')) {
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        
        // Redirect to login page if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle 401 Unauthorized
    if ('statusCode' in networkError && (networkError as any).statusCode === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }
  }
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          // Cache policy for user fields that might change
          avatar: {
            merge: false,
          },
          linked_providers: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;

// Export utility functions for CSRF handling
export { fetchCsrfCookie };
