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
  // let csrfToken = getCsrfToken();
  // if (!csrfToken && typeof window !== 'undefined') {
  //   await fetchCsrfCookie();
  //   csrfToken = getCsrfToken();
  // }
  
  
  const requestHeaders: Record<string, string> = {
    ...headers,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    requestHeaders.authorization = `Bearer ${token}`;
  }

  // Add CSRF token header for state-changing requests
  // console.log('CSRF Token:', csrfToken);
  // if (csrfToken) {
  //   requestHeaders['X-XSRF-TOKEN'] = csrfToken;
  // }

  return {
    headers: requestHeaders,
  };
});

// Enhanced error link with better error categorization and handling
const errorLink = onError(({ error, operation }) => {
  console.error('Apollo error occurred:', {
    error,
    operation: operation.operationName,
    variables: operation.variables,
  });

  // Check if it's a GraphQL error using the new Apollo Client 4 pattern
  if (error && typeof error === 'object' && 'errors' in error) {
    // Handle GraphQL errors
    const graphQLErrors = (error as any).errors;
    if (Array.isArray(graphQLErrors)) {
      graphQLErrors.forEach((gqlError: any) => {
        console.error(
          `[GraphQL error]: Message: ${gqlError.message}, Location: ${gqlError.locations}, Path: ${gqlError.path}`,
          {
            operation: operation.operationName,
            variables: operation.variables,
            extensions: gqlError.extensions,
          }
        );

        // Handle specific error types
        if (gqlError.extensions?.code === 'UNAUTHENTICATED' || gqlError.message.includes('Unauthenticated')) {
          handleAuthenticationError();
        } else if (gqlError.extensions?.code === 'VALIDATION_ERROR') {
          // Validation errors are handled by the component
          console.warn('Validation error:', gqlError.extensions.validation);
        } else if (gqlError.extensions?.code === 'INTERNAL_ERROR') {
          // Log internal errors for monitoring
          console.error('Internal server error:', gqlError);
          
          // TODO: Report to error monitoring service
          // reportError(new Error(gqlError.message), { 
          //   type: 'GRAPHQL_INTERNAL_ERROR',
          //   operation: operation.operationName 
          // });
        }
      });
    }
  } else if (error instanceof Error) {
    // Handle network and other errors
    console.error(`[Network/Other error]:`, {
      message: error.message,
      stack: error.stack,
      operation: operation.operationName,
      variables: operation.variables,
    });
    
    // Check for HTTP status codes in network errors
    if ('statusCode' in error) {
      const statusCode = (error as any).statusCode;
      
      switch (statusCode) {
        case 401:
          handleAuthenticationError();
          break;
        case 403:
          console.warn('Access forbidden for operation:', operation.operationName);
          break;
        case 422:
          // Validation errors are handled by components
          console.warn('Validation error from server');
          break;
        case 429:
          console.warn('Rate limit exceeded');
          // TODO: Implement retry logic with exponential backoff
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server error:', statusCode);
          // TODO: Report to error monitoring service
          // reportError(error, { 
          //   type: 'NETWORK_SERVER_ERROR',
          //   statusCode,
          //   operation: operation.operationName 
          // });
          break;
        default:
          console.error('Unexpected network error:', statusCode);
      }
    }
  }
});

// Helper function to handle authentication errors consistently
function handleAuthenticationError() {
  if (typeof window === 'undefined') return;
  
  // Clear invalid token
  localStorage.removeItem('auth_token');
  
  // Only redirect if not on auth pages
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('/auth/');
  
  if (!isAuthPage) {
    // Store current location for redirect after login
    localStorage.setItem('redirect_after_login', currentPath);
    window.location.href = '/auth/login';
  }
}

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          // Cache policy for user fields that might change
          // Note: avatar and linked_providers fields removed from schema
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
