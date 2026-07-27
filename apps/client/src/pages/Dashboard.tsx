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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

interface Feedback {
  id: number;
  raw_text: string;
  sentiment: string;
  key_items: string[];
  requires_action: boolean;
  created_at: string;
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Submit Feedback
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{feedbacks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Positive Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {feedbacks.filter((f) => f.sentiment === "Positive").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Urgent Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {feedbacks.filter((f) => f.requires_action).length}
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
              <p className="text-muted-foreground text-center py-8">
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
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.map((feedback) => (
                      <TableRow
                        key={feedback.id}
                        className={
                          feedback.requires_action ? "bg-red-50 dark:bg-red-950/20" : ""
                        }
                      >
                        <TableCell className="max-w-xs truncate">
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
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
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
