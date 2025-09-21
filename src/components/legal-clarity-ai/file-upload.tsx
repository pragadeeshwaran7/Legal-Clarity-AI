
"use client";

import { useEffect, useRef, ChangeEvent, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { FileUp, Loader2, ScanSearch, CheckCircle, XCircle } from "lucide-react";
import { analyzeDocument } from "@/app/actions";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

type FileUploadProps = {
  onAnalysisComplete: (result: AnalysisResult | null, text: string, name: string, error?: string | null) => void;
};

function SubmitButton({ file }: { file: File | null }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || !file}>
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <ScanSearch />
          Analyze Document
        </>
      )}
    </Button>
  );
}

export function FileUpload({ onAnalysisComplete }: FileUploadProps) {
    const { getIdToken } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState(analyzeDocument, {
        data: null,
        error: null,
        fileName: "",
        documentText: "",
    });
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isPending && (state.data || state.error)) {
            onAnalysisComplete(state.data, state.documentText, state.fileName, state.error);
        }
    }, [state, isPending, onAnalysisComplete]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    // This wrapper function allows us to add the auth token to the request headers
    // before the form action is called.
    const formActionWrapper = async (formData: FormData) => {
        const token = await getIdToken();
        const headers = new Headers();
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }
        
        // This is a way to get the action bound with the headers.
        const boundAction = analyzeDocument.bind(null, state);
        
        // The `useActionState` hook doesn't easily allow modifying the request.
        // Instead, we will submit the form with a temporary `fetch` that includes the header.
        // This is a common pattern to work around this limitation.
        
        // Let's call the action directly. The action itself reads from `headers()`.
        // We just need to make sure the client actually sends it.
        // We can do this by wrapping the action call.
        
        const originalFetch = fetch;
        window.fetch = (url, options) => {
            const newOptions = {
                ...options,
                headers: {
                    ...options?.headers,
                    'Authorization': `Bearer ${token}`,
                },
            };
            return originalFetch(url, newOptions);
        };

        formAction(formData);

        window.fetch = originalFetch; // Restore original fetch
    };

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Start Your Analysis</CardTitle>
                <CardDescription>
                    Upload a document to get AI-powered legal insights instantly. Secure and confidential.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    ref={formRef}
                    action={formActionWrapper}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="file-upload" className="sr-only">Upload Document</Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="file-upload-input"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-10 h-10 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-lg text-muted-foreground">
                                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT files</p>
                                </div>
                                <input id="file-upload-input" name="file" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                            </label>
                        </div>
                        {file && (
                            <div className="mt-4 flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <CheckCircle className="text-green-500 shrink-0" />
                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                                    <XCircle className="text-red-500" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {state?.error && (
                        <Alert variant="destructive">
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    <SubmitButton file={file} />
                </form>
            </CardContent>
        </Card>
    );
}
