import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { apiRequest } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { LogOut, AlertTriangle, Sun, Moon } from "lucide-react";
import { NotoEmoji } from "../components/noto-emoji";
import { useTheme } from "../components/theme-provider";

interface Feedback {
  id: number;
  raw_text: string;
  sentiment: string;
  rating: number;
  key_items: string[];
  requires_action: boolean;
  created_at: string;
}

const moodCodepoints: Record<number, string> = {
  1: "1f621",
  2: "1f622",
  3: "1f610",
  4: "1f60a",
  5: "1f929",
};

function DashboardSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-4 md:p-6 shrink-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
      <div className="px-4 md:px-6 pb-4 shrink-0">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-7 w-10" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 px-4 md:px-6 pb-6">
        <div className="max-w-5xl mx-auto h-full rounded-2xl border border-border bg-card">
          <div className="p-5"><Skeleton className="h-5 w-36" /></div>
          <div className="px-5 pb-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    const fetchFeedbacks = async () => {
      try {
        const data = await apiRequest<Feedback[]>("/api/feedback/insights");
        setFeedbacks(data);
      } catch {
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();

    const socket = connectSocket();

    socket.on("feedback:new", (newFeedback: Feedback) => {
      setFeedbacks((prev) => [newFeedback, ...prev]);
    });

    return () => {
      socket.off("feedback:new");
      disconnectSocket();
    };
  }, [isAuthenticated, token, navigate, logout]);

  const handleLogout = () => {
    logout();
    disconnectSocket();
    navigate("/");
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const totalReviews = feedbacks.length;
  const positiveReviews = feedbacks.filter((f) => f.sentiment === "Positive").length;
  const neutralReviews = feedbacks.filter((f) => f.sentiment === "Neutral").length;
  const negativeReviews = feedbacks.filter((f) => f.sentiment === "Negative").length;
  const urgentCount = feedbacks.filter((f) => f.requires_action).length;

  const stats = [
    { label: "Total", value: totalReviews },
    { label: "Positive", value: positiveReviews, color: "text-emerald-500 dark:text-emerald-400" },
    { label: "Neutral", value: neutralReviews, color: "text-zinc-500 dark:text-zinc-400" },
    { label: "Negative", value: negativeReviews, color: "text-orange-500 dark:text-orange-400" },
    { label: "Urgent", value: urgentCount, color: "text-red-500 dark:text-red-400" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-4 md:p-6 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground rounded-xl"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 pb-4 shrink-0">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-semibold tabular-nums ${stat.color || ""}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 md:px-6 pb-6">
        <div className="max-w-5xl mx-auto h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border shrink-0">
            <h2 className="text-sm font-medium">Recent Feedback</h2>
          </div>
          {feedbacks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground/50 text-sm">No feedback yet.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Review</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Sentiment</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Key Items</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id} className="border-border">
                      <TableCell>
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          <NotoEmoji
                            codepoint={moodCodepoints[feedback.rating] || "1f610"}
                            size={28}
                            static
                          />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <p className="text-sm truncate text-pretty">{feedback.raw_text}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`rounded-full text-xs font-medium px-2.5 ${
                            feedback.sentiment === "Positive"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : feedback.sentiment === "Negative"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {feedback.sentiment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {feedback.key_items.slice(0, 3).map((item, i) => (
                            <span key={i} className="text-xs text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">
                              {item}
                            </span>
                          ))}
                          {feedback.key_items.length > 3 && (
                            <span className="text-xs text-muted-foreground/50">+{feedback.key_items.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {feedback.requires_action && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-500/10 rounded-full px-2 py-0.5">
                            <AlertTriangle className="size-3" />
                            Urgent
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground text-right tabular-nums whitespace-nowrap">
                        {new Date(feedback.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
