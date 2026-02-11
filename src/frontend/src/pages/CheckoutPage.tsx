import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useGetAllProducts, usePlaceOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatPrice } from '../lib/money';
import { validateCheckoutForm, type CheckoutFormData, type ValidationErrors } from '../lib/validation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [] } = useGetCart();
  const { data: products = [] } = useGetAllProducts();
  const placeOrder = usePlaceOrder();

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const productMap = new Map(products.map(p => [p.id, p]));

  const cartItems = cart.map(item => ({
    ...item,
    product: productMap.get(item.productId),
  })).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + Number(item.product.price * item.quantity);
  }, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please sign in to place an order');
      return;
    }

    const validationErrors = validateCheckoutForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const shippingAddress = `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ', ' : ''}${formData.city}, ${formData.postalCode}`;
    const contactInfo = `${formData.name}, ${formData.email}, ${formData.phone}`;

    try {
      const order = await placeOrder.mutateAsync({ shippingAddress, contactInfo });
      toast.success('Order placed successfully!');
      navigate({ to: '/order-confirmation/$orderId', params: { orderId: order.id.toString() } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (!identity) {
    return (
      <div className="container px-4 py-16">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to proceed with checkout.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-16">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your cart is empty. Add items before checking out.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={errors.addressLine1 ? 'border-destructive' : ''}
                  />
                  {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={errors.postalCode ? 'border-destructive' : ''}
                    />
                    {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    💵 Cash on Delivery (Demo) - No payment processing in this demo
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    item.product && (
                      <div key={item.productId.toString()} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product.title} × {Number(item.quantity)}
                        </span>
                        <span>{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    )
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(BigInt(subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(BigInt(subtotal))}</span>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={placeOrder.isPending}>
                  {placeOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
