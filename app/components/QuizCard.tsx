import { Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Quiz } from '@/app/lib/quizData';

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
}

export const QuizCard = ({ quiz, onStart }: QuizCardProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <Card className="shadow-medium hover:shadow-large transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-xl text-primary">{quiz.title}</CardTitle>
        <CardDescription className="text-base">{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{quiz.questions.length} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(quiz.duration)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onStart(quiz.id)}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  );
};
