"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, Loader2, Maximize } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Quiz } from "@/types/quiz";
import { getQuizDetail, submitQuiz } from "@/app/lib/studentApi";
import { SubmitQuiz } from "@/types/student";
import { ApiError } from "@/app/lib/apiError";
import { Timer } from "@/app/components/Timer";

const QuizPage = () => {
  const params = useParams();
  const quizId = params.quizId as string;
  const router = useRouter();
  const { isAuthenticated, team } = useAuth();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering browser-only features
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchQuizData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getQuizDetail(quizId);
      setQuiz(res.data);
    } catch (err) {
      console.error("Failed to fetch quiz detail:", err);
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load quiz. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [fetchQuizData, quizId]);

  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      // State will be updated by the fullscreenchange event listener
    } catch (err) {
      console.error("Error entering fullscreen:", err);
      toast.error("Failed to enable fullscreen mode");
    }
  };

  // Fullscreen management
  useEffect(() => {
    if (!isAuthenticated || !isMounted) return;

    // Check initial fullscreen state
    setIsFullscreen(!!document.fullscreenElement);

    // Attempt to enter fullscreen on mount
    if (!document.fullscreenElement) {
      enterFullscreen();
    }

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      if (!isNowFullscreen) {
        toast.warning("⚠️ Please stay in fullscreen during the quiz!");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.warn);
      }
    };
  }, [isAuthenticated, isMounted]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/auth/student/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const allAnswered = useMemo(() => {
    if (!quiz) return false;
    return Object.keys(answers).length === quiz.questions.length;
  }, [answers, quiz]);

  const handleSubmit = () => {
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    setShowSubmitDialog(true);
  };

  const confirmSubmit = async () => {
    if (!quiz || !team) return;

    setSubmissionLoading(true);
    setShowSubmitDialog(false);

    try {
      const response = quiz.questions.map((q) => ({
        questionId: q.id ?? "",
        answer: q.options[answers[q.id ?? ""]],
      }));

      const submissionData: SubmitQuiz = {
        quizId,
        submittedAt: new Date().toISOString(),
        response,
      };

      const result = await submitQuiz(submissionData);

      if (!result.success) {
        throw new Error(result.message || "Submission failed");
      }

      // Exit fullscreen before navigation
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(console.warn);
      }

      // Navigate to results page
      router.push(`/student/result/${quizId}`);
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionLoading(false);

      if (error instanceof ApiError) {
        toast.error(error.message);
        error.errors?.forEach((err) => toast.error(err));
      } else {
        toast.error("Failed to submit quiz. Please try again.");
      }
    }
  };

  const handleTimeUp = () => {
    toast.error("Time is up! Submitting your answers...");
    confirmSubmit();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Quiz Loading Failed</h2>
            <p className="text-center text-muted-foreground">{error}</p>
            <Button onClick={fetchQuizData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect if not authenticated (shouldn't happen but safe guard)
  if (!isAuthenticated || !quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary truncate">
            {quiz.name}
          </h1>
          <Timer duration={quiz.duration * 60} onTimeUp={handleTimeUp} />
        </div>

        {!isFullscreen && (
          <Card className="mb-6 bg-warning/10 border-warning">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-warning shrink-0" />
                <p className="text-sm font-medium">
                  Please enable fullscreen mode to continue the quiz
                </p>
              </div>
              <Button
                onClick={enterFullscreen}
                size="sm"
                variant="outline"
                className="shrink-0"
              >
                <Maximize className="h-4 w-4 mr-2" />
                Enable Fullscreen
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <Card key={question.id} className="shadow-medium">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {index + 1}. {question.statement}
                </h3>
                <RadioGroup
                  value={answers[question.id ?? ""]?.toString() ?? ""}
                  onValueChange={(value) =>
                    handleAnswerChange(question.id ?? "", parseInt(value))
                  }
                  disabled={submissionLoading}
                >
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`${question.id}-${optionIndex}`}
                        disabled={submissionLoading}
                      />
                      <Label
                        htmlFor={`${question.id}-${optionIndex}`}
                        className="cursor-pointer flex-1 pt-0.5"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="bg-black text-white hover:opacity-90 px-8 sm:px-12"
            disabled={!allAnswered || submissionLoading || !isFullscreen}
          >
            {submissionLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        </div>

        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit your answers? You won't be able
                to change them after submission.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submissionLoading}>
                Review Answers
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSubmit}
                disabled={submissionLoading}
              >
                {submissionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default QuizPage;
