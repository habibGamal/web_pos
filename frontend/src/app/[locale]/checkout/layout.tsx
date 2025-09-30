import { AddressesProvider } from '@/hooks/use-addresses';
import React from 'react';

export default function layout({ children }: { children: React.ReactNode }) {
  return <AddressesProvider>{children}</AddressesProvider>;
}
