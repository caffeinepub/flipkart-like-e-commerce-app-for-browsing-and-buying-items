import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function AuthButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoading = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoading}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Signing in...</span>
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{userProfile?.name || 'Sign out'}</span>
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Sign in</span>
        </>
      )}
    </Button>
  );
}
