
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
  Volume2,
  CircleStop,
} from "lucide-react";
import { Button } from "../ui/button";
import { getAmendment, getSpeech } from "@/app/actions";
import { Separator } from "../ui/separator";
import { ClauseComparer } from "./clause-comparer";

type RiskAssessmentSectionProps = Pick<
  AnalysisResult,
  "summary" | "keyClauses" | "riskAssessment" | "detailedRisks" | "complianceAnalysis"
>;


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
  
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handleTextToSpeech = async () => {
    setIsSynthesizing(true);
    setAudioUrl(null);
    if (audio) {
      audio.pause();
      setAudio(null);
    }

    const formData = new FormData();
    formData.append("text", summary);
    const result = await getSpeech(formData);

    if (result.media) {
      setAudioUrl(result.media);
      const newAudio = new Audio(result.media);
      setAudio(newAudio);
      newAudio.play();
      newAudio.onended = () => {
          setIsSynthesizing(false);
      }
    } else {
      console.error(result.error);
    }
    // Note: If the audio doesn't play automatically, we keep isSynthesizing as true
    // to show the stop button, allowing the user to retry. A better implementation
    // would handle this more gracefully.
  };

  const stopPlayback = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    setIsSynthesizing(false);
    setAudioUrl(null);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Executive Summary</CardTitle>
           <Button variant="outline" size="sm" onClick={isSynthesizing ? stopPlayback : handleTextToSpeech} disabled={isSynthesizing && !audioUrl}>
            {isSynthesizing ? (
              audioUrl ? <CircleStop className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />
            ) : <Volume2 className="h-4 w-4" />}
            {isSynthesizing ? (audioUrl ? 'Stop' : 'Synthesizing...') : 'Listen to Summary'}
          </Button>
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
