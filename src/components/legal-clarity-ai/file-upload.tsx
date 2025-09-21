
"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, ScanSearch, Type } from "lucide-react";
import { analyzeText } from "@/app/actions";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

type FileUploadProps = {
  onAnalysisComplete: (result: AnalysisResult | null, text: string, error?: string | null) => void;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || disabled}>
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2" />
          Analyzing...
        </>
      ) : (
        <>
          <ScanSearch className="mr-2"/>
          Analyze Now
        </>
      )}
    </Button>
  );
}

export function FileUpload({ onAnalysisComplete }: FileUploadProps) {
    const [textState, textFormAction] = useFormState(analyzeText, {
        data: null, error: null, documentText: ""
    });
    const [pastedText, setPastedText] = useState<string>("");

    useEffect(() => {
        if (textState.data || textState.error) {
            onAnalysisComplete(textState.data, textState.documentText, textState.error);
        }
    }, [textState, onAnalysisComplete]);

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center mb-4">
                    <Type className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle className="font-headline text-3xl">Start Your Analysis</CardTitle>
                <CardDescription>
                    Paste your legal text to get AI-powered insights instantly.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={textFormAction} className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="text-paste" className="sr-only">Paste your legal text below</Label>
                        <Textarea
                            id="text-paste"
                            name="text"
                            rows={10}
                            placeholder="e.g., This Agreement is made and entered into as of the Effective Date by and between..."
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            className="h-48"
                        />
                    </div>

                    {textState?.error && (
                        <Alert variant="destructive">
                            <AlertDescription>{textState.error}</AlertDescription>
                        </Alert>
                    )}
                     <SubmitButton disabled={pastedText.trim().length < 20} />
                </form>
            </CardContent>
        </Card>
    );
}
