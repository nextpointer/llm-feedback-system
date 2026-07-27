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

interface FeedbackResult {
  id: number;
  sentiment: string;
  key_items: string[];
  requires_action: boolean;
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const data = await apiRequest<FeedbackResult>("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      setResult(data);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-balance">Restaurant Feedback</h1>
          <Link to="/login">
            <Button variant="outline" className="transition-transform duration-150 ease-out active:scale-[0.96]">
              Admin Login
            </Button>
          </Link>
        </div>

        <Card className="transition-shadow duration-150 ease-out hover:shadow-[0_0_0_1px_oklch(1_0_0/0.13)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-balance">Share Your Experience</CardTitle>
            <CardDescription className="text-pretty">
              Tell us about your dining experience. Your feedback helps us
              improve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Textarea
                  placeholder="Write your review here... Mention the food, service, ambience, or any issues you experienced."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
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
      </div>
    </div>
  );
}
