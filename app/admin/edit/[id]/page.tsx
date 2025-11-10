'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { storage } from '@/app/admin/components/storage';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Question } from '@/types/quiz';
import { getQuiz, updateQuiz } from '@/app/lib/quizApi';
import { ApiError } from '@/app/lib/apiError';

export default function EditQuiz() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      setTitle(data.name);
      setDescription(data.description);
      setDuration(data.duration);
      // Map existing questions and ensure they have client-side IDs
      setQuestions(data.questions.map((quest) => ({
        ...quest,
        answer: quest.options.indexOf(String(quest.answer))
      })));
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load quiz. Please check your connection and try again.'
      );
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuizDetail();
  }, [fetchQuizDetail]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: "temp-" + crypto.randomUUID(), statement: '', options: ['', '', '', ''], answer: 0 }
    ]);
  };

  const removeQuestion = (questionId: string | undefined) => {
    if (!questionId) return;
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    } else {
      toast.error('Quiz must have at least one question');
    }
  };

  const updateQuestion = (questionId: string | undefined, field: keyof Question, value: any) => {
    if (!questionId) return;
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, [field]: value } : q
    ));
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

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    const invalidQuestion = questions.find(q =>
      !q.statement.trim() || q.options.some(opt => !opt.trim())
    );

    if (invalidQuestion) {
      toast.error('Please fill in all questions and options');
      return;
    }
    console.log(questions);
    

    const quiz = {
      id,
      name: title,
      description,
      duration,
      questions: questions.map((ques) => ({
        ...ques,
        // Remove temporary client IDs for new questions
        id: ques.id?.startsWith('temp-') ? undefined : ques.id
      })),
      createdAt: storage.getQuizById(id)?.createdAt || new Date().toISOString()
    };

    try {
      setSaving(true);
      const res = await updateQuiz(quiz);
      toast.success('Quiz updated successfully!');
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
        console.error('Quiz Update Error:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={fetchQuizDetail} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.push('/admin/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Edit Quiz
          </h1>
          <p className="text-muted-foreground">
            Update your quiz details and questions
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

        <div className="space-y-6 mb-6">
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

        <div className="flex gap-4">
          <Button
            onClick={addQuestion}
            variant="outline"
            className="flex items-center gap-2"
            disabled={saving}
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 ml-auto"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}