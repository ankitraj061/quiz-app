'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { QuizCard } from '@/app/components/QuizCard';
import { QUIZZES } from '@/app/lib/quizData';
import { useEffect } from 'react';

const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, team } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/student/login');
    }
  }, [isAuthenticated, router]);

  const handleStartQuiz = (quizId: string) => {
    router.push(`/student/quiz/${quizId}`);
  };

  if (!isAuthenticated) return null;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Quiz Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, <span className="font-semibold text-foreground">{team?.teamName}</span>!
          Choose a quiz to get started.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {QUIZZES.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} onStart={handleStartQuiz} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
