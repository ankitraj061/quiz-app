'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getQuizAttempts } from '@/app/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Award, Eye, Download, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuizHistory } from '@/types/quiz';
import { getQuizHistory } from '@/app/lib/studentApi';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CertificatePDF } from './CertificatePDF';

const CERTIFICATE_GENERATE_PERCENTAGE = process.env.NEXT_PUBLIC_CERTIFICATE_GENERATE_PERCENTAGE || '60';

const History = () => {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Array<{date: string | Date}>>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [quizHistory, setQuizHistory] = useState<QuizHistory>([]);
  const [error, setError] = useState("");
  const { user, team, isAuthenticated, isLoading: authLoading } = useAuth();

  // Auth protection - redirect if not student
  useEffect(() => {
    console.log("=== History Auth Check ===");
    console.log("authLoading:", authLoading);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("user?.role:", user?.role);

    if (!authLoading) {
      // Redirect if not authenticated OR not a student
      if (!isAuthenticated || user?.role !== 'STUDENT') {
        console.log('❌ Not authorized - redirecting to login');
        router.push('/auth/student/login');
      } else {
        console.log('✅ Student access granted');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchQuizHistory = useCallback(async () => {
    // Only fetch if authenticated and student
    if (!isAuthenticated || user?.role !== 'STUDENT') {
      console.log('Skipping quiz history fetch - not authorized');
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      console.log('Fetching quiz history...');
      const res = await getQuizHistory();
      console.log('Quiz history fetched:', res.data);
      setQuizHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch quiz history:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load quiz history. Please check your connection and try again.'
      );
      setQuizHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch quiz history when authenticated as student
  useEffect(() => {
    console.log("=== Quiz History Fetch Effect ===");
    console.log("authLoading:", authLoading);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user?.role:", user?.role);

    if (!authLoading && isAuthenticated && user?.role === 'STUDENT') {
      console.log('✅ Fetching quiz history...');
      const loadedAttempts = getQuizAttempts();
      setAttempts(loadedAttempts);
      fetchQuizHistory();
    } else {
      console.log('⏸️ Waiting for auth or not student');
    }
  }, [authLoading, isAuthenticated, user, fetchQuizHistory]);

  const handleRetry = () => {
    fetchQuizHistory();
  };

  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthenticated || user?.role !== 'STUDENT') {
    return null;
  }

  // Show loading while fetching history
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Quiz History</h1>
        <p className="text-lg text-muted-foreground">
          View all your past quiz attempts and certificates
        </p>
      </header>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center mb-6">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive mb-2">Failed to load history</h3>
          <p className="text-muted-foreground max-w-md mb-6">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!error && quizHistory.length === 0 ? (
        <Card className="shadow-medium">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No quiz history yet</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Start your first quiz to see your attempts here!
            </p>
            <Button onClick={() => router.push('/student/dashboard')} className="bg-gradient-primary">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizHistory.map((attempt, idx) => {
            const percentage = (attempt.totalObtainedScore / attempt.totalPossibleScore) * 100;
            const passed = percentage >= Number(CERTIFICATE_GENERATE_PERCENTAGE);

            // Prepare certificate data with correct field names
            const certificateData = {
              studentName: user?.name || "Student",
              quizName: attempt.quizName,
              teamName: team?.teamName || "Individual",
              date: new Date(attempt.submittedAt || "").toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              percentage: percentage.toFixed(1),
            };

            return (
              <Card key={idx} className="shadow-medium hover:shadow-large transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">{attempt.quizName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{certificateData.date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold">
                        {attempt.totalCorrectAnswers}/{attempt.totalQuestions}
                      </span>
                    </div>
                    <Badge variant={passed ? 'default' : 'secondary'}>
                      {certificateData.percentage}%
                    </Badge>
                  </div>

                  <Button
                    onClick={() => router.push(`/student/result/${attempt.quizId}`)}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Result
                  </Button>

                  {/* Certificate Download */}
                  {passed && (
                    <PDFDownloadLink
                      document={<CertificatePDF certificateData={certificateData} />}
                      fileName={`${certificateData.studentName.replace(/\s+/g, '_')}_${attempt.quizName.replace(/\s+/g, '_')}_Certificate.pdf`}
                      className="w-full"
                    >
                      {({ loading }) => (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download Certificate
                            </>
                          )}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}

                  {!passed && (
                    <Button
                      variant="outline"
                      className="w-full opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Certificate Unavailable (Need {CERTIFICATE_GENERATE_PERCENTAGE}%)
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
