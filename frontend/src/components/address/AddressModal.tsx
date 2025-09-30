"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddresses } from '@/hooks/use-addresses';
import type { Address, AddressInput } from '@/gql/graphql';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Form Schema
const addressFormSchema = z.object({
  content: z.string().min(3, 'Address content must be at least 3 characters').max(1000, 'Address content must be at most 1000 characters'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be at most 20 characters'),
  area_id: z.string().min(1, 'Please select an area'),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null;
  onSuccess?: (address: Address) => void;
}

export function AddressModal({
  open,
  onOpenChange,
  address,
  onSuccess,
}: AddressModalProps) {
  const {
    governorates,
    isLoadingGovs,
    createAddress,
    updateAddress,
    getAreasByGov,
    error,
    clearError,
  } = useAddresses();

  const [selectedGovId, setSelectedGovId] = useState<string>('');
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!address;

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      content: '',
      phone: '',
      area_id: '',
    },
  });

  // Initialize form when editing
  useEffect(() => {
    if (address && open) {
      form.reset({
        content: address.content,
        phone: address.phone,
        area_id: address.area_id?.toString() || '',
      });

      // Set governorate and areas for editing
      if (address.area?.gov_id) {
        setSelectedGovId(address.area.gov_id.toString());
        // Load areas for the selected governorate
        getAreasByGov(address.area.gov_id.toString()).then(setAvailableAreas);
      }
    } else if (!address && open) {
      // Reset form for new address
      form.reset({
        content: '',
        phone: '',
        area_id: '',
      });
      setSelectedGovId('');
      setAvailableAreas([]);
    }
  }, [address, open, form, getAreasByGov]);

  // Handle governorate change
  const handleGovernorateChange = async (govId: string) => {
    setSelectedGovId(govId);
    form.setValue('area_id', ''); // Reset area selection
    
    try {
      const areas = await getAreasByGov(govId);
      setAvailableAreas(areas);
    } catch (error) {
      console.error('Failed to load areas:', error);
      toast.error('Failed to load areas for selected governorate');
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);
      clearError();

      const addressInput: AddressInput = {
        content: data.content,
        phone: data.phone,
        area_id: data.area_id,
      };

      let savedAddress: Address;

      if (isEditing && address) {
        savedAddress = await updateAddress(address.id, addressInput);
        toast.success('Address updated successfully!');
      } else {
        savedAddress = await createAddress(addressInput);
        toast.success('Address created successfully!');
      }

      // Close modal and notify parent
      onOpenChange(false);
      onSuccess?.(savedAddress);

      // Reset form
      form.reset();
      setSelectedGovId('');
      setAvailableAreas([]);
    } catch (error: any) {
      console.error('Failed to save address:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedGovId('');
    setAvailableAreas([]);
    clearError();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your shipping address details below.'
              : 'Enter your address details below to create a new shipping address.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Governorate Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Governorate</label>
              <Select 
                value={selectedGovId} 
                onValueChange={handleGovernorateChange}
                disabled={isLoadingGovs || isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select governorate" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingGovs ? (
                    <SelectItem value="loading" disabled>
                      Loading governorates...
                    </SelectItem>
                  ) : governorates.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No governorates available
                    </SelectItem>
                  ) : (
                    governorates.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id.toString()}>
                        {gov.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Area Selection */}
            <FormField
              control={form.control}
              name="area_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedGovId || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAreas.length === 0 ? (
                        <SelectItem value="none" disabled>
                          {selectedGovId ? 'No areas available' : 'Please select a governorate first'}
                        </SelectItem>
                      ) : (
                        availableAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            <div className="flex flex-col">
                              <span>{area.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Shipping: EGP {area.shipping_cost}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter phone number..."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Building, street, landmark..."
                      className="min-h-[100px]"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Update Address' : 'Create Address'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}