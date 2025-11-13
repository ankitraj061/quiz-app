export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  questions: QuizQuestion[];
}

export const QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and data types.',
    duration: 600, // 10 minutes
    questions: [
      {
        id: 'q1',
        question: 'Which of the following is NOT a JavaScript data type?',
        options: ['String', 'Boolean', 'Float', 'Undefined'],
        correctAnswer: 2,
      },
      {
        id: 'q2',
        question: 'What does the "===" operator do in JavaScript?',
        options: ['Assigns a value', 'Compares value only', 'Compares value and type', 'Compares memory address'],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0,
      },
      {
        id: 'q4',
        question: 'What will "typeof null" return?',
        options: ['null', 'undefined', 'object', 'number'],
        correctAnswer: 2,
      },
      {
        id: 'q5',
        question: 'Which keyword is used to declare a block-scoped variable?',
        options: ['var', 'let', 'const', 'Both let and const'],
        correctAnswer: 3,
      },
    ],
  },
  {
    id: 'quiz-2',
    title: 'React Essentials',
    description: 'Explore core React concepts including components, hooks, and state management.',
    duration: 900, // 15 minutes
    questions: [
      {
        id: 'q1',
        question: 'What is JSX?',
        options: ['A JavaScript framework', 'A syntax extension for JavaScript', 'A CSS preprocessor', 'A database query language'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'Which hook is used to manage component state?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        question: 'What does the useEffect hook do?',
        options: ['Creates state', 'Performs side effects', 'Creates refs', 'Manages context'],
        correctAnswer: 1,
      },
      {
        id: 'q4',
        question: 'How do you pass data from parent to child component?',
        options: ['Using state', 'Using props', 'Using context', 'Using refs'],
        correctAnswer: 1,
      },
      {
        id: 'q5',
        question: 'What is the virtual DOM?',
        options: ['A copy of the real DOM', 'A lightweight representation of the DOM', 'A database', 'A routing system'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'quiz-3',
    title: 'CSS & Styling',
    description: 'Master CSS properties, layouts, and modern styling techniques.',
    duration: 480, // 8 minutes
    questions: [
      {
        id: 'q1',
        question: 'Which CSS property is used to change text color?',
        options: ['text-color', 'font-color', 'color', 'text-style'],
        correctAnswer: 2,
      },
      {
        id: 'q2',
        question: 'What does "display: flex" do?',
        options: ['Creates a grid layout', 'Creates a flexible box layout', 'Hides the element', 'Makes the element inline'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        question: 'Which unit is relative to the font-size of the root element?',
        options: ['em', 'rem', 'px', 'vh'],
        correctAnswer: 1,
      },
      {
        id: 'q4',
        question: 'What is the default position value of an element?',
        options: ['relative', 'absolute', 'static', 'fixed'],
        correctAnswer: 2,
      },
      {
        id: 'q5',
        question: 'Which pseudo-class targets the first child element?',
        options: [':first', ':first-child', ':first-of-type', ':nth-child(1)'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'quiz-4',
    title: 'Web Development Basics',
    description: 'Fundamental concepts every web developer should know.',
    duration: 720, // 12 minutes
    questions: [
      {
        id: 'q1',
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
        correctAnswer: 0,
      },
      {
        id: 'q2',
        question: 'Which protocol is used for secure web communication?',
        options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        question: 'What is the purpose of the <head> tag in HTML?',
        options: ['Contains the main content', 'Contains metadata', 'Contains navigation', 'Contains footer information'],
        correctAnswer: 1,
      },
      {
        id: 'q4',
        question: 'Which tag is used to create a hyperlink?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correctAnswer: 1,
      },
      {
        id: 'q5',
        question: 'What does CSS stand for?',
        options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
        correctAnswer: 1,
      },
    ],
  },
];