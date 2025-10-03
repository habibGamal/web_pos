'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useOrder } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  User,
  Phone,
  FileText,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { ProductImageWithFallback } from '@/components/ImageWithFallback';
import { resolveImageSrc } from '@/lib/image';
import type { OrderStatus, PaymentStatus, ReturnStatus } from '@/gql/graphql';

// Utility functions
const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800';
    case 'PROCESSING':
      return 'bg-purple-100 text-purple-800';
    case 'SHIPPED':
      return 'bg-indigo-100 text-indigo-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800';
    case 'REFUNDED':
      return 'bg-blue-100 text-blue-800';
    case 'PARTIALLY_REFUNDED':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getReturnStatusColor = (status: ReturnStatus): string => {
  switch (status) {
    case 'REQUESTED':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'RECEIVED':
      return 'bg-purple-100 text-purple-800';
    case 'REFUNDED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatOrderNumber = (orderId: string): string => {
  return `#${orderId.padStart(6, '0')}`;
};

export default function OrderDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const { 
    order,
    loading: orderLoading,
    error: orderError,
    refetch: refetchOrder
  } = useOrder({ id: orderId });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: t('common.currencyCode'), // Should be dynamic based on locale
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatDateShort = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Note: Order cancellation and returns would require separate mutation hooks
  // For now, these features are disabled in the UI

  // Order data is automatically fetched by the hook
  // No need for manual initialization

  // Loading state
  if (orderLoading && !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (orderError || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h2 className="font-semibold">{t('order.error.title')}</h2>
            </div>
            <p className="text-red-700 mb-4">
              {orderError?.message || t('order.error.notFound')}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => refetchOrder()}>
                {t('order.error.retry')}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/orders">
                  {t('order.backToOrders')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('order.backToOrders')}
          </Button>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {formatOrderNumber(order.id)}
            </h1>
            <Badge className={cn("text-sm font-medium", getOrderStatusColor(order.order_status))}>
              {t(`orders.status.${order.order_status.toLowerCase()}`)}
            </Badge>
            <Badge className={cn("text-sm font-medium", getPaymentStatusColor(order.payment_status))}>
              {t(`orders.payment.${order.payment_status.toLowerCase()}`)}
            </Badge>
          </div>
          <p className="text-gray-600">
            {t('order.placedOn')} {formatDate(order.created_at)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchOrder()}
            disabled={orderLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", orderLoading && "animate-spin")} />
            {t('order.refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('order.orderItems')} ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
                      {item.product.featured_image ? (
                        <ProductImageWithFallback
                          src={resolveImageSrc(item.product.featured_image)}
                          alt={item.product.name}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          <Link 
                            href={`/products/${item.product.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        {item.variant?.name && (
                          <p className="text-sm text-gray-600">
                            {t('order.variant')}: {item.variant.name}
                          </p>
                        )}
                        {item.variant?.sku && (
                          <p className="text-xs text-gray-500">
                            {t('order.sku')}: {item.variant.sku}
                          </p>
                        )}
                        {/* Display product options */}
                        {item.options && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(JSON.parse(item.options)).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>{t('order.quantity')}: {item.quantity}</span>
                        <span className="mx-2">×</span>
                        <span className="font-medium">{formatPrice(item.unit_price)}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatPrice(item.total_price)}
                        </p>
                        {item.returnable_quantity > 0 && (
                          <p className="text-xs text-green-600">
                            {t('order.returnableQty', { qty: item.returnable_quantity })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>



          {/* Returns */}
          {order.returns && order.returns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  {t('order.returns')} ({order.returns.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.returns.map((returnOrder) => (
                  <div key={returnOrder.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/returns/${returnOrder.id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {returnOrder.return_number}
                        </Link>
                        <Badge className={cn("text-xs", getReturnStatusColor(returnOrder.status))}>
                          {t(`returns.status.${returnOrder.status.toLowerCase()}`)}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDateShort(returnOrder.created_at)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{t(`returns.reason.${returnOrder.reason.toLowerCase()}`)}</p>
                      <p className="font-medium">
                        {t('order.refundAmount', { amount: formatPrice(returnOrder.refund_amount) })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('order.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('order.subtotal')}</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>{t('order.shipping')}</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('order.discount')}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('order.total')}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('order.shippingInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{t('order.shippingAddress')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {order.shipping_address.content}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shipping_address.area?.name}, {order.shipping_address.area?.gov?.name}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{order.shipping_address.phone}</span>
              </div>
              
              {order.tracking_number && (
                <div>
                  <p className="font-medium text-sm">{t('order.trackingNumber')}</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {order.tracking_number}
                  </p>
                </div>
              )}
              
              {order.estimated_delivery_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span>
                    {t('order.estimatedDelivery')}: {formatDateShort(order.estimated_delivery_date)}
                  </span>
                </div>
              )}
              
              {order.delivered_at && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {t('order.deliveredOn')}: {formatDateShort(order.delivered_at)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('order.paymentInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('order.paymentStatus')}
                  </span>
                  <Badge className={cn("text-xs", getPaymentStatusColor(order.payment_status))}>
                    {t(`orders.payment.${order.payment_status.toLowerCase()}`)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{t('order.totalAmount')}: {formatPrice(order.total)}</p>
                  <p className="text-xs">{t('order.orderDate')}: {formatDate(order.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('order.orderNotes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}