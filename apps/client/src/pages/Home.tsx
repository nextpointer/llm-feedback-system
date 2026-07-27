import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { NotoEmoji } from "../components/noto-emoji";

const moods = [
  { value: 1, label: "Terrible", codepoint: "1f621", color: "bg-red-500/10 border-red-500/20" },
  { value: 2, label: "Poor", codepoint: "1f622", color: "bg-orange-500/10 border-orange-500/20" },
  { value: 3, label: "Okay", codepoint: "1f610", color: "bg-yellow-500/10 border-yellow-500/20" },
  { value: 4, label: "Good", codepoint: "1f60a", color: "bg-green-400/10 border-green-400/20" },
  { value: 5, label: "Excellent", codepoint: "1f929", color: "bg-green-500/10 border-green-500/20" },
];

const MAX_CHARS = 200;

interface FeedbackResult {
  id: number;
  sentiment: string;
  key_items: string[];
  requires_action: boolean;
}

export default function Home() {
  const [text, setText] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!selectedMood) {
      setError("Please select how was your experience");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest<FeedbackResult>("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ text, rating: selectedMood }),
      });

      setResult(data);
      setText("");
      setSelectedMood(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <Card className="transition-shadow duration-150 ease-out hover:shadow-[0_0_0_1px_oklch(1_0_0/0.13)]">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-balance text-xl">Share Your Experience</CardTitle>
            <CardDescription className="text-pretty">
              Tell us about your dining experience. Your feedback helps us improve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {result && (
                <Alert className="border-green-500/20 bg-green-500/5">
                  <CheckCircle2 className="size-4 text-green-500" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-pretty">Feedback submitted successfully!</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={
                            result.sentiment === "Positive"
                              ? "default"
                              : result.sentiment === "Negative"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {result.sentiment}
                        </Badge>
                        {result.requires_action && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="size-3" />
                            Urgent Action Required
                          </Badge>
                        )}
                      </div>
                      {result.key_items.length > 0 && (
                        <p className="text-sm text-muted-foreground text-pretty">
                          Key items: {result.key_items.join(", ")}
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-center">How was your experience?</p>
                <div className="flex justify-center gap-2">
                  {moods.map((mood) => (
                    <NotoEmoji
                      key={mood.value}
                      codepoint={mood.codepoint}
                      label={mood.label}
                      isSelected={selectedMood === mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      color={mood.color}
                      size={52}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Review</span>
                  <span className={`text-xs tabular-nums ${text.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                    {text.length}/{MAX_CHARS}
                  </span>
                </div>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={text}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      setText(e.target.value);
                    }
                  }}
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full transition-transform duration-150 ease-out active:scale-[0.96]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
