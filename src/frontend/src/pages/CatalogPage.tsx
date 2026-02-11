import { useState, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useGetAllProducts } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import QueryState from '../components/QueryState';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CATEGORIES } from '../lib/categories';
import { Search } from 'lucide-react';

export default function CatalogPage() {
  const searchParams = useSearch({ from: '/catalog' }) as { q?: string; category?: string };
  const { data: products = [], isLoading, isError, error, refetch } = useGetAllProducts();

  const [searchTerm, setSearchTerm] = useState(searchParams.q || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || 'all');
  const [sortBy, setSortBy] = useState('relevance');
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => Number(a.price - b.price));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => Number(b.price - a.price));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => Number(b.rating - a.rating));
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-3xl font-bold">Browse Products</h1>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {visibleProducts.length} of {filteredProducts.length} products
        </div>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={filteredProducts.length === 0}
        emptyMessage="No products found. Try adjusting your filters."
        emptyImage="/assets/generated/empty-cart.dim_800x600.png"
        onRetry={refetch}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id.toString()} product={product} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="rounded-lg border bg-background px-6 py-3 font-medium transition-colors hover:bg-muted"
            >
              Load More Products
            </button>
          </div>
        )}
      </QueryState>
    </div>
  );
}
