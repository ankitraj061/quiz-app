"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApplicantsByQuizId } from "@/app/lib/quizApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuizDetail {
  quizName: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
}

interface Participant {
  id: string;
  studentName: string;
  studentEmail: string;
  teamName: string;
  totalScore: number;
  totalCorrectAnswers: number;
  submittedAt: string;
}

interface LeaderboardData {
  quizDetail: QuizDetail;
  participants: Participant[];
}

const ApplicantsPage = () => {
  const params = useParams();
  const quizId = params?.id as string;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        setError(null);

        const data = await getApplicantsByQuizId(quizId) as LeaderboardData;
        
        // Check if data and participants exist and is an array
        if (data && data.quizDetail) {
          setQuizDetail(data.quizDetail);
        }
        
        if (data && Array.isArray(data.participants)) {
          setParticipants(data.participants);
        } else {
          setParticipants([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [quizId]);

  // Only spread if participants is an array
  const sortedParticipants = Array.isArray(participants) 
    ? [...participants].sort((a, b) => {
        return sortOrder === "desc"
          ? b.totalScore - a.totalScore
          : a.totalScore - b.totalScore;
      })
    : [];

  const toggleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  // Calculate percentage score
  const calculatePercentage = (score: number, totalMarks: number) => {
    return totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(1) : "0";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading leaderboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!quizDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Quiz not found</h2>
          <Button asChild>
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {quizDetail.quizName}
          </h1>
          <p className="text-muted-foreground mb-2">{quizDetail.description}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Questions: {quizDetail.totalQuestions}</span>
            <span>Total Marks: {quizDetail.totalMarks}</span>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leaderboard ({participants.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSort}
              className="flex items-center gap-2"
              disabled={participants.length === 0}
            >
              {sortOrder === "desc" ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Highest First
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Lowest First
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No participants have attempted this quiz yet
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    {/* <TableHead className="text-center">Correct</TableHead> */}
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedParticipants.map((participant, index) => {
                    const percentage = calculatePercentage(
                      participant.totalScore,
                      quizDetail.totalMarks
                    );
                    const percentageNum = parseFloat(percentage);

                    return (
                      <TableRow key={participant.id}>
                        <TableCell className="font-bold text-center">
                          {sortOrder === "desc" ? index + 1 : participants.length - index}
                        </TableCell>
                        <TableCell className="font-medium">
                          {participant.studentName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {participant.teamName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {participant.studentEmail}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`font-bold ${
                                percentageNum >= 80
                                  ? "text-green-600"
                                  : percentageNum >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {participant.totalScore}/{quizDetail.totalMarks}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({percentage}%)
                            </span>
                          </div>
                        </TableCell>
                        {/* <TableCell className="text-center">
                          {participant.totalCorrectAnswers}/{quizDetail.totalQuestions}
                        </TableCell> */}
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(participant.submittedAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicantsPage;
