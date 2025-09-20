"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useEffect } from "react";


function GoogleIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M21.35 11.1H12.18v2.8h4.99c-.3 1.8-1.7 3.2-3.6 3.2-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8c1.1 0 2.1.4 2.8 1.2l2.2-2.2C17.2 6.6 15 5.5 12.2 5.5c-3.9 0-7 3.1-7 7s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.9-.2-1.3z"
        />
      </svg>
    );
}

export default function SignUpPage() {
  const router = useRouter();
  const { user, signInWithGoogle, error, loading } = useAuth();
  
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);


  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <>
      <CardHeader className="text-center p-0 mb-6">
        <CardTitle className="text-3xl font-headline font-bold">Create an Account</CardTitle>
        <CardDescription className="pt-2">
          Get started by signing up with your Google account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <Button
          className="w-full h-12 text-base"
          onClick={handleGoogleSignIn}
          disabled={loading}
          size="lg"
        >
          {loading ? (
             <Loader2 className="animate-spin" />
          ) : (
            <>
                <GoogleIcon />
                Sign up with Google
            </>
          )}
        </Button>
         <CardDescription className="text-center !mt-6">
            Already have an account? <Link href="/sign-in" className="font-semibold text-primary hover:underline">Sign In</Link>
        </CardDescription>
      </CardContent>
    </>
  );
}
