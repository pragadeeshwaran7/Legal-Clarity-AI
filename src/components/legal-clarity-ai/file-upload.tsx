
"use client";

import { useEffect, useState, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, ScanSearch, Type, FileUp } from "lucide-react";
import { analyzeDocument } from "@/app/actions";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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
    const [state, formAction] = useFormState(analyzeDocument, {
        data: null, error: null, documentText: ""
    });
    
    const [pastedText, setPastedText] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSubmitDisabled = pastedText.trim().length < 20 && !fileName;

    useEffect(() => {
        if (state.data || state.error) {
            onAnalysisComplete(state.data, state.documentText, state.error);
        }
    }, [state, onAnalysisComplete]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setPastedText(''); // Clear text area if a file is selected
        }
    };

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPastedText(event.target.value);
        if (event.target.value) {
            setFileName(''); // Clear file if text is being entered
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center mb-4">
                    <Type className="h-8 w-8 text-primary"/>
                </div>
                <CardTitle className="font-headline text-3xl">Start Your Analysis</CardTitle>
                <CardDescription>
                    Paste your legal text or upload a PDF to get AI-powered insights.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="text-paste" className="sr-only">Paste your legal text below</Label>
                        <Textarea
                            id="text-paste"
                            name="text"
                            rows={10}
                            placeholder="e.g., This Agreement is made and entered into as of the Effective Date by and between..."
                            value={pastedText}
                            onChange={handleTextChange}
                            className="h-48"
                        />
                    </div>
                    
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file-upload">Upload a PDF</Label>
                        <div className="flex gap-2">
                            <Input id="file-upload" name="file" type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="flex-grow"/>
                        </div>
                         {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
                    </div>


                    {state?.error && (
                        <Alert variant="destructive">
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                     <SubmitButton disabled={isSubmitDisabled} />
                </form>
            </CardContent>
        </Card>
    );
}
