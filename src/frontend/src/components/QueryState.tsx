import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QueryStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyImage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export default function QueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = 'No items found',
  emptyImage,
  onRetry,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mt-2">
            {error?.message || 'Something went wrong. Please try again.'}
          </AlertDescription>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
              Retry
            </Button>
          )}
        </Alert>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <div className="text-center">
          {emptyImage && (
            <img src={emptyImage} alt="Empty" className="mx-auto mb-6 h-48 w-auto opacity-50" />
          )}
          <p className="text-lg text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
