// Mock data for courses
// export const mockCourses = [
//     {
//       id: '1',
//       title: 'Introduction to Web Development',
//       description: 'Learn the basics of HTML, CSS, and JavaScript',
//       thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
//       level: 'Beginner',
//       duration: '8 weeks',
//       curriculum: [
//         {
//           title: 'HTML Fundamentals',
//           lessons: [
//             { title: 'Basic HTML Structure', duration: '30 min' },
//             { title: 'HTML Elements and Tags', duration: '45 min' },
//             { title: 'Forms and Input Elements', duration: '60 min' }
//           ]
//         },
//         {
//           title: 'CSS Styling',
//           lessons: [
//             { title: 'CSS Selectors', duration: '45 min' },
//             { title: 'Box Model', duration: '30 min' },
//             { title: 'Flexbox Layout', duration: '60 min' }
//           ]
//         }
//       ]
//     },
//     {
//       id: '2',
//       title: 'Advanced JavaScript',
//       description: 'Master modern JavaScript concepts and frameworks',
//       thumbnail: 'https://images.pexels.com/photos/177598/pexels-photo-177598.jpeg',
//       level: 'Advanced',
//       duration: '12 weeks',
//       curriculum: [
//         {
//           title: 'ES6+ Features',
//           lessons: [
//             { title: 'Arrow Functions', duration: '45 min' },
//             { title: 'Destructuring', duration: '30 min' },
//             { title: 'Async/Await', duration: '60 min' }
//           ]
//         },
//         {
//           title: 'React Fundamentals',
//           lessons: [
//             { title: 'Components', duration: '45 min' },
//             { title: 'State Management', duration: '60 min' },
//             { title: 'Hooks', duration: '45 min' }
//           ]
//         }
//       ]
//     },
//     {
//       id: '3',
//       title: 'Python Programming',
//       description: 'Learn Python programming from scratch',
//       thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
//       level: 'Intermediate',
//       duration: '10 weeks',
//       curriculum: [
//         {
//           title: 'Python Basics',
//           lessons: [
//             { title: 'Variables and Data Types', duration: '45 min' },
//             { title: 'Control Flow', duration: '60 min' },
//             { title: 'Functions', duration: '45 min' }
//           ]
//         }
//       ]
//     }
//   ];
  
  // Mock data for students
  export const mockStudents = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      progress: 75,
      status: 'Active',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      progress: 90,
      status: 'Active',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'm.brown@example.com',
      progress: 45,
      status: 'Inactive',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    }
  ];
  
  // Mock data for quizzes
//   export const mockQuizzes = [
//     {
//       id: '1',
//       title: 'HTML Basics Quiz',
//       description: 'Test your knowledge of HTML fundamentals',
//       difficulty: 'Easy',
//       questions: 10,
//       duration: 15
//     },
//     {
//       id: '2',
//       title: 'JavaScript Advanced Concepts',
//       description: 'Challenge yourself with advanced JavaScript topics',
//       difficulty: 'Hard',
//       questions: 20,
//       duration: 30
//     },
//     {
//       id: '3',
//       title: 'CSS Layout Quiz',
//       description: 'Test your understanding of CSS layouts',
//       difficulty: 'Medium',
//       questions: 15,
//       duration: 20
//     }
//   ];
  
//   // Mock data for dashboard stats
//   export const mockStats = [
//     {
//       title: 'Total Students',
//       value: '1,234',
//       icon: '👥'
//     },
//     {
//       title: 'Active Courses',
//       value: '12',
//       icon: '📚'
//     },
//     {
//       title: 'Completion Rate',
//       value: '85%',
//       icon: '📈'
//     }
//   ];
  
  // Mock data for charts
  export const mockChartData = [
    { name: 'Jan', progress: 65 },
    { name: 'Feb', progress: 75 },
    { name: 'Mar', progress: 85 },
    { name: 'Apr', progress: 78 },
    { name: 'May', progress: 90 },
    { name: 'Jun', progress: 95 }
  ];



  export const mockCourses = [
  {
    id: '1',
    title: 'React Development Masterclass',
    description: 'Learn React from basics to advanced concepts including hooks, context, and performance optimization.',
    instructor: 'John Smith',
    duration: '8 weeks',
    level: 'Intermediate',
    enrolledStudents: 245,
    price: 199,
    status: 'Active',
    createdAt: new Date('2024-01-15'),
    thumbnail: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    title: 'JavaScript Fundamentals',
    description: 'Master JavaScript ES6+ features, async programming, and modern development practices.',
    instructor: 'Sarah Johnson',
    duration: '6 weeks',
    level: 'Beginner',
    enrolledStudents: 189,
    price: 149,
    status: 'Active',
    createdAt: new Date('2024-02-01'),
    thumbnail: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    title: 'Advanced TypeScript',
    description: 'Deep dive into TypeScript advanced types, generics, and enterprise patterns.',
    instructor: 'Mike Chen',
    duration: '4 weeks',
    level: 'Advanced',
    enrolledStudents: 67,
    price: 299,
    status: 'Draft',
    createdAt: new Date('2024-02-15'),
    thumbnail: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const mockLessons = [
  {
    id: '1',
    courseId: '1',
    title: 'Introduction to React',
    description: 'Getting started with React components and JSX',
    duration: '45 min',
    order: 1,
    content: 'In this lesson, we will cover the basics of React...',
    isCompleted: false,
    createdAt: new Date('2024-01-16')
  },
  {
    id: '2',
    courseId: '1',
    title: 'React Hooks Deep Dive',
    description: 'Understanding useState, useEffect, and custom hooks',
    duration: '60 min',
    order: 2,
    content: 'React Hooks revolutionized how we write React components...',
    isCompleted: false,
    createdAt: new Date('2024-01-18')
  },
  {
    id: '3',
    courseId: '2',
    title: 'Variables and Data Types',
    description: 'Learn about JavaScript variables, let, const, and data types',
    duration: '30 min',
    order: 1,
    content: 'JavaScript has several ways to declare variables...',
    isCompleted: false,
    createdAt: new Date('2024-02-02')
  }
];

export const mockQuestions = [
  {
    id: '1',
    text: 'What is JSX?',
    type: 'multiple-choice',
    options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
    correctAnswer: 0,
    points: 10
  },
  {
    id: '2',
    text: 'React is a library for building user interfaces.',
    type: 'true-false',
    correctAnswer: 'true',
    points: 5
  }
];

export const mockQuizzes = [
  {
    id: '1',
    courseId: '1',
    lessonId: '1',
    title: 'React Basics Quiz',
    description: 'Test your understanding of React fundamentals',
    questions: mockQuestions,
    timeLimit: 30,
    passingScore: 70,
    attempts: 3,
    isActive: true,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '2',
    courseId: '2',
    title: 'JavaScript Variables Quiz',
    description: 'Quiz on JavaScript variable declarations and scoping',
    questions: mockQuestions,
    timeLimit: 15,
    passingScore: 80,
    attempts: 2,
    isActive: true,
    createdAt: new Date('2024-02-05')
  }
];

export const mockActivities = [
  {
    id: '1',
    type: 'enrollment',
    description: 'New student enrolled in React Development Masterclass',
    timestamp: new Date('2024-12-09T10:30:00')
  },
  {
    id: '2',
    type: 'completion',
    description: 'Student completed Introduction to React lesson',
    timestamp: new Date('2024-12-09T09:15:00')
  },
  {
    id: '3',
    type: 'quiz_submission',
    description: 'Quiz submission for React Basics Quiz',
    timestamp: new Date('2024-12-09T08:45:00')
  }
];

export const mockInstructorStats = {
  totalCourses: 3,
  totalStudents: 501,
  activeQuizzes: 2,
  completionRate: 78.5,
  revenue: 45750,
  recentActivity: mockActivities
};