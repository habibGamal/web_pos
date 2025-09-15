"use client";
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import { graphql } from '../gql';
import { useFragment } from '../gql/fragment-masking';
import type {
  User,
  AuthPayload,
  LoginInput,
  RegisterInput,
  SocialLoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateProfileInput,
  VerifyEmailInput,
  ResendVerificationInput,
} from '../gql/graphql';
import apolloClient, { fetchCsrfCookie } from '../lib/apollo-client';

export const UserFragment = graphql(/* GraphQL */ `
  fragment UserFields on User {
    id
    name
    email
    email_verified
    phone
    locale
    is_admin
    avatar
    full_name
    initials
    has_social_accounts
    linked_providers {
      provider
      provider_id
    }
  }
`);
// // GraphQL Documents
const meQueryDocument = graphql(/* GraphQL */ `
  query Me {
    me {
      ...UserFields
    }
  }
`);

const loginMutationDocument = graphql(/* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      access_token
      token_type
      expires_in
      user {
        ...UserFields
      }
    }
  }
`);

const registerMutationDocument = graphql(/* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      access_token
      token_type
      expires_in
      user {
        ...UserFields
      }
    }
  }
`);

const socialLoginMutationDocument = graphql(/* GraphQL */ `
  mutation SocialLogin($input: SocialLoginInput!) {
    socialLogin(input: $input) {
      access_token
      token_type
      expires_in
      user {
        ...UserFields
      }
    }
  }
`);

const logoutMutationDocument = graphql(/* GraphQL */ `
  mutation Logout {
    logout {
      success
      message
    }
  }
`);

const forgotPasswordMutationDocument = graphql(/* GraphQL */ `
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      message
    }
  }
`);

const resetPasswordMutationDocument = graphql(/* GraphQL */ `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`);

const changePasswordMutationDocument = graphql(/* GraphQL */ `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`);

const updateProfileMutationDocument = graphql(/* GraphQL */ `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
`);

const verifyEmailMutationDocument = graphql(/* GraphQL */ `
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      message
      verified
    }
  }
`);

const resendVerificationMutationDocument = graphql(/* GraphQL */ `
  mutation ResendVerification($input: ResendVerificationInput!) {
    resendVerification(input: $input) {
      success
      message
    }
  }
`);

const deleteAccountMutationDocument = graphql(/* GraphQL */ `
  mutation DeleteAccount {
    deleteAccount {
      success
      message
    }
  }
`);

const refreshTokenMutationDocument = graphql(/* GraphQL */ `
  mutation RefreshToken {
    refreshToken {
      access_token
      token_type
      expires_in
      user {
        ...UserFields
      }
    }
  }
`);

const checkEmailAvailabilityQueryDocument = graphql(/* GraphQL */ `
  query CheckEmailAvailability($email: String!) {
    checkEmailAvailability(email: $email)
  }
`);

// // Auth Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<AuthPayload>;
  register: (input: RegisterInput) => Promise<AuthPayload>;
  socialLogin: (input: SocialLoginInput) => Promise<AuthPayload>;
  logout: () => Promise<void>;
  forgotPassword: (input: ForgotPasswordInput) => Promise<{ message: string }>;
  resetPassword: (input: ResetPasswordInput) => Promise<{ success: boolean; message: string }>;
  changePassword: (input: ChangePasswordInput) => Promise<{ success: boolean; message: string }>;
  updateProfile: (input: UpdateProfileInput) => Promise<User>;
  verifyEmail: (input: VerifyEmailInput) => Promise<{ message: string; verified: boolean }>;
  resendVerification: (
    input: ResendVerificationInput
  ) => Promise<{ success: boolean; message: string }>;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
  refreshToken: () => Promise<AuthPayload>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  clearError: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Queries and mutations using native Apollo hooks with typed documents
  const {
    data: meData,
    loading: meLoading,
    refetch: refetchMe,
  } = useQuery(meQueryDocument, {
    skip: !getToken(),
    errorPolicy: 'ignore', // Don't throw on unauthenticated
  });
  const[getMeLazy] = useLazyQuery(meQueryDocument, {
    errorPolicy: 'ignore',
  });

  const [loginMutation] = useMutation(loginMutationDocument);
  const [registerMutation] = useMutation(registerMutationDocument);
  const [socialLoginMutation] = useMutation(socialLoginMutationDocument);
  const [logoutMutation] = useMutation(logoutMutationDocument);
  const [forgotPasswordMutation] = useMutation(forgotPasswordMutationDocument);
  const [resetPasswordMutation] = useMutation(resetPasswordMutationDocument);
  const [changePasswordMutation] = useMutation(changePasswordMutationDocument);
  const [updateProfileMutation] = useMutation(updateProfileMutationDocument);
  const [verifyEmailMutation] = useMutation(verifyEmailMutationDocument);
  const [resendVerificationMutation] = useMutation(resendVerificationMutationDocument);
  const [deleteAccountMutation] = useMutation(deleteAccountMutationDocument);
  const [refreshTokenMutation] = useMutation(refreshTokenMutationDocument);
  const [checkEmailMutation] = useLazyQuery(checkEmailAvailabilityQueryDocument);

  // // Helper function to get token
  function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  // Helper function to set token
  function setToken(token: string | null): void {
    if (typeof window === 'undefined') return;

    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Helper function to handle auth response
  function handleAuthResponse(data: AuthPayload): AuthPayload {
    setToken(data.access_token);
    setUser(data.user);
    setError(null);

    // Reset Apollo cache to ensure fresh data
    apolloClient.resetStore();

    return data;
  }

  // Helper function to handle errors
  function handleError(error: any): never {
    const message = error.graphQLErrors?.[0]?.message || error.message || 'An error occurred';
    setError(message);
    throw new Error(message);
  }

  // Initialize user state
  useEffect(() => {
    if (meData?.me) {
      const userData = useFragment(UserFragment, meData.me);
      setUser(userData as User);
      setError(null);
    } else if (!meLoading && getToken()) {
      // Token exists but user query failed, token might be invalid
      setToken(null);
      setUser(null);
    }

    if (!meLoading) {
      setIsLoading(false);
    }
  }, [meData, meLoading]);

  // Authentication functions
  const login = useCallback(
    async (input: LoginInput): Promise<AuthPayload> => {
      try {
        setError(null);
        
        const { data } = await loginMutation({ variables: { input } });
        console.log(data);
        if (!data?.login) throw new Error('No data returned');
        
        const authResult: AuthPayload = {
          __typename: 'AuthPayload',
          access_token: data.login.access_token,
          token_type: data.login.token_type,
          expires_in: data.login.expires_in,
          user: useFragment(UserFragment, data.login.user) as User,
        };
        return handleAuthResponse(authResult);
      } catch (error) {
        return handleError(error);
      }
    },
    [loginMutation]
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthPayload> => {
      try {
        setError(null);
        // Ensure CSRF cookie is available
        await fetchCsrfCookie();
        
        const { data } = await registerMutation({ variables: { input } });
        if (!data?.register) throw new Error('No data returned');
        
        const authResult: AuthPayload = {
          __typename: 'AuthPayload',
          access_token: data.register.access_token,
          token_type: data.register.token_type,
          expires_in: data.register.expires_in,
          user: useFragment(UserFragment, data.register.user) as User,
        };
        return handleAuthResponse(authResult);
      } catch (error) {
        return handleError(error);
      }
    },
    [registerMutation]
  );

  const socialLogin = useCallback(
    async (input: SocialLoginInput): Promise<AuthPayload> => {
      try {
        setError(null);
        // Ensure CSRF cookie is available
        await fetchCsrfCookie();
        
        const { data } = await socialLoginMutation({ variables: { input } });
        if (!data?.socialLogin) throw new Error('No data returned');
        
        const authResult: AuthPayload = {
          __typename: 'AuthPayload',
          access_token: data.socialLogin.access_token,
          token_type: data.socialLogin.token_type,
          expires_in: data.socialLogin.expires_in,
          user: useFragment(UserFragment, data.socialLogin.user) as User,
        };
        return handleAuthResponse(authResult);
      } catch (error) {
        return handleError(error);
      }
    },
    [socialLoginMutation]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      // Call logout mutation if user is authenticated
      if (getToken()) {
        await logoutMutation();
      }
    } catch (error) {
      // Continue with logout even if mutation fails
      console.error('Logout mutation failed:', error);
    } finally {
      // Always clear local state
      setToken(null);
      setUser(null);
      apolloClient.clearStore();
    }
  }, [logoutMutation]);

  const forgotPassword = useCallback(
    async (input: ForgotPasswordInput): Promise<{ message: string }> => {
      try {
        setError(null);
        // Ensure CSRF cookie is available
        await fetchCsrfCookie();
        
        const { data } = await forgotPasswordMutation({ variables: { input } });
        if (!data?.forgotPassword) throw new Error('No data returned');
        return { message: data.forgotPassword.message };
      } catch (error) {
        return handleError(error);
      }
    },
    [forgotPasswordMutation]
  );

  const resetPassword = useCallback(
    async (input: ResetPasswordInput): Promise<{ success: boolean; message: string }> => {
      try {
        setError(null);
        // Ensure CSRF cookie is available
        await fetchCsrfCookie();
        
        const { data } = await resetPasswordMutation({ variables: { input } });
        if (!data?.resetPassword) throw new Error('No data returned');
        return data.resetPassword;
      } catch (error) {
        return handleError(error);
      }
    },
    [resetPasswordMutation]
  );

  const changePassword = useCallback(
    async (input: ChangePasswordInput): Promise<{ success: boolean; message: string }> => {
      try {
        setError(null);
        // Ensure CSRF cookie is available
        await fetchCsrfCookie();
        
        const { data } = await changePasswordMutation({ variables: { input } });
        if (!data?.changePassword) throw new Error('No data returned');
        return data.changePassword;
      } catch (error) {
        return handleError(error);
      }
    },
    [changePasswordMutation]
  );

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<User> => {
      try {
        setError(null);
        const { data } = await updateProfileMutation({ variables: { input } });
        if (!data?.updateProfile) throw new Error('No data returned');
        
        const updatedUser = useFragment(UserFragment, data.updateProfile) as User;
        setUser(updatedUser);
        return updatedUser;
      } catch (error) {
        return handleError(error);
      }
    },
    [updateProfileMutation]
  );

  const verifyEmail = useCallback(
    async (input: VerifyEmailInput): Promise<{ message: string; verified: boolean }> => {
      try {
        setError(null);
        const { data } = await verifyEmailMutation({ variables: { input } });
        if (!data?.verifyEmail) throw new Error('No data returned');

        // Refetch user data if email was verified
        if (data.verifyEmail.verified) {
          await refetchMe();
        }

        return data.verifyEmail;
      } catch (error) {
        return handleError(error);
      }
    },
    [verifyEmailMutation, refetchMe]
  );

  const resendVerification = useCallback(
    async (input: ResendVerificationInput): Promise<{ success: boolean; message: string }> => {
      try {
        setError(null);
        const { data } = await resendVerificationMutation({ variables: { input } });
        if (!data?.resendVerification) throw new Error('No data returned');
        return data.resendVerification;
      } catch (error) {
        return handleError(error);
      }
    },
    [resendVerificationMutation]
  );

  const deleteAccount = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      setError(null);
      const { data } = await deleteAccountMutation();
      if (!data?.deleteAccount) throw new Error('No data returned');

      // Clear local state after successful deletion
      setToken(null);
      setUser(null);
      apolloClient.clearStore();

      return data.deleteAccount;
    } catch (error) {
      return handleError(error);
    }
  }, [deleteAccountMutation]);

  const refreshToken = useCallback(async (): Promise<AuthPayload> => {
    try {
      setError(null);
      const { data } = await refreshTokenMutation();
      if (!data?.refreshToken) throw new Error('No data returned');
      
      const authResult: AuthPayload = {
        __typename: 'AuthPayload',
        access_token: data.refreshToken.access_token,
        token_type: data.refreshToken.token_type,
        expires_in: data.refreshToken.expires_in,
        user: useFragment(UserFragment, data.refreshToken.user) as User,
      };
      return handleAuthResponse(authResult);
    } catch (error) {
      // If refresh fails, clear token
      setToken(null);
      setUser(null);
      return handleError(error);
    }
  }, [refreshTokenMutation]);

  const checkEmailAvailability = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        setError(null);
        const { data } = await checkEmailMutation({ variables: { email } });
        if (!data || data.checkEmailAvailability === undefined) throw new Error('No data returned');
        return data.checkEmailAvailability;
      } catch (error) {
        return handleError(error);
      }
    },
    [checkEmailMutation]
  );

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const refetchUser = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      if (getToken()) {
        await refetchMe();
      }
    } catch (error) {
      console.error('Failed to refetch user:', error);
    }
  }, [refetchMe]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    socialLogin,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    verifyEmail,
    resendVerification,
    deleteAccount,
    refreshToken,
    checkEmailAvailability,
    clearError,
    refetchUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Auth Hook


export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Additional hooks for specific use cases
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  return auth;
}

export function useRequireGuest(): AuthContextType {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      // Redirect to dashboard or home page
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  return auth;
}
