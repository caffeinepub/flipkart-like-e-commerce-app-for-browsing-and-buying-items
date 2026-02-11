import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES } from '../lib/categories';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container px-4 py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Shop Everything You Love
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Discover amazing products at unbeatable prices. From electronics to fashion, we have it all.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/catalog">
                    Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/hero-banner.dim_1600x600.png"
                alt="Shopping"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <p className="mt-2 text-muted-foreground">Browse our wide range of products</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to="/catalog"
              search={{ category: category.id }}
            >
              <Card className="group cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 text-5xl transition-transform group-hover:scale-110">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 text-4xl">🚚</div>
              <h3 className="mb-2 text-xl font-semibold">Fast Delivery</h3>
              <p className="text-muted-foreground">Get your orders delivered quickly and safely</p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="mb-2 text-xl font-semibold">Secure Shopping</h3>
              <p className="text-muted-foreground">Shop with confidence using Internet Identity</p>
            </div>
            <div className="text-center">
              <div className="mb-4 text-4xl">💯</div>
              <h3 className="mb-2 text-xl font-semibold">Quality Products</h3>
              <p className="text-muted-foreground">Only the best products for our customers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
