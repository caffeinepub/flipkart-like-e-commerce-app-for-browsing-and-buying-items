import { Link } from '@tanstack/react-router';
import { useGetUserOrders } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import QueryState from '../components/QueryState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatPrice } from '../lib/money';
import { Package, AlertCircle, ChevronRight } from 'lucide-react';

export default function OrdersPage() {
  const { identity } = useInternetIdentity();
  const { data: orders = [], isLoading, isError, error, refetch } = useGetUserOrders();

  if (!identity) {
    return (
      <div className="container px-4 py-16">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your orders.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={orders.length === 0}
        emptyMessage="You haven't placed any orders yet. Start shopping!"
        onRetry={refetch}
      >
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id.toString()} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Order #{order.id.toString()}</span>
                      <Badge>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item(s) • {formatPrice(order.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                  </div>
                  <Button asChild variant="outline" className="gap-2">
                    <Link to="/orders/$orderId" params={{ orderId: order.id.toString() }}>
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
