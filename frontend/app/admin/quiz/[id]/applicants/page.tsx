"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { storage, Applicant, Quiz } from "@/app/admin/components/storage";

const ApplicantsPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const foundQuiz = await storage.getQuizById(id);
        setQuiz(foundQuiz || null);
        const foundApplicants = await storage.getApplicantsByQuizId(id);
        setApplicants(foundApplicants);
      }
    };

    fetchData();
  }, [id]);

  const sortedApplicants = [...applicants].sort((a, b) => {
    return sortOrder === "desc" ? b.score - a.score : a.score - b.score;
  });

  const toggleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Quiz not found</h2>
          <Button asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {quiz.title}
          </h1>
          <p className="text-muted-foreground">Applicants who have attempted this quiz</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Applicant Results ({applicants.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={toggleSort} className="flex items-center gap-2">
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
            {applicants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No applicants have attempted this quiz yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">{applicant.name}</TableCell>
                      <TableCell>{applicant.email}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${
                          applicant.score >= 80 ? "text-green-600" :
                          applicant.score >= 60 ? "text-yellow-600" :
                          "text-red-600"
                        }`}>
                          {applicant.score}%
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(applicant.submittedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
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
