'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { QuizCard } from '@/app/components/QuizCard';
import { QUIZZES } from '@/app/lib/quizData';
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getQuizzes } from '@/app/lib/studentApi';
import { Quiz } from '@/types/quiz';

const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, team, student, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getQuizzes();
      setQuizzes(res.data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load quizzes. Please check your connection and try again.'
      );
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    console.table({ isAuthenticated, team, student, isLoading })
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/student/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleStartQuiz = (quizId: string) => {
    router.push(`/student/quiz/${quizId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Quiz Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, <span className="font-semibold text-foreground">{student?.name}</span> from team{' '}
          <span className="font-semibold text-foreground">{team?.teamName}</span>!
          Choose a quiz to get started.
        </p>
      </header>
      {!quizzes.length && !loading && !error && (
        <p className="text-center text-muted-foreground">No quizzes available at the moment. Please check back later.</p>
      )}

      {quizzes && 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} onStart={handleStartQuiz} />
        ))}
      </div>}
    </div>
  );
};

export default Dashboard;