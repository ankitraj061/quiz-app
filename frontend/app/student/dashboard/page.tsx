'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { QuizCard } from '@/app/components/QuizCard';
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getQuizzes } from '@/app/lib/studentApi';
import { Quiz } from '@/types/quiz';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, team, user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'STUDENT') {
      
        router.push('/auth/student/login');
      } else {
       
      }
    }
  }, [isLoading, isAuthenticated, user, router, team]);

  const fetchQuizzes = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'STUDENT') {
      return;
    }

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
  }, [isAuthenticated, user]);

  useEffect(() =>{

    if (!isLoading && isAuthenticated && user?.role === 'STUDENT') {
      fetchQuizzes();
    } else {
    }
  }, [isLoading, isAuthenticated, user, fetchQuizzes]);

  const handleStartQuiz = (quizId: string) => {
    router.push(`/student/quiz/${quizId}`);
  };

  const handleRetry = () => {
    fetchQuizzes();
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render dashboard if not authorized
  if (!isAuthenticated || user?.role !== 'STUDENT') {
    return null;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Quiz Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
          {team && (
            <>
              {' '}from team <span className="font-semibold text-foreground">{team?.teamName}</span>
            </>
          )}
          ! Choose a quiz to get started.
        </p>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong</h3>
          <p className="text-muted-foreground max-w-md mb-6">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && quizzes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No quizzes available</h2>
          <p className="text-muted-foreground max-w-md">
            No quizzes are available at the moment. Please check back later.
          </p>
        </div>
      )}

      {/* Quiz List */}
      {!loading && !error && quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onStart={handleStartQuiz} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
