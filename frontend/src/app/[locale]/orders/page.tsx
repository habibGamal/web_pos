'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  Package,
  Search,
  Filter,
  Eye,
  Calendar,
  CreditCard,
  Truck,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import type { OrderStatus, PaymentStatus } from '@/gql/graphql';

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

const formatOrderNumber = (orderId: string): string => {
  return `#${orderId.padStart(6, '0')}`;
};

export default function OrdersPage() {
  const t = useTranslations();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    orders,
    paginatorInfo: ordersPaginatorInfo,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useOrders({
    page: currentPage,
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: t('common.currencyCode'), // Should be dynamic based on locale
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Handle search and filters
  const handleSearch = () => {
    setCurrentPage(1);
    refetchOrders({
      first: 10,
      page: 1,
      status: statusFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    refetchOrders({ first: 10, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetchOrders({
      first: 10,
      page,
      status: statusFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };

  // Refresh orders
  const refreshOrders = () => {
    refetchOrders({
      first: 10,
      page: currentPage,
      status: statusFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };



  // Loading state
  if (ordersLoading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (ordersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <h2 className="font-semibold">{t('orders.error.title')}</h2>
            </div>
            <p className="text-red-700 mb-4">{ordersError?.message || 'An error occurred'}</p>
            <div className="flex gap-2">
              <Button onClick={refreshOrders}>
                {t('orders.error.retry')}
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
            {t('orders.backToHome')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('orders.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('orders.subtitle', { count: ordersPaginatorInfo?.total || 0 })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={ordersLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", ordersLoading && "animate-spin")} />
            {t('orders.refresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t('orders.filters')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('orders.filterOrders')}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('orders.filter.status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">{t('orders.filter.allStatuses')}</option>
                  <option value="PENDING">{t('orders.status.pending')}</option>
                  <option value="CONFIRMED">{t('orders.status.confirmed')}</option>
                  <option value="PROCESSING">{t('orders.status.processing')}</option>
                  <option value="SHIPPED">{t('orders.status.shipped')}</option>
                  <option value="DELIVERED">{t('orders.status.delivered')}</option>
                  <option value="CANCELLED">{t('orders.status.cancelled')}</option>
                  <option value="REFUNDED">{t('orders.status.refunded')}</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('orders.filter.dateFrom')}
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('orders.filter.dateTo')}
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Search Actions */}
              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="mr-2 h-4 w-4" />
                  {t('orders.filter.apply')}
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  {t('orders.filter.clear')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {orders.length === 0 && !ordersLoading && (
        <div className="text-center py-16">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('orders.empty.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {t('orders.empty.description')}
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              <Package className="mr-2 h-5 w-5" />
              {t('orders.empty.startShopping')}
            </Link>
          </Button>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <>
          <div className="space-y-4 mb-8">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">
                          {formatOrderNumber(order.id)}
                        </h3>
                        <Badge className={cn("text-xs font-medium", getOrderStatusColor(order.order_status))}>
                          {t(`orders.status.${order.order_status.toLowerCase()}`)}
                        </Badge>
                        <Badge className={cn("text-xs font-medium", getPaymentStatusColor(order.payment_status))}>
                          {t(`orders.payment.${order.payment_status.toLowerCase()}`)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          <span>{t('orders.itemCount', { count: order.items.length })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium">{formatPrice(order.total)}</span>
                        </div>
                        {order.tracking_number && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            <span className="font-mono text-xs">{order.tracking_number}</span>
                          </div>
                        )}
                      </div>

                      {/* Shipping Address Summary */}
                      {order.shipping_address && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">{t('orders.shippingTo')}:</span>{' '}
                          {order.shipping_address.area?.name}, {order.shipping_address.area?.gov?.name}
                        </div>
                      )}

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">{t('orders.notes')}:</span> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-auto">
                      <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('orders.viewDetails')}
                        </Link>
                      </Button>
                      
                      {order.can_be_cancelled && (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-red-600 hover:text-red-700">
                          {t('orders.cancel')}
                        </Button>
                      )}
                      
                      {order.can_be_returned && (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          {t('orders.requestReturn')}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                          {t('orders.orderItems')}:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{item.product.name}</p>
                                <p className="text-gray-500 text-xs">
                                  {t('orders.quantity')}: {item.quantity} × {formatPrice(item.unit_price)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-sm text-gray-500 italic">
                              {t('orders.andMoreItems', { count: order.items.length - 3 })}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {ordersPaginatorInfo && ordersPaginatorInfo.lastPage > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {t('orders.pagination.showing', {
                  from: ordersPaginatorInfo.firstItem || 0,
                  to: ordersPaginatorInfo.lastItem || 0,
                  total: ordersPaginatorInfo.total,
                })}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || ordersLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('orders.pagination.previous')}
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, ordersPaginatorInfo.lastPage) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > ordersPaginatorInfo.lastPage) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={ordersLoading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= ordersPaginatorInfo.lastPage || ordersLoading}
                >
                  {t('orders.pagination.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}