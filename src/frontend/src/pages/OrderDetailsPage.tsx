import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder, useGetAllProducts } from '../hooks/useQueries';
import QueryState from '../components/QueryState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { formatPrice } from '../lib/money';

export default function OrderDetailsPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading, isError, error, refetch } = useGetOrder(orderId);
  const { data: products = [] } = useGetAllProducts();

  const productMap = new Map(products.map(p => [p.id, p]));

  return (
    <div className="container px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/orders' })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Button>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!order}
        emptyMessage="Order not found"
        onRetry={refetch}
      >
        {order && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Order #{orderId}</h1>
              <Badge className="text-base">{order.status}</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.items.map((item) => {
                      const product = productMap.get(item.productId);
                      if (!product) return null;

                      return (
                        <div key={item.productId.toString()} className="flex gap-4">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            <img
                              src={product.imageUrls[0] || '/placeholder.png'}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-1 justify-between">
                            <div>
                              <h3 className="font-semibold">{product.title}</h3>
                              <p className="text-sm text-muted-foreground">Quantity: {Number(item.quantity)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatPrice(product.price * item.quantity)}</p>
                              <p className="text-sm text-muted-foreground">{formatPrice(product.price)} each</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">FREE</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-semibold">Shipping Address</h3>
                      <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                    </div>

                    <div>
                      <h3 className="mb-2 font-semibold">Contact Information</h3>
                      <p className="text-sm text-muted-foreground">{order.contactInfo}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
