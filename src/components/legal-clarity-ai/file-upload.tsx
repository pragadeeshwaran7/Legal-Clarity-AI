"use client";

import { useEffect, useRef, ChangeEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FileUp, Loader2, ScanSearch } from "lucide-react";

import { analyzeDocument } from "@/app/actions";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

type FileUploadProps = {
  onAnalysisComplete: (result: AnalysisResult | null, text: string) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
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
  const [state, formAction] = useFormState(analyzeDocument, {
    data: null,
    error: null,
  });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.data) {
      const text = formRef.current?.documentText.value ?? "";
      onAnalysisComplete(state.data, text);
    }
  }, [state, onAnalysisComplete]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we are just reading the file as plain text.
    // In a real application, you would use libraries to parse PDF and DOCX files.
    // This is a simplified example.
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (textAreaRef.current) {
        textAreaRef.current.value = text;
      }
      toast({
        title: "File Loaded",
        description: `${file.name} content has been loaded into the text area.`,
      });
    };
    reader.onerror = () => {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read the file.",
      });
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Start Your Analysis</CardTitle>
        <CardDescription>
          Upload a document or paste the text to get AI-powered legal insights.
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
                  <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT files</p>
                </div>
                <input id="file-upload-input" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt"/>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentText">Document Text</Label>
            <Textarea
              id="documentText"
              name="documentText"
              ref={textAreaRef}
              placeholder="Paste the full text of your legal document here..."
              className="min-h-[250px] text-sm"
              required
            />
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
