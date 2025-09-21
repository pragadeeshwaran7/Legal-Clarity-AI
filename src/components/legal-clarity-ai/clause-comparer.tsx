
"use client";

import { useState } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAmendment } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnalysisResult } from '@/lib/types';
import { Loader2, Sparkles } from 'lucide-react';
import { Separator } from '../ui/separator';

type ClauseComparerProps = {
    detailedRisks: AnalysisResult['detailedRisks'];
};

export function ClauseComparer({ detailedRisks }: ClauseComparerProps) {
    const amendableRisks = detailedRisks.filter(risk => risk.riskLevel !== 'Low');
    const [selectedClause, setSelectedClause] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<{ suggestedAmendment: string, explanation: string} | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSuggestAmendment = async () => {
        if (!selectedClause) return;

        const risk = amendableRisks.find(r => r.clause === selectedClause);
        if (!risk) return;

        setIsLoading(true);
        setSuggestion(null);
        setError(null);

        const formData = new FormData();
        formData.append("originalClause", risk.clause);
        formData.append("riskExplanation", `${risk.explanation} ${risk.complianceIssues}`);

        const result = await getAmendment(formData);

        if (result.suggestedAmendment && result.explanation) {
            setSuggestion({ suggestedAmendment: result.suggestedAmendment, explanation: result.explanation });
        } else {
            setError(result.error || "Failed to generate an amendment.");
        }
        setIsLoading(false);
    };

    const getSelectedRisk = () => {
        if (!selectedClause) return null;
        return amendableRisks.find(r => r.clause === selectedClause);
    }

    return (
        <>
            <CardHeader>
                <CardTitle className="font-headline">Clause Comparer</CardTitle>
                <CardDescription>Select a risky clause to see an AI-powered suggestion for improvement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Select onValueChange={setSelectedClause} value={selectedClause || ''}>
                        <SelectTrigger className="flex-grow">
                            <SelectValue placeholder="Select a risky clause..." />
                        </SelectTrigger>
                        <SelectContent>
                            {amendableRisks.length > 0 ? (
                                amendableRisks.map((risk, index) => (
                                    <SelectItem key={index} value={risk.clause}>
                                        <p className="truncate">{risk.clause}</p>
                                    </SelectItem>
                                ))
                            ) : (
                                <p className="p-4 text-sm text-muted-foreground">No amendable clauses found.</p>
                            )}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleSuggestAmendment} disabled={!selectedClause || isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Generating...' : 'Suggest Amendment'}
                    </Button>
                </div>

                {error && <p className="text-destructive text-sm text-center">{error}</p>}

                {suggestion && (
                    <div className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                                <h4 className="font-semibold mb-2 text-destructive">Original Clause</h4>
                                <blockquote className="border-l-2 border-destructive pl-4 italic text-sm text-muted-foreground bg-destructive/5 p-3 rounded-r-lg">
                                    <p className="font-semibold text-foreground mb-2">{getSelectedRisk()?.riskLevel} Risk</p>
                                    <p className="mb-2">{selectedClause}</p>
                                    <Separator className="my-2"/>
                                    <p className="text-xs">{getSelectedRisk()?.explanation}</p>
                                    {getSelectedRisk()?.complianceIssues !== 'None' && <p className="text-xs mt-1 text-amber-500">{getSelectedRisk()?.complianceIssues}</p>}

                                </blockquote>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-green-600">Suggested Amendment</h4>
                                <blockquote className="border-l-2 border-green-600 pl-4 italic text-sm bg-green-900/10 p-3 rounded-r-lg">
                                    <p>{suggestion.suggestedAmendment}</p>
                                </blockquote>
                            </div>
                        </div>
                         <div className="mt-6">
                            <h4 className="font-semibold mb-2">Explanation of Changes</h4>
                            <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </>
    );
}

