"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAddresses } from '@/hooks/use-addresses';
import type { Address } from '@/gql/graphql';
import { toast } from 'sonner';
import { MapPin, Edit, Trash2, Phone } from 'lucide-react';

interface AddressListProps {
  selectedAddressId?: string;
  onAddressSelect: (address: Address) => void;
  onEditAddress: (address: Address) => void;
}

export function AddressList({
  selectedAddressId,
  onAddressSelect,
  onEditAddress,
}: AddressListProps) {
  const { addresses, deleteAddress, isLoading } = useAddresses();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (address: Address) => {
    if (!confirm(`Are you sure you want to delete this address?\n\n${address.content}`)) {
      return;
    }

    try {
      setDeletingId(address.id);
      await deleteAddress(address.id);
      toast.success('Address deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete address:', error);
      toast.error(error.message || 'Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No addresses found</h3>
        <p className="text-muted-foreground mb-4">
          You haven't added any shipping addresses yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <Card
          key={address.id}
          className={`cursor-pointer transition-colors ${
            selectedAddressId === address.id
              ? 'ring-2 ring-primary bg-primary/5'
              : 'hover:bg-muted/50'
          }`}
          onClick={() => onAddressSelect(address)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    {address.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mb-2 ml-6">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {address.phone}
                  </p>
                </div>

                {address.area && (
                  <div className="flex items-center gap-2 ml-6">
                    <Badge variant="secondary" className="text-xs">
                      {address.area.gov?.name} - {address.area.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-green-600">
                      Shipping: EGP {address.area.shipping_cost}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAddress(address);
                  }}
                  disabled={deletingId === address.id}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(address);
                  }}
                  disabled={deletingId === address.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === address.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}