import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/types";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

type RiskAssessmentSectionProps = Pick<
  AnalysisResult,
  "summary" | "keyClauses" | "riskAssessment" | "detailedRisks"
>;

function RiskBadge({ riskLevel }: { riskLevel: "Low" | "Medium" | "High" }) {
  const variants = {
    Low: {
      variant: "secondary",
      className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300",
      icon: <ShieldCheck className="mr-1 h-3.5 w-3.5" />,
    },
    Medium: {
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300",
      icon: <ShieldQuestion className="mr-1 h-3.5 w-3.5" />,
    },
    High: {
      variant: "destructive",
      className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300",
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
}: RiskAssessmentSectionProps) {
  return (
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
          <CardTitle className="font-headline">General Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{riskAssessment}</p>
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
          <CardTitle className="font-headline">Detailed Clause Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {detailedRisks.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {detailedRisks.map((risk, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex justify-between items-center w-full pr-4">
                      <p className="flex-1 font-semibold truncate mr-4">{risk.clause}</p>
                      <RiskBadge riskLevel={risk.riskLevel} />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {risk.explanation}
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
  );
}
