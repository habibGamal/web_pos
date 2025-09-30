"use client";
import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { graphql } from '../gql';
import type {
  Address,
  Gov,
  Area,
  AddressInput,
} from '../gql/graphql';
import { useAuth } from './use-auth';

// GraphQL documents
const getUserWithAddressesDocument = graphql(/* GraphQL */ `
  query GetUserWithAddresses {
    me {
      id
      name
      email
      addresses {
        id
        content
        phone
        area_id
        user_id
        created_at
        updated_at
        area {
          id
          name
          shipping_cost
          gov_id
          gov {
            id
            name
          }
        }
      }
    }
  }
`);

const getGovernoratesDocument = graphql(/* GraphQL */ `
  query GetGovernorates {
    governorates {
      id
      name
      areas {
        id
        name
        shipping_cost
      }
    }
  }
`);

const getAreasDocument = graphql(/* GraphQL */ `
  query GetAreas($gov_id: ID!) {
    areas(gov_id: $gov_id) {
      id
      name
      shipping_cost
      gov_id
    }
  }
`);

const createAddressDocument = graphql(/* GraphQL */ `
  mutation CreateAddress($input: AddressInput!) {
    createAddress(input: $input) {
      id
      content
      phone
      area_id
      user_id
      created_at
      updated_at
      area {
        id
        name
        shipping_cost
        gov_id
        gov {
          id
          name
        }
      }
    }
  }
`);

const updateAddressDocument = graphql(/* GraphQL */ `
  mutation UpdateAddress($id: ID!, $input: AddressInput!) {
    updateAddress(id: $id, input: $input) {
      id
      content
      phone
      area_id
      user_id
      created_at
      updated_at
      area {
        id
        name
        shipping_cost
        gov_id
        gov {
          id
          name
        }
      }
    }
  }
`);

const deleteAddressDocument = graphql(/* GraphQL */ `
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`);

// Note: setDefaultAddress functionality is not implemented in the backend schema

// Addresses context type
interface AddressesContextType {
  addresses: Address[];
  governorates: Gov[];
  isLoading: boolean;
  isLoadingGovs: boolean;
  error: string | null;
  createAddress: (input: AddressInput) => Promise<Address>;
  updateAddress: (id: string, input: AddressInput) => Promise<Address>;
  deleteAddress: (id: string) => Promise<boolean>;
  getAreasByGov: (govId: string) => Promise<Area[]>;
  getShippingCost: (areaId: string) => number;
  refreshAddresses: () => Promise<void>;
  clearError: () => void;
}

const AddressesContext = createContext<AddressesContextType | undefined>(undefined);

// Addresses Provider Component
interface AddressesProviderProps {
  children: ReactNode;
}

export function AddressesProvider({ children }: AddressesProviderProps) {
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Queries and mutations
  const {
    data: userData,
    loading: isLoading,
    refetch: refetchUserData,
    error: queryError,
  } = useQuery(getUserWithAddressesDocument, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: governoratesData,
    loading: isLoadingGovs,
    error: govsError,
  } = useQuery(getGovernoratesDocument, {
    errorPolicy: 'all',
  });

  const [createAddressMutation] = useMutation(createAddressDocument, {
    refetchQueries: [{ query: getUserWithAddressesDocument }],
    awaitRefetchQueries: true,
  });

  const [updateAddressMutation] = useMutation(updateAddressDocument, {
    refetchQueries: [{ query: getUserWithAddressesDocument }],
    awaitRefetchQueries: true,
  });

  const [deleteAddressMutation] = useMutation(deleteAddressDocument, {
    refetchQueries: [{ query: getUserWithAddressesDocument }],
    awaitRefetchQueries: true,
  });

  // Process data
  const addresses = (userData?.me?.addresses || []) as Address[];
  const governorates = (governoratesData?.governorates || []) as Gov[];

  // Helper function to handle errors
  const handleError = useCallback((error: any): never => {
    const message = error.graphQLErrors?.[0]?.message || error.message || 'An error occurred';
    setError(message);
    throw new Error(message);
  }, []);

  // Clear errors when query error changes
  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
    if (govsError) {
      setError(govsError.message);
    }
  }, [queryError, govsError]);

  // Address operations
  const createAddress = useCallback(
    async (input: AddressInput): Promise<Address> => {
      try {
        setError(null);
        const { data } = await createAddressMutation({ variables: { input } });
        if (!data?.createAddress) throw new Error('Failed to create address');
        
        return data.createAddress as Address;
      } catch (error) {
        return handleError(error);
      }
    },
    [createAddressMutation, handleError]
  );

  const updateAddress = useCallback(
    async (id: string, input: AddressInput): Promise<Address> => {
      try {
        setError(null);
        const { data } = await updateAddressMutation({ variables: { id, input } });
        if (!data?.updateAddress) throw new Error('Failed to update address');
        
        return data.updateAddress as Address;
      } catch (error) {
        return handleError(error);
      }
    },
    [updateAddressMutation, handleError]
  );

  const deleteAddress = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);
        const { data } = await deleteAddressMutation({ variables: { id } });
        return data?.deleteAddress ?? false;
      } catch (error) {
        return handleError(error);
      }
    },
    [deleteAddressMutation, handleError]
  );

  // Note: setDefaultAddress functionality is not implemented in the backend

  // Helper functions
  const getAreasByGov = useCallback(
    async (govId: string): Promise<Area[]> => {
      const gov = governorates.find((g: any) => g.id === govId);
      return (gov?.areas || []) as Area[];
    },
    [governorates]
  );

  const getShippingCost = useCallback(
    (areaId: string): number => {
      for (const gov of governorates) {
        const area = gov.areas?.find((a: any) => a.id === areaId);
        if (area) {
          return area.shipping_cost || 0;
        }
      }
      return 0;
    },
    [governorates]
  );

  const refreshAddresses = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      if (isAuthenticated) {
        await refetchUserData();
      }
    } catch (error) {
      console.error('Failed to refresh addresses:', error);
    }
  }, [isAuthenticated, refetchUserData]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const contextValue: AddressesContextType = {
    addresses,
    governorates,
    isLoading,
    isLoadingGovs,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    getAreasByGov,
    getShippingCost,
    refreshAddresses,
    clearError,
  };

  return <AddressesContext.Provider value={contextValue}>{children}</AddressesContext.Provider>;
}

// Addresses Hook
export function useAddresses(): AddressesContextType {
  const context = useContext(AddressesContext);
  if (context === undefined) {
    throw new Error('useAddresses must be used within an AddressesProvider');
  }
  return context;
}

// Additional hooks for specific use cases
export function useAddressActions() {
  const { 
    createAddress, 
    updateAddress, 
    deleteAddress
  } = useAddresses();

  return {
    createAddress,
    updateAddress,
    deleteAddress,
  };
}

export function useGovernoratesAndAreas() {
  const { 
    governorates, 
    isLoadingGovs, 
    getAreasByGov,
    getShippingCost 
  } = useAddresses();

  return {
    governorates,
    isLoadingGovs,
    getAreasByGov,
    getShippingCost,
  };
}

// Hook for address selection
export function useAddressSelection() {
  const { addresses } = useAddresses();

  const getAddressById = useCallback(
    (id: string): Address | null => {
      return addresses.find((addr: any) => addr.id === id) || null;
    },
    [addresses]
  );

  return {
    addresses,
    getAddressById,
  };
}