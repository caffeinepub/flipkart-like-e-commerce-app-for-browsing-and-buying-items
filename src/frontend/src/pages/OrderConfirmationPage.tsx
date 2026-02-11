import { useParams, Link } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/useQueries';
import QueryState from '../components/QueryState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, Home } from 'lucide-react';
import { formatPrice } from '../lib/money';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const { data: order, isLoading, isError, error } = useGetOrder(orderId);

  return (
    <div className="container px-4 py-8">
      <QueryState isLoading={isLoading} isError={isError} error={error} isEmpty={!order}>
        {order && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-bold">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your order. Your order ID is <span className="font-semibold">#{orderId}</span>
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{order.items.length} item(s)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Shipping Address</span>
                  <p className="mt-1 font-medium">{order.shippingAddress}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact Info</span>
                  <p className="mt-1 font-medium">{order.contactInfo}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1 gap-2">
                <Link to="/orders">
                  <Package className="h-4 w-4" />
                  View All Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 gap-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
