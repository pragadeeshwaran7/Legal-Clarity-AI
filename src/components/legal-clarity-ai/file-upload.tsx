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
        <ScanSearch />
      )}
      Analyze Document
    </Button>
  );
}

export function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [state, formAction, isPending] = useActionState(analyzeDocument, {
    data: null,
    error: null,
    fileName: "",
    documentText: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (state.data || state.error) {
      onAnalysisComplete(state.data, state.documentText, state.fileName, state.error);
    }
  }, [state, onAnalysisComplete]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }


  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Start Your Analysis</CardTitle>
        <CardDescription>
          Upload a document to get AI-powered legal insights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload Document</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload-input"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, PNG, or JPG files</p>
                </div>
                <input id="file-upload-input" name="file" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"/>
              </label>
            </div>
            {file && (
                 <div className="mt-4 flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                        <XCircle className="text-red-500" />
                    </Button>
                 </div>
            )}
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <SubmitButton file={file}/>
        </form>
      </CardContent>
    </Card>
  );
}
