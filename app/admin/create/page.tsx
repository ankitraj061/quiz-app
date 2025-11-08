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
import { storage, Question } from '../components/storage';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CreateQuiz() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timer, setTimer] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), text: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: crypto.randomUUID(), text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    const invalidQuestion = questions.find(q => !q.text.trim() || q.options.some(opt => !opt.trim()));
    if (invalidQuestion) {
      toast.error('Please fill in all questions and options');
      return;
    }

    const quiz = {
      id: crypto.randomUUID(),
      title,
      description,
      timer,
      questions,
      createdAt: new Date().toISOString()
    };

    storage.saveQuiz(quiz);
    toast.success('Quiz created successfully!');
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                value={timer}
                onChange={(e) => setTimer(parseInt(e.target.value) || 1)}
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
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Options *</Label>
                  <RadioGroup
                    value={question.correctAnswer.toString()}
                    onValueChange={(value) => updateQuestion(question.id, 'correctAnswer', parseInt(value))}
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
          <Button onClick={handleSave} className="flex items-center gap-2 ml-auto">
            <Save className="w-4 h-4" />
            Save Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
