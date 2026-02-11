import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AuthButton from './AuthButton';
import { useGetCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [] } = useGetCart();
  const { data: userProfile } = useGetCallerUserProfile();
  const [searchTerm, setSearchTerm] = useState('');

  const cartItemCount = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate({ to: '/catalog', search: { q: searchTerm } });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/generated/app-logo.dim_256x256.png" alt="Logo" className="h-10 w-10" />
          <span className="hidden text-xl font-bold text-primary sm:inline-block">ShopHub</span>
        </Link>

        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <nav className="flex items-center gap-2">
          {identity && (
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/orders">
                Orders
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs" variant="destructive">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>

          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
