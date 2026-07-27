import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "../lib/api";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, CheckCircle2, Sun, Moon } from "lucide-react";
import { NotoEmoji } from "../components/noto-emoji";
import { useTheme } from "../components/theme-provider";

const moods = [
  { value: 1, label: "Terrible", codepoint: "1f621" },
  { value: 2, label: "Poor", codepoint: "1f622" },
  { value: 3, label: "Okay", codepoint: "1f610" },
  { value: 4, label: "Good", codepoint: "1f60a" },
  { value: 5, label: "Excellent", codepoint: "1f929" },
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
  const { theme, toggle } = useTheme();

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
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            How was everything?
          </h1>
          <p className="mt-3 text-muted-foreground text-pretty max-w-sm mx-auto">
            We'd love to hear about your dining experience.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-7">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Thank you for your feedback!</p>
                      <p className="text-xs text-muted-foreground">
                        Sentiment: {result.sentiment}
                        {result.requires_action && " · Requires attention"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <div className="flex justify-center gap-3 overflow-x-auto px-2 py-2 -mx-2">
                {moods.map((mood) => (
                  <NotoEmoji
                    key={mood.value}
                    codepoint={mood.codepoint}
                    label={mood.label}
                    isSelected={selectedMood === mood.value}
                    hasSelection={selectedMood !== null}
                    onClick={() => setSelectedMood(mood.value)}
                    size={52}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Your review</label>
                <span className={`text-xs tabular-nums transition-colors ${
                  text.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground/50"
                }`}>
                  {text.length}/{MAX_CHARS}
                </span>
              </div>
              <Textarea
                placeholder="What did you love? What could be better?"
                value={text}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setText(e.target.value);
                  }
                }}
                rows={5}
                required
                className="rounded-xl resize-none placeholder:text-muted-foreground/40"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-medium transition-all duration-200 active:scale-[0.97]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200"
          >
            Admin Login
          </Link>
        </div>
      </div>

      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors z-50"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </div>
  );
}
