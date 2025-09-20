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
import { Scale } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  const handleDemoLogin = () => {
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <Scale className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-headline mt-4">Welcome to Legal Clarity AI</CardTitle>
        <CardDescription>
          This is a demo environment. Click below to proceed to the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={handleDemoLogin}
        >
          Continue to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}
