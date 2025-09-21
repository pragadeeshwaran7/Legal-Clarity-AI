
"use client";

import { useEffect, useRef, ChangeEvent, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FileUp, Loader2, ScanSearch, CheckCircle, XCircle, Type } from "lucide-react";
import { analyzeDocument, analyzeText } from "@/app/actions";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type FileUploadProps = {
  onAnalysisComplete: (result: AnalysisResult | null, text: string, name: string, error?: string | null) => void;
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
    const { getIdToken } = useAuth();
    const [idToken, setIdToken] = useState<string | null>(null);

    // Form state for file upload
    const [fileState, fileFormAction] = useFormState(analyzeDocument, {
        data: null, error: null, fileName: "", documentText: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state for text paste
    const [textState, textFormAction] = useFormState(analyzeText, {
        data: null, error: null, fileName: "", documentText: ""
    });
    const [pastedText, setPastedText] = useState<string>("");

    useEffect(() => {
        const fetchToken = async () => {
            const token = await getIdToken();
            setIdToken(token);
        };
        fetchToken();
    }, [getIdToken]);

    useEffect(() => {
        if (fileState.data || fileState.error) {
            onAnalysisComplete(fileState.data, fileState.documentText, fileState.fileName, fileState.error);
        }
    }, [fileState, onAnalysisComplete]);

    useEffect(() => {
        if (textState.data || textState.error) {
            onAnalysisComplete(textState.data, textState.documentText, textState.fileName, textState.error);
        }
    }, [textState, onAnalysisComplete]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) setFile(selectedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Start Your Analysis</CardTitle>
                <CardDescription>
                    Upload a document or paste text to get AI-powered legal insights instantly.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><FileUp className="mr-2"/>Upload File</TabsTrigger>
                        <TabsTrigger value="paste"><Type className="mr-2"/>Paste Text</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-6">
                        <form action={fileFormAction} className="space-y-6">
                            <input type="hidden" name="idToken" value={idToken || ''} />
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
                                            <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT files only</p>
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

                            {fileState?.error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{fileState.error}</AlertDescription>
                                </Alert>
                            )}

                            <SubmitButton disabled={!file} />
                        </form>
                    </TabsContent>
                    <TabsContent value="paste" className="mt-6">
                        <form action={textFormAction} className="space-y-6">
                            <input type="hidden" name="idToken" value={idToken || ''} />
                             <div className="space-y-2">
                                <Label htmlFor="text-paste">Paste your legal text below</Label>
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
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
