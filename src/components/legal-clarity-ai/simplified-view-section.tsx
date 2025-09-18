"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSimplified } from "@/app/actions";
import { Alert, AlertDescription } from "../ui/alert";

type SimplifiedViewSectionProps = {
  documentText: string;
};

export function SimplifiedViewSection({
  documentText,
}: SimplifiedViewSectionProps) {
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimplify = async () => {
    setIsLoading(true);
    setError(null);
    const { simplifiedText: text, error: err } = await getSimplified(
      documentText
    );
    setSimplifiedText(text);
    setError(err);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Simplified Document</CardTitle>
        <CardDescription>
          Translate complex legal jargon into plain, easy-to-understand language.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!simplifiedText && !isLoading && (
          <div className="text-center py-12 flex flex-col items-center gap-4 bg-dots rounded-lg">
            <h3 className="text-lg font-medium">Ready to simplify?</h3>
            <p className="text-muted-foreground">Click the button to generate a plain language version of your document.</p>
            <Button onClick={handleSimplify} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles className="mr-2" />
              )}
              Simplify Now
            </Button>
          </div>
        )}

        {isLoading && (
           <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-4" />
            <p>Simplifying your document...</p>
          </div>
        )}

        {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {simplifiedText && (
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <p className="text-sm whitespace-pre-wrap">{simplifiedText}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
