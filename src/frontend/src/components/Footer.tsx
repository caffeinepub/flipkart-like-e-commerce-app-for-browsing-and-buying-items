import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'unknown-app';

  return (
    <footer className="border-t bg-muted/30 py-8">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} ShopHub. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-4 w-4 fill-primary text-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
