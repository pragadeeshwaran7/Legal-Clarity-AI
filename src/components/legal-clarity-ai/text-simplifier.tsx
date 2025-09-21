
"use client";

import { useState } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { simplifyText } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';

type TextSimplifierProps = {
    documentText: string;
};

export function TextSimplifier({ documentText }: TextSimplifierProps) {
    const [textToSimplify, setTextToSimplify] = useState('');
    const [simplifiedText, setSimplifiedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSimplify = async () => {
        if (!textToSimplify.trim()) {
            setError("Please paste some text to simplify.");
            return;
        }

        setIsLoading(true);
        setSimplifiedText('');
        setError(null);

        const formData = new FormData();
        formData.append("text", textToSimplify);

        const result = await simplifyText(formData);

        if (result.simplifiedText) {
            setSimplifiedText(result.simplifiedText);
        } else {
            setError(result.error || "Failed to simplify the text.");
        }
        setIsLoading(false);
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="font-headline">Text Simplifier</CardTitle>
                <CardDescription>Paste any complex clause or text from your document to get a plain English version.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Paste text here to simplify..."
                            value={textToSimplify}
                            onChange={(e) => setTextToSimplify(e.target.value)}
                            rows={8}
                        />
                    </div>
                    <div className="space-y-2">
                         <div className="rounded-md border bg-muted h-full min-h-[150px] p-3 text-sm">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <p>{simplifiedText || 'Simplified text will appear here...'}</p>
                            )}
                        </div>
                    </div>
                </div>
                 {error && <p className="text-destructive text-sm text-center">{error}</p>}
                <div className="flex justify-center">
                    <Button onClick={handleSimplify} disabled={isLoading || !textToSimplify.trim()}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Simplifying...' : 'Simplify Text'}
                    </Button>
                </div>
            </CardContent>
        </>
    );
}
