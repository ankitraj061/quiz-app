'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuizCard from '../components/QuizCard';
import { Quiz } from '@/types/quiz';
import { getQuizOfAdmin } from '@/app/lib/quizApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useSidebar } from "@/components/ui/sidebar";

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const { open } = useSidebar();

  // Auth protection - redirect if not admin
  useEffect(() => {

    // Wait for auth to load before making decisions
    if (!isLoading) {
      // Redirect if not authenticated OR not an admin
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/auth/admin/login');
      } else {
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchQuizData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getQuizOfAdmin();
      setQuizzes(data);
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

  // Fetch quizzes when authenticated as admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchQuizData();
    } 
  }, [isLoading, isAuthenticated, user, fetchQuizData]);

  const handleRetry = () => {
    fetchQuizData();
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render dashboard if not authorized
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Quiz Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor all your quizzes
            </p>
          </div>
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            <Link href="/admin/create" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Quiz
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No quizzes yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by creating your first quiz to engage students and track responses.
            </p>
            <Button asChild size="lg">
              <Link href="/admin/create">Create Quiz</Link>
            </Button>
          </div>
        )}

        {/* Quiz List */}
        {!loading && !error && quizzes.length > 0 && (
          <div className={`grid gap-5 sm:grid-cols-1 ${open ? "md:grid-cols-1" : "md:grid-cols-2"} lg:grid-cols-2
        xl:grid-cols-3`}>
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                applicantCount={quiz.participants.length}
                onDelete={() => fetchQuizData()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
