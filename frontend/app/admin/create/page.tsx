'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ApiError } from '@/app/lib/apiError';
import { createQuiz } from '@/app/lib/quizApi';
import { Question } from '@/types/quiz';

export default function CreateQuiz() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), statement: '', options: ['', '', '', ''], answer: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: crypto.randomUUID(), statement: '', options: ['', '', '', ''], answer: 0 }
    ]);
  };

  const removeQuestion = (id: string | undefined) => {
    if (!id) return;
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string | undefined, field: keyof Question, value: any) => {
    if (!id) return;
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (questionId: string | undefined, optionIndex: number, value: string) => {
    if (!questionId) return;
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    const invalidQuestion = questions.find(q => !q.statement.trim() || q.options.some(opt => !opt.trim()));
    if (invalidQuestion) {
      toast.error('Please fill in all questions and options');
      return;
    }

    const quiz = {
      id: crypto.randomUUID(),
      name: title,
      description,
      duration,
      questions,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await createQuiz(quiz);
      if (!res.success) {
        toast.error(res.message);
        setIsLoading(false);
        return;
      }
      toast.success('Quiz created successfully!');
      router.push('/admin/dashboard');
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
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-liner-to-r from-primary to-accent bg-clip-text text-transparent">
            Create New Quiz
          </h1>
          <p className="text-muted-foreground">
            Design your quiz with custom questions and answers
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                placeholder="Enter quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter quiz description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="timer">Timer (minutes) *</Label>
              <Input
                id="timer"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <Card key={question.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Question Text *</Label>
                  <Input
                    placeholder="Enter your question"
                    value={question.statement}
                    onChange={(e) => updateQuestion(question.id, 'statement', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Options *</Label>
                  <RadioGroup
                    value={question.answer.toString()}
                    onValueChange={(value) => updateQuestion(question.id, 'answer', parseInt(value))}
                  >
                    <div className="space-y-3 mt-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                          <Input
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-2">Select the correct answer</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 mt-6">
          <Button onClick={addQuestion} variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2 ml-auto" disabled={isLoading}>
            <Save className="w-4 h-4" />
            Save Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
