"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from '@/hooks/use-auth';


function HomeLogic() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the loading state is settled
    if (!loading) {
      if (user) {
        // If user is logged in, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // If no user, redirect to sign in
        router.replace('/sign-in');
      }
    }
  }, [user, loading, router]);

  // While loading, show a spinner to prevent flicker
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

export default function Home() {
    return (
        <AuthProvider>
            <HomeLogic />
        </AuthProvider>
    )
}
