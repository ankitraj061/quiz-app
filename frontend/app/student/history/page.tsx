'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getQuizAttempts } from '@/app/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Award, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuizHistory } from '@/types/quiz';
import { getQuizHistory } from '@/app/lib/studentApi';

const History = () => {
  const router = useRouter();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizHistory, setQuizHistory] = useState<QuizHistory>([]);
  const [error, setError] = useState("");
  const 

  const fetchQuizHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await getQuizHistory();
      setQuizHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch quiz history:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load quiz history. Please check your connection and try again.'
      );
      setQuizHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadedAttempts = getQuizAttempts();
    setAttempts(loadedAttempts);
    setIsLoading(false);
    fetchQuizHistory();
  }, [router, fetchQuizHistory]);

  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }


  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Quiz History</h1>
        <p className="text-lg text-muted-foreground">
          View all your past quiz attempts and certificates
        </p>
      </header>

      {quizHistory.length === 0 ? (
        <Card className="shadow-medium">
          <CardContent className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              No quiz attempts yet. Start your first quiz!
            </p>
            <Button onClick={() => router.push('/student/dashboard')} className="bg-gradient-primary">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizHistory.map((attempt, idx) => {
            const percentage = (attempt.totalObtainedScore / attempt.totalPossibleScore) * 100;
            const passed = percentage >= 60;

            return (
              <Card key={idx} className="shadow-medium hover:shadow-large transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">{attempt.quizName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(attempt.submittedAt ?? "").toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold">
                        {attempt.totalCorrectAnswers}/{attempt.totalQuestions}
                      </span>
                    </div>
                    <Badge variant={passed ? 'default' : 'secondary'}>
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>

                  <Button
                    onClick={() => router.push(`/student/result/${attempt.quizId}`)}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Result
                  </Button>
                  <Button
                   
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
