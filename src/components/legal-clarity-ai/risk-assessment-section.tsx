
"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Loader2,
  Sparkles,
  Gavel,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { getAmendment } from "@/app/actions";
import { Separator } from "../ui/separator";

type RiskAssessmentSectionProps = Pick<
  AnalysisResult,
  "summary" | "keyClauses" | "riskAssessment" | "detailedRisks" | "complianceAnalysis"
>;

type AmendmentSuggestion = {
  suggestedAmendment: string | null;
  explanation: string | null;
  error: string | null;
};

function RiskBadge({ riskLevel }: { riskLevel: "Low" | "Medium" | "High" }) {
  const variants = {
    Low: {
      variant: "secondary",
      className:
        "bg-green-100/10 text-green-400 border-green-400/20",
      icon: <ShieldCheck className="mr-1 h-3.5 w-3.5" />,
    },
    Medium: {
      variant: "secondary",
      className:
        "bg-yellow-100/10 text-yellow-400 border-yellow-400/20",
      icon: <ShieldQuestion className="mr-1 h-3.5 w-3.5" />,
    },
    High: {
      variant: "destructive",
      className:
        "bg-red-100/10 text-red-400 border-red-400/20",
      icon: <ShieldAlert className="mr-1 h-3.5 w-3.5" />,
    },
  };
  const { variant, className, icon } = variants[riskLevel] || variants.Low;
  return (
    <Badge variant={variant as any} className={className}>
      {icon}
      {riskLevel}
    </Badge>
  );
}

export function RiskAssessmentSection({
  summary,
  keyClauses,
  riskAssessment,
  detailedRisks,
  complianceAnalysis,
}: RiskAssessmentSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<{
    clause: string;
    explanation: string;
  } | null>(null);
  const [amendment, setAmendment] = useState<AmendmentSuggestion | null>(null);
  const [isLoadingAmendment, setIsLoadingAmendment] = useState(false);

  const handleSuggestAmendment = async (
    originalClause: string,
    riskExplanation: string
  ) => {
    setSelectedRisk({ clause: originalClause, explanation: riskExplanation });
    setIsDialogOpen(true);
    setIsLoadingAmendment(true);
    setAmendment(null);

    const formData = new FormData();
    formData.append("originalClause", originalClause);
    formData.append("riskExplanation", riskExplanation);

    const result = await getAmendment(formData);
    setAmendment(result);
    setIsLoadingAmendment(false);
  };
  
  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              General Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{riskAssessment}</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gavel className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">
                Legal Compliance Analysis
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{complianceAnalysis}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Key Clauses Explained</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{keyClauses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              Detailed Clause Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detailedRisks.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {detailedRisks.map((risk, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-4">
                        <p className="flex-1 font-semibold truncate mr-4">
                          {risk.clause}
                        </p>
                        <RiskBadge riskLevel={risk.riskLevel} />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Risk Explanation</h4>
                        <p>{risk.explanation}</p>
                      </div>
                      {risk.complianceIssues && risk.complianceIssues !== "None" && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Compliance Issues</h4>
                          <p className="text-amber-500">{risk.complianceIssues}</p>
                        </div>
                      )}
                      {risk.riskLevel !== "Low" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleSuggestAmendment(risk.clause, `${risk.explanation} ${risk.complianceIssues}`)
                          }
                          disabled={isLoadingAmendment}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Suggest Amendment
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No specific high-risk clauses were identified.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">
              Amendment Suggestion
            </DialogTitle>
            <DialogDescription>
              The AI has analyzed the risk and generated a revised clause for
              your consideration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Original Clause</h4>
              <blockquote className="border-l-2 pl-4 italic text-sm text-muted-foreground">
                {selectedRisk?.clause}
              </blockquote>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-destructive">Identified Risk & Compliance Issues</h4>
               <p className="text-sm text-muted-foreground">{selectedRisk?.explanation}</p>
            </div>
            <Separator />

            {isLoadingAmendment && (
              <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-4" />
                <p>Generating suggestion...</p>
              </div>
            )}
            {amendment?.error && (
                <p className="text-destructive text-sm">{amendment.error}</p>
            )}
            {amendment?.suggestedAmendment && (
                 <div>
                    <h4 className="font-semibold mb-2 text-green-600">Suggested Amendment</h4>
                    <blockquote className="border-l-2 pl-4 italic text-sm bg-green-50 dark:bg-green-900/10 py-2">
                        {amendment.suggestedAmendment}
                    </blockquote>
                    <p className="text-xs text-muted-foreground mt-4">{amendment.explanation}</p>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
