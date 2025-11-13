'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, CheckCircle2, XCircle, Clock, Trophy, User } from 'lucide-react';
import { ApiError } from '@/app/lib/apiError';
import { QuizResponse } from '@/types/student';
import { getQuizResults } from '@/app/lib/studentApi';

const QuizResultPage = () => {
  const params = useParams();
  const quizId = params.quizId as string;
  const router = useRouter();

  const [quizResult, setQuizResult] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getQuizResults(quizId);
        setQuizResult(res.data);
      } catch (err) {
        console.error('Failed to fetch quiz result:', err);
        setError(
          err instanceof ApiError
            ? err.message
            : 'Failed to load quiz result. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizResult();
    }
  }, [quizId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quizResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Failed to Load Results</h2>
            <p className="text-center text-muted-foreground">
              {error || 'Unable to load quiz results'}
            </p>
            <Button onClick={() => router.push('/student/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { quiz, totalScore, submittedAt, student, responses } = quizResult;
  const percentage = (parseFloat(totalScore) / parseFloat(quiz.totalPossibleScore)) * 100;
  const correctAnswers = responses.filter(r => r.isCorrect).length; // isCorrect is boolean, not string

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl sm:text-3xl mb-2">{quiz.name}</CardTitle>
                <p className="text-muted-foreground">{quiz.description}</p>
              </div>
              <Badge
                variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"}
                className="text-lg px-4 py-2 w-fit"
              >
                {percentage.toFixed(1)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-lg font-bold">{totalScore}/{quiz.totalPossibleScore}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-lg font-bold">{correctAnswers}/{responses.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="text-lg font-bold">
                    {new Date(submittedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="text-lg font-bold truncate">{student.name}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Question Review</h2>
          {responses.map((response, index) => {
            const isCorrect = response.isCorrect; // boolean, not string

            return (
              <Card
                key={response.questionId}
                className={`shadow-medium ${isCorrect ? 'border-l-4 border-l-green-600' : 'border-l-4 border-l-red-600'}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold flex-1">
                      {index + 1}. {response.statement}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <Badge variant={isCorrect ? "default" : "destructive"}>
                        {Number(response.scoreAwarded)}/{Number(response.scoreAwarded) === 0 ? 1 : response.scoreAwarded} pts
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {response.options.map((option, optionIndex) => {
                      const isUserAnswer = option === response.userAnswer;
                      const isCorrectAnswer = option === response.correctAnswer;

                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border-2 ${isCorrectAnswer
                              ? 'bg-green-50 border-green-600 dark:bg-green-950/20'
                              : isUserAnswer && !isCorrect
                                ? 'bg-red-50 border-red-600 dark:bg-red-950/20'
                                : 'bg-muted border-transparent'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex-1">{option}</span>
                            <div className="flex gap-2">
                              {isCorrectAnswer && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-600 dark:bg-green-950">
                                  Correct
                                </Badge>
                              )}
                              {isUserAnswer && (
                                <Badge variant="outline" className={isCorrect ? "bg-green-100 text-green-800 border-green-600 dark:bg-green-950" : "bg-red-100 text-red-800 border-red-600 dark:bg-red-950"}>
                                  Your Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => router.push('/student/dashboard')}
            size="lg"
            variant="outline"
            className="px-8"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => window.print()}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 px-8"
          >
            Print Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;