'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  FileQuestion,
  CheckCircle,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Quiz } from '@/types/quiz';
import { deleteQuiz, getQuiz } from '@/app/lib/quizApi';
import { ApiError } from '@/app/lib/apiError';

export default function QuizDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizDetail = useCallback(async () => {
    if (!id) {
      setError('Invalid quiz ID.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getQuiz(id);
      data.questions = data.questions.map((quest) => ({...quest, answer: quest.options.indexOf(String(quest.answer))}))
      setQuiz(data);
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load quiz. Please check your connection and try again.'
      );
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuizDetail();
  }, [fetchQuizDetail]);

  const handleDelete = async () => {
    try {
      const res = await deleteQuiz(id);
      if (!res?.success) {
        toast.error(res?.message || 'Failed to delete quiz.');
        return;
      }
      toast.success('Quiz deleted successfully!');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Delete error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
        error.errors?.forEach((err) => toast.error(err));
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleRetry = () => {
    fetchQuizDetail();
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-8">
          <Button variant="ghost" className="mb-6 opacity-50 cursor-not-allowed" disabled>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-10 h-10 rounded-md" />
                <Skeleton className="w-10 h-10 rounded-md" />
              </div>
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-32" />
            </div>

            {/* Skeleton questions */}
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="space-y-4">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <Skeleton key={j} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === ERROR STATE ===
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Failed to Load Quiz</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRetry}>Try Again</Button>
            <Button asChild variant="outline">
              <Link href="/admin/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // === NOT FOUND (after load completes) ===
  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Quiz not found</h2>
          <p className="text-muted-foreground mb-6">The quiz you're looking for doesn’t exist.</p>
          <Button asChild>
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // === SUCCESS: Render Quiz Details ===
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{quiz.name}</h1>
              <p className="text-muted-foreground">
                {quiz.description || 'No description provided'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/admin/edit/${quiz.id}`)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{quiz.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <FileQuestion className="w-4 h-4" />
              {quiz.questions.length} Question{quiz.questions.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <Clock className="w-4 h-4" />
              {quiz.duration} minute{quiz.duration !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-3">
                  <span className="text-primary font-bold">Q{index + 1}.</span>
                  <span>{question.statement}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border ${optIndex === question.answer
                          ? 'bg-primary/10 border-primary'
                          : 'bg-muted'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {optIndex === question.answer && (
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <span
                          className={optIndex === question.answer ? 'font-medium' : ''}
                        >
                          {option}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}