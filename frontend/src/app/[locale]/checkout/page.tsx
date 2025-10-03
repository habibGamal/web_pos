"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useCheckout } from '@/hooks/use-checkout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ShoppingCart, CreditCard, MapPin, Truck, AlertCircle, Plus } from 'lucide-react';
import EmptyState from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { useAddresses } from '@/hooks/use-addresses';
import { AddressModal, AddressList } from '@/components/address';
import type { PaymentMethod, Address } from '@/gql/graphql';

// Form Schema
const checkoutSchema = z.object({
  shipping_address_id: z.number().min(1, 'Please select a shipping address'),
  payment_method: z.enum(['CASH_ON_DELIVERY', 'CREDIT_CARD', 'WALLET'] as const),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS = [
  { 
    value: 'CASH_ON_DELIVERY', 
    label: 'Cash on Delivery', 
    description: 'Pay when you receive your order',
    icon: '💰'
  },
  { 
    value: 'CREDIT_CARD', 
    label: 'Credit/Debit Card', 
    description: 'Pay securely online with your card',
    icon: '💳'
  },
  { 
    value: 'WALLET', 
    label: 'Digital Wallet', 
    description: 'Pay with your digital wallet',
    icon: '📱'
  },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, cartItems, totalPrice, isEmpty, isLoading: cartLoading } = useCart();
  const { createOrder, isProcessing, error: checkoutError } = useCheckout();
  const { addresses, isLoading: addressesLoading, getShippingCost } = useAddresses();
  const [selectedShippingCost, setSelectedShippingCost] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_address_id: addresses[0]?.id ? parseInt(addresses[0].id) : 0,
      payment_method: 'CASH_ON_DELIVERY',
      notes: '',
    },
  });

  const watchAddressId = form.watch('shipping_address_id');
  const watchPaymentMethod = form.watch('payment_method');

  // Update shipping cost when address changes
  useEffect(() => {
    const selectedAddress = addresses.find(addr => parseInt(addr.id) === watchAddressId);
    if (selectedAddress && selectedAddress.area) {
      setSelectedShippingCost(selectedAddress.area.shipping_cost);
    }
  }, [watchAddressId, addresses]);

  // Calculate totals
  const subtotal = totalPrice;
  const shipping = selectedShippingCost;
  const discount = 0; // TODO: Implement discount logic
  const finalTotal = subtotal + shipping - discount;

  // Address handling functions
  const handleAddressSelect = (address: Address) => {
    form.setValue('shipping_address_id', parseInt(address.id));
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleAddressModalSuccess = (address: Address) => {
    // Auto-select the newly created/updated address
    form.setValue('shipping_address_id', parseInt(address.id));
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (isEmpty) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const order = await createOrder({
        shipping_address_id: data.shipping_address_id,
        payment_method: data.payment_method as PaymentMethod,
        notes: data.notes || undefined,
      });

      toast.success('Order created successfully!');

      // Handle payment based on method
      if (data.payment_method === 'CASH_ON_DELIVERY') {
        // For COD, redirect to order confirmation
        router.push(`/orders/${order.id}`);
      } else {
        // For other payment methods, redirect to payment page
        router.push(`/payments/${order.id}`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to process checkout');
    }
  };

  // Loading state
  if (cartLoading || addressesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to your cart before checkout</p>
          <Button 
            onClick={() => router.push('/products')}
            className="min-w-[200px]"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // No addresses state
  if (!addressesLoading && addresses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Complete your order by adding a shipping address and selecting a payment method.
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No shipping addresses</h2>
          <p className="text-muted-foreground mb-6">You need to add a shipping address before checkout</p>
          <Button 
            onClick={handleAddNewAddress}
            className="min-w-[200px]"
          >
            Add Address
          </Button>
        </div>
        
        <AddressModal
          open={showAddressModal}
          onOpenChange={setShowAddressModal}
          address={editingAddress}
          onSuccess={handleAddressModalSuccess}
        />
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground mt-2">
          Complete your order by selecting your shipping address and payment method.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewAddress}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddressList
                  selectedAddressId={watchAddressId?.toString()}
                  onAddressSelect={handleAddressSelect}
                  onEditAddress={handleEditAddress}
                />

                {/* No Address Selected Warning */}
                {!watchAddressId && addresses.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        Please select a shipping address to continue
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid gap-3">
                          {PAYMENT_METHODS.map((method) => (
                            <div
                              key={method.value}
                              className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                                field.value === method.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => field.onChange(method.value)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className={`w-4 h-4 rounded-full border-2 ${
                                    field.value === method.value
                                      ? 'border-primary bg-primary'
                                      : 'border-border'
                                  }`}>
                                    {field.value === method.value && (
                                      <div className="w-full h-full rounded-full bg-white scale-50" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{method.icon}</span>
                                    <h4 className="font-medium">{method.label}</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {method.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          className="w-full min-h-[100px] px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Any special instructions for your order..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Error Display */}
            {checkoutError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">{checkoutError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                        {item.product.featured_image ? (
                          <img
                            src={item.product.featured_image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          {item.variant?.name && (
                            <span>{item.variant.name} • </span>
                          )}
                          <span>Qty: {item.quantity}</span>
                        </div>
                        {item.options && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(JSON.parse(item.options)).map(([key, value]) => (
                              <span key={key} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        EGP {item.total_price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>EGP {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>EGP {shipping.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-EGP {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>EGP {finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Info */}
                {watchPaymentMethod && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {PAYMENT_METHODS.find(m => m.value === watchPaymentMethod)?.icon}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {PAYMENT_METHODS.find(m => m.value === watchPaymentMethod)?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {PAYMENT_METHODS.find(m => m.value === watchPaymentMethod)?.description}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing || isEmpty || !watchAddressId || addresses.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Complete Order • EGP ${finalTotal.toFixed(2)}`
                  )}
                </Button>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Secure Checkout</p>
                    <p>Your payment information is encrypted and secure.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      {/* Address Modal */}
      <AddressModal
        open={showAddressModal}
        onOpenChange={setShowAddressModal}
        address={editingAddress}
        onSuccess={handleAddressModalSuccess}
      />
    </div>
  );
}
