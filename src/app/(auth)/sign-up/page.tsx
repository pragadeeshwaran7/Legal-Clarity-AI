"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scale, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";


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
  const { signInWithGoogle, error, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <Scale className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-headline mt-4">Create an Account</CardTitle>
        <CardDescription>
          Get started by signing up with your Google account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <Button
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
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
         <CardDescription className="text-center">
            Already have an account? <Link href="/sign-in" className="text-primary hover:underline">Sign In</Link>
        </CardDescription>
      </CardContent>
    </Card>
  );
}
