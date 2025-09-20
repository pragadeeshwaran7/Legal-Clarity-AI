
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Loader2, Sparkles, FileUp, CheckCircle, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getComparison } from "@/app/actions";
import { Alert, AlertDescription } from "../ui/alert";
import { Label } from "../ui/label";

type ComparisonSectionProps = {
  originalDocumentText: string;
};

export function ComparisonSection({
  originalDocumentText,
}: ComparisonSectionProps) {
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleCompare = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setComparisonResult(null);

    const formData = new FormData();
    formData.append("originalDocumentText", originalDocumentText);
    formData.append("file", file);

    const { comparison, error: err } = await getComparison(formData);
    setComparisonResult(comparison);
    setError(err);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Compare Documents</CardTitle>
        <CardDescription>
          Upload a second document to compare it against the original.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!comparisonResult && !isLoading && (
          <div className="text-center py-12 flex flex-col items-center gap-4 bg-dots rounded-lg">
            <h3 className="text-lg font-medium">Ready for a side-by-side comparison?</h3>
            <p className="text-muted-foreground max-w-md">
              Upload another document (e.g., a revised contract or a related agreement) to see how it stacks up.
            </p>
            <div className="w-full max-w-sm space-y-4">
               <div className="space-y-2">
                <Label htmlFor="file-upload-compare" className="sr-only">Upload Document</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload-input-compare"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Upload second document</span>
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT files</p>
                    </div>
                    <input id="file-upload-input-compare" name="file" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt"/>
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
              <Button onClick={handleCompare} disabled={isLoading || !file}>
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Users className="mr-2" />
                )}
                Compare Documents
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
           <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-4" />
            <p>Comparing documents...</p>
          </div>
        )}

        {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {comparisonResult && (
          <div className="space-y-4">
            <ScrollArea className="h-96 w-full rounded-md border p-4">
              <div
                className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: comparisonResult.replace(/\n/g, '<br />') }}
               />
            </ScrollArea>
             <Button onClick={() => { setComparisonResult(null); setFile(null); }} variant="outline">
              Start New Comparison
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
