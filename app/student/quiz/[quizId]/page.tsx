'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { QUIZZES } from '@/app/lib/quizData';
import { Timer } from '@/app/components/Timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { saveQuizAttempt } from '@/app/lib/storage';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const QuizPage = () => {
  const params = useParams();
  const quizId = params.quizId as string;
  const router = useRouter();
  const { isAuthenticated, team } = useAuth();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const quiz = QUIZZES.find((q) => q.id === quizId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/student/login');
      return;
    }

    if (!quiz) {
      toast.error('Quiz not found');
      router.push('/student/dashboard');
      return;
    }

    // Enter fullscreen
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        toast.error('Please enable fullscreen mode to start the quiz');
      }
    };

    enterFullscreen();

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        toast.warning('⚠️ Please stay in fullscreen mode during the quiz!');
      } else {
        setIsFullscreen(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [isAuthenticated, quiz, router]);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < (quiz?.questions.length || 0)) {
      toast.error('Please answer all questions before submitting');
      return;
    }
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    if (!quiz || !team) return;

    const score = calculateScore();
    const attempt = {
      id: `${Date.now()}`,
      quizTitle: quiz.title,
      score,
      totalQuestions: quiz.questions.length,
      date: new Date().toISOString(),
      teamName: team.teamName,
    };

    saveQuizAttempt(attempt);

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    router.push(`/student/result/${attempt.id}`);
  };

  const handleTimeUp = () => {
    toast.error('Time is up!');
    confirmSubmit();
  };

  if (!quiz || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">{quiz.title}</h1>
          <Timer duration={quiz.duration} onTimeUp={handleTimeUp} />
        </div>

        {!isFullscreen && (
          <Card className="mb-6 bg-warning/10 border-warning">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <p className="text-sm font-medium">
                Please enable fullscreen mode to continue the quiz
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <Card key={question.id} className="shadow-medium">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {index + 1}. {question.question}
                </h3>
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) =>
                    handleAnswerChange(question.id, parseInt(value))
                  }
                >
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`${question.id}-${optionIndex}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${optionIndex}`}
                        className="cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSubmit}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 px-12"
          >
            Submit Quiz
          </Button>
        </div>

        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to submit your answers? You won't be able to change
                them after submission.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Review Answers</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSubmit}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default QuizPage;
