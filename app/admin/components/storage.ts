export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timer: number;
  questions: Question[];
  createdAt: string;
}

export interface Applicant {
  id: string;
  quizId: string;
  name: string;
  email: string;
  score: number;
  submittedAt: string;
}

const QUIZZES_KEY = 'quizzes';
const APPLICANTS_KEY = 'applicants';

export const storage = {
  // Quizzes
  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(QUIZZES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveQuiz: (quiz: Quiz): void => {
    const quizzes = storage.getQuizzes();
    const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
    
    if (existingIndex !== -1) {
      quizzes[existingIndex] = quiz;
    } else {
      quizzes.push(quiz);
    }
    
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
  },
  
  getQuizById: (id: string): Quiz | undefined => {
    const quizzes = storage.getQuizzes();
    return quizzes.find(q => q.id === id);
  },
  
  deleteQuiz: (id: string): void => {
    const quizzes = storage.getQuizzes().filter(q => q.id !== id);
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
  },
  
  // Applicants
  getApplicants: (): Applicant[] => {
    const data = localStorage.getItem(APPLICANTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  getApplicantsByQuizId: (quizId: string): Applicant[] => {
    const applicants = storage.getApplicants();
    return applicants.filter(a => a.quizId === quizId);
  },
  
  saveApplicant: (applicant: Applicant): void => {
    const applicants = storage.getApplicants();
    applicants.push(applicant);
    localStorage.setItem(APPLICANTS_KEY, JSON.stringify(applicants));
  },
  
  // Initialize with demo data
  initializeDemoData: (): void => {
    if (storage.getQuizzes().length === 0) {
      const demoQuiz: Quiz = {
        id: '1',
        title: 'React Fundamentals',
        description: 'Test your knowledge of React basics',
        timer: 30,
        questions: [
          {
            id: 'q1',
            text: 'What is React?',
            options: ['A library', 'A framework', 'A language', 'An IDE'],
            correctAnswer: 0
          },
          {
            id: 'q2',
            text: 'What hook is used for side effects?',
            options: ['useState', 'useEffect', 'useContext', 'useReducer'],
            correctAnswer: 1
          }
        ],
        createdAt: new Date().toISOString()
      };
      
      storage.saveQuiz(demoQuiz);
      
      const demoApplicants: Applicant[] = [
        {
          id: 'a1',
          quizId: '1',
          name: 'John Doe',
          email: 'john@example.com',
          score: 85,
          submittedAt: new Date().toISOString()
        },
        {
          id: 'a2',
          quizId: '1',
          name: 'Jane Smith',
          email: 'jane@example.com',
          score: 95,
          submittedAt: new Date().toISOString()
        }
      ];
      
      demoApplicants.forEach(a => storage.saveApplicant(a));
    }
  }
};