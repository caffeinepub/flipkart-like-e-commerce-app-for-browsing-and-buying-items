import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct } from '../hooks/useQueries';
import { useAddToCart } from '../hooks/useQueries';
import QueryState from '../components/QueryState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Star, ArrowLeft, Minus, Plus } from 'lucide-react';
import { formatPrice } from '../lib/money';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error, refetch } = useGetProduct(productId);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(quantity) });
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const maxQuantity = product ? Number(product.stock) : 1;

  return (
    <div className="container px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/catalog' })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Button>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!product}
        emptyMessage="Product not found"
        onRetry={refetch}
      >
        {product && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                <img
                  src={product.imageUrls[selectedImage] || '/placeholder.png'}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {product.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt={`${product.title} ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-2">{product.category}</Badge>
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-semibold">{Number(product.rating)}</span>
                  </div>
                  <span className="text-muted-foreground">Rating</span>
                </div>
              </div>

              <div className="border-y py-4">
                <div className="text-4xl font-bold text-primary">{formatPrice(product.price)}</div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-2 font-semibold">Product Details</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Stock:</span>
                  {Number(product.stock) > 0 ? (
                    <Badge variant="secondary">{Number(product.stock)} available</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>

                {Number(product.stock) > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || Number(product.stock) === 0}
                  size="lg"
                  className="w-full gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {Number(product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  );
}
