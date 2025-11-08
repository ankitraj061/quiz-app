'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuizCard from '../components/QuizCard';
import { storage, Quiz } from '../components/storage';

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    storage.initializeDemoData();
    setQuizzes(storage.getQuizzes());
  }, []);

  const getApplicantCount = (quizId: string) => {
    return storage.getApplicantsByQuizId(quizId).length;
  };

  const refreshQuizzes = () => {
    setQuizzes(storage.getQuizzes());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quiz Dashboard
            </h1>
            <p className="text-muted-foreground">Manage and monitor all your quizzes</p>
          </div>
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
            <Link href="/admin/create" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Quiz
            </Link>
          </Button>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No quizzes yet</h2>
            <p className="text-muted-foreground mb-6">Get started by creating your first quiz</p>
            <Button asChild size="lg">
              <Link href="/admin/create">Create Quiz</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                applicantCount={getApplicantCount(quiz.id)}
                onDelete={refreshQuizzes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
