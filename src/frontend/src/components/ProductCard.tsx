import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import { formatPrice } from '../lib/money';
import type { Product } from '../backend';
import { useAddToCart } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link to="/product/$productId" params={{ productId: product.id.toString() }}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrls[0] || '/placeholder.png'}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-2 font-semibold text-foreground">{product.title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{Number(product.rating)}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
          </div>
          {Number(product.stock) < 10 && Number(product.stock) > 0 && (
            <p className="mt-2 text-xs text-destructive">Only {Number(product.stock)} left!</p>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={addToCart.isPending || Number(product.stock) === 0}
            className="w-full gap-2"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4" />
            {Number(product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
