import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { apiRequest } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
import {
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  LogOut,
} from "lucide-react";

interface Feedback {
  id: number;
  raw_text: string;
  sentiment: string;
  key_items: string[];
  requires_action: boolean;
  created_at: string;
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-8 w-20" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="size-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

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
  const urgentCount = feedbacks.filter((f) => f.requires_action).length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="transition-shadow duration-150 ease-out hover:shadow-[0_0_0_1px_oklch(1_0_0/0.13)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </CardTitle>
              <MessageSquare className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">{totalReviews}</div>
            </CardContent>
          </Card>
          <Card className="transition-shadow duration-150 ease-out hover:shadow-[0_0_0_1px_oklch(1_0_0/0.13)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Positive Reviews
              </CardTitle>
              <ThumbsUp className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums text-green-500">
                {positiveReviews}
              </div>
            </CardContent>
          </Card>
          <Card className="transition-shadow duration-150 ease-out hover:shadow-[0_0_0_1px_oklch(1_0_0/0.13)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Urgent Action
              </CardTitle>
              <AlertTriangle className="size-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums text-red-500">
                {urgentCount}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbacks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-pretty">
                No feedback yet. Be the first to submit!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Review</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Key Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.map((feedback) => (
                      <TableRow
                        key={feedback.id}
                        className={
                          feedback.requires_action ? "bg-red-500/5" : ""
                        }
                      >
                        <TableCell className="max-w-xs truncate text-pretty">
                          {feedback.raw_text}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              feedback.sentiment === "Positive"
                                ? "default"
                                : feedback.sentiment === "Negative"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {feedback.sentiment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {feedback.key_items.map((item, i) => (
                              <Badge key={i} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {feedback.requires_action && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="size-3" />
                              Urgent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground text-right tabular-nums">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
