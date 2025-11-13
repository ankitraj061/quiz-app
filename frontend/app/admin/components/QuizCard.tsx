'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, FileQuestion, Users, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from './storage';
import { toast } from 'sonner';
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
import { Quiz } from '@/types/quiz';
import { ApiError } from '@/app/lib/apiError';
import { deleteQuiz } from '@/app/lib/quizApi';

interface QuizCardProps {
  quiz: Quiz;
  applicantCount: number;
  onDelete: () => void;
}

export default function QuizCard({ quiz, applicantCount, onDelete }: QuizCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const res = await deleteQuiz(quiz.id);
      if (!res.success) {
        toast.error("Failed to delete quiz.");
        return;
      }
      toast.success('Quiz deleted successfully!');
      onDelete();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        if (error.errors && error.errors.length > 0) {
          error.errors.forEach((err) => {
            toast.error(err);
          });
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
        console.error('Registration error:', error);
      }
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-2">
          <CardTitle className="text-xl flex-1">{quiz.name}</CardTitle>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/edit/${quiz.id}`)}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit quiz"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete quiz"
                >
                  <Trash2 className="h-4 w-4" />
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
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{quiz.description || 'No description provided'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4" />
            <span>{quiz.questions.length} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{quiz.duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{applicantCount} Applicants</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 flex-wrap">
        <Button asChild variant="outline" className="flex-1 min-w-[120px]">
          <Link href={`/admin/quiz/${quiz.id}`}>View Details</Link>
        </Button>
        <Button asChild className="flex-1 min-w-[120px]">
          <Link href={`/admin/quiz/${quiz.id}/applicants`}>View Applicants</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
