
"use client";

import { useEffect, useState } from "react";
import { Loader2, History, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAnalysisHistory } from "@/app/actions";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AnalysisHistoryItem = {
  id: string;
  fileName: string;
  summary: string;
  createdAt: string;
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      const { history: fetchedHistory, error: fetchError } = await getAnalysisHistory();
      
      if (fetchError) {
        setError(fetchError);
      } else if (fetchedHistory) {
        setHistory(fetchedHistory.map(item => ({
            ...item,
            // Ensure createdAt is a string for display
            createdAt: new Date(item.createdAt).toLocaleString()
        })));
      }
      setIsLoading(false);
    }

    fetchHistory();
  }, [user]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <History className="h-8 w-8" />
          Analysis History
        </h1>
        <p className="text-muted-foreground mt-2">
          Review your previously analyzed documents.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && history.length === 0 && (
        <Card className="text-center py-16 bg-dots">
          <CardHeader>
            <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
            <CardTitle className="mt-4">No History Yet</CardTitle>
            <CardDescription>
              Your analyzed documents will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && history.length > 0 && (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{item.fileName}</CardTitle>
                <CardDescription>
                  Analyzed on {item.createdAt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
