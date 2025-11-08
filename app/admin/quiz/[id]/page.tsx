'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, FileQuestion, CheckCircle, Edit, Trash2 } from 'lucide-react';
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
import { storage, Quiz } from '@/app/admin/components/storage';

export default function QuizDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (id) {
      const foundQuiz = storage.getQuizById(id);
      setQuiz(foundQuiz || null);
    }
  }, [id]);

  const handleDelete = () => {
    if (id) {
      storage.deleteQuiz(id);
      toast.success('Quiz deleted successfully!');
      router.push('/admin/dashboard');
    }
  };

  if (!quiz) {
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
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              <p className="text-muted-foreground">{quiz.description || 'No description provided'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => router.push(`/admin/edit/${quiz.id}`)}>
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
                      Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
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
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4" />
              {quiz.questions.length} Questions
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {quiz.timer} minutes
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-3">
                  <span className="text-primary font-bold">Q{index + 1}.</span>
                  <span>{question.text}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border ${
                        optIndex === question.correctAnswer
                          ? 'bg-primary/10 border-primary'
                          : 'bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {optIndex === question.correctAnswer && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                        <span className={optIndex === question.correctAnswer ? 'font-medium' : ''}>
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
