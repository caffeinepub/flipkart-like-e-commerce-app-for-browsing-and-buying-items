import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useGetAllProducts } from '../hooks/useQueries';
import QueryState from '../components/QueryState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../lib/money';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function CartPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [], isLoading, isError, error, refetch } = useGetCart();
  const { data: products = [] } = useGetAllProducts();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const productMap = new Map(products.map(p => [p.id, p]));

  const cartItems = cart.map(item => ({
    ...item,
    product: productMap.get(item.productId),
  })).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + Number(item.product.price * item.quantity);
  }, 0);

  const handleUpdateQuantity = async (productId: bigint, newQuantity: number) => {
    try {
      await updateCartItem.mutateAsync({ productId, quantity: BigInt(newQuantity) });
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!identity) {
      toast.error('Please sign in to proceed to checkout');
      return;
    }
    navigate({ to: '/checkout' });
  };

  return (
    <div className="container px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={cartItems.length === 0}
        emptyMessage="Your cart is empty. Start shopping!"
        emptyImage="/assets/generated/empty-cart.dim_800x600.png"
        onRetry={refetch}
      >
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => {
              if (!item.product) return null;
              const maxQuantity = Number(item.product.stock);

              return (
                <Card key={item.productId.toString()}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.product.imageUrls[0] || '/placeholder.png'}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-semibold">{item.product.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.product.category}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.productId, Number(item.quantity) - 1)}
                              disabled={Number(item.quantity) <= 1 || updateCartItem.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{Number(item.quantity)}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.productId, Number(item.quantity) + 1)}
                              disabled={Number(item.quantity) >= maxQuantity || updateCartItem.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(item.productId)}
                              disabled={removeFromCart.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(BigInt(subtotal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">FREE</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(BigInt(subtotal))}</span>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  size="lg"
                  className="mt-6 w-full gap-2"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Proceed to Checkout
                </Button>
                {!identity && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Sign in to place your order
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </QueryState>
    </div>
  );
}
