'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getQuizAttempts } from '@/app/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Download, History } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const Result = () => {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [attempt, setAttempt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/student/login');
      return;
    }

    // Load attempts from localStorage inside useEffect
    const attempts = getQuizAttempts();
    console.log('All attempts:', attempts); // Debug log
    console.log('Looking for attemptId:', attemptId); // Debug log
    
    const foundAttempt = attempts.find((a) => a.id === attemptId);
    console.log('Found attempt:', foundAttempt); // Debug log
    
    setAttempt(foundAttempt);
    setIsLoading(false);
  }, [isAuthenticated, attemptId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-4">Result not found</p>
            <Button onClick={() => router.push('/student/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentage = (attempt.score / attempt.totalQuestions) * 100;
  const passed = percentage >= 60;

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${attempt.teamName}-${attempt.quizTitle}-certificate.pdf`);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="shadow-large">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-4">
                <Award className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold mb-2">
                {passed ? 'Congratulations!' : 'Quiz Completed'}
              </h1>
              <p className="text-xl text-muted-foreground">
                {attempt.teamName} - {attempt.quizTitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-muted">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Score</p>
                  <p className="text-3xl font-bold text-primary">
                    {attempt.score}/{attempt.totalQuestions}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Percentage</p>
                  <p className="text-3xl font-bold text-primary">{percentage.toFixed(1)}%</p>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <p
                    className={`text-2xl font-bold ${
                      passed ? 'text-success' : 'text-warning'
                    }`}
                  >
                    {passed ? 'Passed' : 'Keep Trying!'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={downloadCertificate}
                disabled={isDownloading}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Generating...' : 'Download Certificate'}
              </Button>
              <Button onClick={() => router.push('/student/dashboard/history')} variant="outline">
                <History className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Preview */}
        <div
          ref={certificateRef}
          className="bg-card p-12 rounded-lg shadow-large border-4 border-primary"
          style={{ aspectRatio: '1.414/1' }}
        >
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center">
              <Award className="h-12 w-12 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold text-primary">Certificate of Achievement</h2>
            <p className="text-xl">This is to certify that</p>
            <p className="text-3xl font-bold text-foreground">{attempt.teamName}</p>
            <p className="text-xl">has successfully completed</p>
            <p className="text-2xl font-semibold text-primary">{attempt.quizTitle}</p>
            <div className="pt-6">
              <p className="text-lg">
                Score: <span className="font-bold">{attempt.score}/{attempt.totalQuestions}</span> ({percentage.toFixed(1)}%)
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {new Date(attempt.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
