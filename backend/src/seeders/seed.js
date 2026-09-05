const { sequelize, initDatabase } = require('../config/database');
const {
  User,
  Course,
  CourseEnrollment,
  QuestionCategory,
  Test,
  Question,
  Option,
  Submission,
  SubmissionAnswer,
  Assignment,
  AssignmentSubmission,
  Certificate,
  Badge,
  UserBadge,
  Announcement,
  ForumTopic,
  ForumPost,
  Notification
} = require('../models');

const seedData = async () => {
  try {
    console.log('[Seeder] Initializing database...');
    await initDatabase();
    await sequelize.authenticate();
    console.log('[Seeder] Connected to database.');
    
    if (sequelize.getDialect() === 'postgres') {
      console.log('[Seeder] Resetting PostgreSQL public schema...');
      await sequelize.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      console.log('[Seeder] Schema reset. Creating database tables...');
      await sequelize.sync();
    } else {
      await sequelize.sync({ force: true });
    }
    console.log('[Seeder] Database synced with fresh tables.');

    console.log('[Seeder] 1. Creating Users...');
    const teacher = await User.create({
      name: 'Prof. Alan Turing',
      email: 'teacher@test.com',
      password: 'password123',
      role: 'teacher'
    });

    const student1 = await User.create({
      name: 'Alex Rivera',
      email: 'student@test.com',
      password: 'password123',
      role: 'student'
    });

    const student2 = await User.create({
      name: 'Emma Watson',
      email: 'emma@test.com',
      password: 'password123',
      role: 'student'
    });

    console.log('[Seeder] Users created successfully.');

    // 2. Create Badges
    const badge1 = await Badge.create({
      name: 'Perfect 100% Score',
      description: 'Achieved a flawless 100% score on a published exam.',
      icon: 'TrophyOutlined',
      color: '#f59e0b',
      criteria_type: 'perfect_score'
    });

    const badge2 = await Badge.create({
      name: 'First Attempt Ace',
      description: 'Passed an assessment on the very first attempt.',
      icon: 'ThunderboltOutlined',
      color: '#10b981',
      criteria_type: 'first_attempt_pass'
    });

    const badge3 = await Badge.create({
      name: 'Consistent Scholar',
      description: 'Completed at least 3 assessments and submitted 2 assignments.',
      icon: 'BookOutlined',
      color: '#6366f1',
      criteria_type: 'course_master'
    });

    // 3. Create Question Categories
    const catAlgo = await QuestionCategory.create({
      name: 'Algorithms & Data Structures',
      description: 'Sorting, Graph traversals, Trees, Dynamic Programming, and Big-O.',
      color: '#3b82f6',
      teacher_id: teacher.id
    });

    const catWeb = await QuestionCategory.create({
      name: 'Full-Stack Web Development',
      description: 'React, Node.js, Express, REST APIs, and State Management.',
      color: '#10b981',
      teacher_id: teacher.id
    });

    const catDB = await QuestionCategory.create({
      name: 'Databases & SQL',
      description: 'ACID properties, Indexing, B-Trees, Normalization, and Transactions.',
      color: '#f59e0b',
      teacher_id: teacher.id
    });

    // 4. Create Courses
    const course1 = await Course.create({
      code: 'CS101',
      title: 'Computer Science Fundamentals & Algorithms',
      description: 'Core concepts of algorithms, data structures, computational complexity, and problem solving.',
      category: 'Computer Science',
      icon_color: '#4f46e5',
      instructor_id: teacher.id,
      is_published: true
    });

    const course2 = await Course.create({
      code: 'WD201',
      title: 'Modern Full-Stack Web Development with React & Node',
      description: 'Architecture of distributed web apps, React Hooks, Redux Toolkit, RESTful microservices, and database ORMs.',
      category: 'Web Development',
      icon_color: '#059669',
      instructor_id: teacher.id,
      is_published: true
    });

    // Enroll students into courses
    await CourseEnrollment.bulkCreate([
      { course_id: course1.id, student_id: student1.id, status: 'active' },
      { course_id: course1.id, student_id: student2.id, status: 'active' },
      { course_id: course2.id, student_id: student1.id, status: 'active' }
    ]);

    // 5. Populate Centralized Question Bank (covering all 9 Question Types)
    const bankQ1 = await Question.create({
      category_id: catAlgo.id,
      is_in_bank: true,
      created_by: teacher.id,
      difficulty: 'medium',
      tags: ['BST', 'Trees', 'Complexity'],
      question_text: 'What is the average search time complexity in a balanced Binary Search Tree (BST)?',
      question_type: 'single_choice',
      points: 2,
      explanation: 'Balanced BST search takes logarithmic time O(log n).'
    });
    await Option.bulkCreate([
      { question_id: bankQ1.id, option_text: 'O(1)', is_correct: false, order_index: 0 },
      { question_id: bankQ1.id, option_text: 'O(log n)', is_correct: true, order_index: 1 },
      { question_id: bankQ1.id, option_text: 'O(n)', is_correct: false, order_index: 2 },
      { question_id: bankQ1.id, option_text: 'O(n log n)', is_correct: false, order_index: 3 }
    ]);

    // Matching Question in Bank
    await Question.create({
      category_id: catAlgo.id,
      is_in_bank: true,
      created_by: teacher.id,
      difficulty: 'hard',
      tags: ['Matching', 'DataStructures'],
      question_text: 'Match each Data Structure to its primary Access / Storage discipline:',
      question_type: 'matching',
      points: 4,
      explanation: 'Stack uses LIFO, Queue uses FIFO, and Binary Heap provides logarithmic Priority access.',
      matching_pairs: [
        { id: 'm1', left: 'Stack', right: 'LIFO (Last In, First Out)' },
        { id: 'm2', left: 'Queue', right: 'FIFO (First In, First Out)' },
        { id: 'm3', left: 'Max-Heap', right: 'Constant Time Maximum Retrieval' },
        { id: 'm4', left: 'Hash Table', right: 'Average O(1) Key-Value Lookup' }
      ]
    });

    // Numerical Question in Bank
    await Question.create({
      category_id: catAlgo.id,
      is_in_bank: true,
      created_by: teacher.id,
      difficulty: 'easy',
      tags: ['Numerical', 'Math'],
      question_text: 'How many total edges does a complete undirected graph with 6 vertices have?',
      question_type: 'numerical',
      points: 3,
      numerical_answer: 15,
      tolerance: 0,
      unit: 'edges',
      explanation: 'Number of edges in complete graph = n*(n-1)/2 = 6*5/2 = 15 edges.'
    });

    // Cloze / Fill in the Blanks in Bank
    await Question.create({
      category_id: catWeb.id,
      is_in_bank: true,
      created_by: teacher.id,
      difficulty: 'medium',
      tags: ['React', 'Cloze'],
      question_text: 'Complete the sentence by filling in the missing React terms:',
      question_type: 'cloze',
      points: 3,
      cloze_template: 'In React, state values are declared with [blank_1], while side-effects like data fetching are executed inside [blank_2]. Mutable values that persist without re-renders use [blank_3].',
      cloze_answers: {
        blank_1: 'useState',
        blank_2: 'useEffect',
        blank_3: 'useRef'
      },
      explanation: 'useState manages state, useEffect triggers side effects, and useRef holds mutable references.'
    });

    // Ordering / Sequence Question in Bank
    await Question.create({
      category_id: catWeb.id,
      is_in_bank: true,
      created_by: teacher.id,
      difficulty: 'medium',
      tags: ['HTTP', 'Ordering'],
      question_text: 'Arrange the following HTTP Client-Server interaction lifecycle steps in chronological order:',
      question_type: 'ordering',
      points: 3,
      order_items: [
        '1. DNS Lookup translates domain to IP',
        '2. TCP Three-Way Handshake establishes connection',
        '3. TLS Certificate Exchange and handshake',
        '4. HTTP GET Request dispatched',
        '5. Server returns HTTP 200 Response payload'
      ],
      explanation: 'Standard web networking order: DNS -> TCP Handshake -> TLS -> HTTP Request -> HTTP Response.'
    });

    // Essay Question in Bank
    await Question.create({
      category_id: catDB.id,
      is_in_bank: true,
      created_by: teacher.id,
      difficulty: 'hard',
      tags: ['Databases', 'Essay'],
      question_text: 'Explain the difference between Optimistic Concurrency Control and Pessimistic Locking in high-throughput database systems. Provide a real-world scenario where Optimistic Locking is superior.',
      question_type: 'essay',
      points: 5,
      explanation: 'Optimistic concurrency assumes collisions are rare and verifies version/timestamp at commit. Pessimistic locks rows upfront.',
      rubric_criteria: [
        { title: 'Core Definition Accuracy', max_points: 2, description: 'Clearly explains lock-free vs row locking mechanisms.' },
        { title: 'Scenario Analysis', max_points: 2, description: 'Presents valid high-read, low-write real world use case.' },
        { title: 'Clarity & Depth', max_points: 1, description: 'Technical terminology used accurately.' }
      ]
    });

    // 6. Create Published Tests with all question types
    const test1 = await Test.create({
      course_id: course2.id,
      title: 'Full-Stack Web Engineering Mastery',
      description: 'Comprehensive assessment evaluating React Hooks, Redux Toolkit, HTTP Protocol, and Asynchronous Node.js architecture.',
      instructions: 'Answer all 6 questions. Safe Exam tab-switch detection is active. Time limit is 25 minutes.',
      duration_minutes: 25,
      pass_percentage: 60,
      category: 'Web Development',
      is_published: true,
      created_by: teacher.id,
      max_attempts: 3,
      grading_method: 'highest',
      enable_proctoring: true,
      max_proctoring_violations: 3,
      allow_review: true
    });

    // Add 6 diverse questions to Test 1
    const test1Q1 = await Question.create({
      test_id: test1.id,
      category_id: catWeb.id,
      question_text: 'Which React Hook is primarily used for dispatching actions in complex state logic?',
      question_type: 'single_choice',
      points: 2,
      explanation: 'useReducer handles complex state transitions cleanly.',
      order_index: 0
    });
    await Option.bulkCreate([
      { question_id: test1Q1.id, option_text: 'useState', is_correct: false, order_index: 0 },
      { question_id: test1Q1.id, option_text: 'useReducer', is_correct: true, order_index: 1 },
      { question_id: test1Q1.id, option_text: 'useRef', is_correct: false, order_index: 2 },
      { question_id: test1Q1.id, option_text: 'useMemo', is_correct: false, order_index: 3 }
    ]);

    const test1Q2 = await Question.create({
      test_id: test1.id,
      category_id: catWeb.id,
      question_text: 'Which of the following are benefits of Redux Toolkit? (Select all that apply)',
      question_type: 'multiple_choice',
      points: 3,
      explanation: 'RTK includes Immer, simplifies store config, and auto-generates action creators.',
      order_index: 1
    });
    await Option.bulkCreate([
      { question_id: test1Q2.id, option_text: 'Integrated Immer for mutable-syntax immutable updates', is_correct: true, order_index: 0 },
      { question_id: test1Q2.id, option_text: 'Simplified configureStore setup', is_correct: true, order_index: 1 },
      { question_id: test1Q2.id, option_text: 'Requires write boilerplates manually', is_correct: false, order_index: 2 },
      { question_id: test1Q2.id, option_text: 'Automatic action creator generation with createSlice', is_correct: true, order_index: 3 }
    ]);

    const test1Q3 = await Question.create({
      test_id: test1.id,
      category_id: catWeb.id,
      question_text: 'JavaScript runtime is single-threaded, but non-blocking I/O is achieved through the Event Loop.',
      question_type: 'true_false',
      points: 1,
      explanation: 'True. The event loop offloads tasks to libuv / browser web APIs.',
      order_index: 2
    });
    await Option.bulkCreate([
      { question_id: test1Q3.id, option_text: 'True', is_correct: true, order_index: 0 },
      { question_id: test1Q3.id, option_text: 'False', is_correct: false, order_index: 1 }
    ]);

    await Question.create({
      test_id: test1.id,
      category_id: catWeb.id,
      question_text: 'Match the standard HTTP Status Code to its exact category:',
      question_type: 'matching',
      points: 4,
      explanation: '200 = Success, 301 = Redirection, 401 = Client Auth Error, 503 = Server Unavailable.',
      matching_pairs: [
        { id: 'h1', left: 'HTTP 200 OK', right: 'Successful Response' },
        { id: 'h2', left: 'HTTP 301 Moved Permanently', right: 'Redirection' },
        { id: 'h3', left: 'HTTP 401 Unauthorized', right: 'Client Authentication Error' },
        { id: 'h4', left: 'HTTP 503 Service Unavailable', right: 'Server Overload / Maintenance' }
      ],
      order_index: 3
    });

    await Question.create({
      test_id: test1.id,
      category_id: catWeb.id,
      question_text: 'If an API server receives 120 requests per second and each request takes an average of 25ms, calculate the average concurrent connections (Little\'s Law: L = λ * W). (Answer in connections):',
      question_type: 'numerical',
      points: 3,
      numerical_answer: 3,
      tolerance: 0.1,
      unit: 'connections',
      explanation: 'L = 120 req/s * 0.025 s = 3 concurrent requests.',
      order_index: 4
    });

    await Question.create({
      test_id: test1.id,
      category_id: catWeb.id,
      question_text: 'Discuss the architectural trade-offs between Server-Side Rendering (SSR) and Client-Side Rendering (CSR). How does Hydration work in modern SSR frameworks?',
      question_type: 'essay',
      points: 5,
      explanation: 'SSR sends pre-rendered HTML for fast FCP and SEO, then hydrates DOM with JavaScript event handlers.',
      rubric_criteria: [
        { title: 'SSR vs CSR Comparison', max_points: 2, description: 'Covers SEO, FCP, Time to Interactive, and server load.' },
        { title: 'Hydration Process Explanation', max_points: 2, description: 'Explains attaching React event listeners to static markup.' },
        { title: 'Structural Quality', max_points: 1, description: 'Clear and coherent breakdown.' }
      ],
      order_index: 5
    });

    // 7. Create Test 2: Algorithms & Data Structures
    const test2 = await Test.create({
      course_id: course1.id,
      title: 'Data Structures & Algorithmic Efficiency',
      description: 'Big-O complexities, Binary Search Trees, Graphs, and Hash Tables.',
      instructions: '15 minutes timer. 1 attempt allowed.',
      duration_minutes: 15,
      pass_percentage: 50,
      category: 'Computer Science',
      is_published: true,
      created_by: teacher.id,
      max_attempts: 1,
      grading_method: 'highest',
      enable_proctoring: true,
      allow_review: true
    });

    const test2Q1 = await Question.create({
      test_id: test2.id,
      category_id: catAlgo.id,
      question_text: 'What is the worst-case time complexity of standard Quicksort with poor pivot selection?',
      question_type: 'single_choice',
      points: 2,
      explanation: 'Worst case Quicksort occurs when the array is already sorted and pivot is extreme, leading to O(n^2).',
      order_index: 0
    });
    await Option.bulkCreate([
      { question_id: test2Q1.id, option_text: 'O(n log n)', is_correct: false, order_index: 0 },
      { question_id: test2Q1.id, option_text: 'O(n)', is_correct: false, order_index: 1 },
      { question_id: test2Q1.id, option_text: 'O(n^2)', is_correct: true, order_index: 2 },
      { question_id: test2Q1.id, option_text: 'O(log n)', is_correct: false, order_index: 3 }
    ]);

    // 8. Create Assignments with Rubrics
    const assignment1 = await Assignment.create({
      course_id: course2.id,
      created_by: teacher.id,
      title: 'Project 1: Scalable REST API with Sequelize ORM & JWT',
      description: 'Implement a complete backend authentication and CRUD microservice with role-based access control.',
      instructions: 'Submit your solution notes, architectural diagram description, and Github repository link.',
      max_points: 100,
      due_date: new Date(Date.now() + 7 * 86400000),
      rubric_criteria: [
        { title: 'Schema Design & Associations', max_points: 30, description: 'Proper relational normalization, foreign keys, and indexes.' },
        { title: 'JWT Authentication & Security', max_points: 30, description: 'Secure password hashing with bcrypt, token expiry, and role guards.' },
        { title: 'API RESTfulness & Error Handling', max_points: 25, description: 'Proper HTTP status codes, structured JSON responses, and validation.' },
        { title: 'Code Cleanliness & Documentation', max_points: 15, description: 'Modular architecture, comments, and README setup instructions.' }
      ],
      is_published: true
    });

    const assignment2 = await Assignment.create({
      course_id: course1.id,
      created_by: teacher.id,
      title: 'Lab 2: Dynamic Programming & Graph Shortest Path',
      description: 'Implement Dijkstra\'s and Bellman-Ford algorithms with adjacency list representation.',
      instructions: 'Submit your algorithmic complexity breakdown and test case validations.',
      max_points: 50,
      due_date: new Date(Date.now() + 10 * 86400000),
      rubric_criteria: [
        { title: 'Algorithm Correctness', max_points: 25, description: 'Handles negative weights detection and priority queue correctly.' },
        { title: 'Time Complexity Analysis', max_points: 25, description: 'Detailed Big-O proof for dense vs sparse graphs.' }
      ],
      is_published: true
    });

    // Student 1 submits Assignment 1
    await AssignmentSubmission.create({
      assignment_id: assignment1.id,
      student_id: student1.id,
      submission_text: `### Full-Stack Microservice Implementation\n\n- **GitHub Repo**: https://github.com/alexrivera/secure-rest-api\n- **Architecture**: Express + Sequelize MySQL with JWT Authentication.\n- **Security**: Passwords salted with bcrypt (10 rounds), authorization middleware verifies JWT tokens and enforces role-based endpoint permissions.`,
      score_obtained: 95,
      teacher_feedback: 'Outstanding architecture Alex! Clean separation of routes, controllers, and models. Excellent error handling.',
      rubric_scores: {
        'Schema Design & Associations': 30,
        'JWT Authentication & Security': 28,
        'API RESTfulness & Error Handling': 23,
        'Code Cleanliness & Documentation': 14
      },
      status: 'graded',
      submitted_at: new Date(Date.now() - 86400000),
      graded_at: new Date(),
      graded_by: teacher.id
    });

    // 9. Sample Test Submissions & Certificates
    const test1Questions = await Question.findAll({
      where: { test_id: test1.id },
      include: [{ model: Option, as: 'options' }]
    });

    const alexAnswers = [];
    let alexScore = 0;
    let alexMax = 0;

    test1Questions.forEach((q) => {
      alexMax += q.points;
      if (q.question_type === 'single_choice') {
        const correctOpt = q.options.find((o) => o.is_correct);
        alexScore += q.points;
        alexAnswers.push({
          question_id: q.id,
          selected_option_ids: [correctOpt.id],
          is_correct: true,
          points_awarded: q.points
        });
      } else if (q.question_type === 'multiple_choice') {
        const correctOpts = q.options.filter((o) => o.is_correct).map((o) => o.id);
        alexScore += q.points;
        alexAnswers.push({
          question_id: q.id,
          selected_option_ids: correctOpts,
          is_correct: true,
          points_awarded: q.points
        });
      } else if (q.question_type === 'true_false') {
        const correctOpt = q.options.find((o) => o.is_correct);
        alexScore += q.points;
        alexAnswers.push({
          question_id: q.id,
          selected_option_ids: [correctOpt.id],
          is_correct: true,
          points_awarded: q.points
        });
      } else if (q.question_type === 'matching') {
        alexScore += q.points;
        alexAnswers.push({
          question_id: q.id,
          matching_answers: {
            h1: 'Successful Response',
            h2: 'Redirection',
            h3: 'Client Authentication Error',
            h4: 'Server Overload / Maintenance'
          },
          is_correct: true,
          points_awarded: q.points
        });
      } else if (q.question_type === 'numerical') {
        alexScore += q.points;
        alexAnswers.push({
          question_id: q.id,
          numerical_answer: 3,
          is_correct: true,
          points_awarded: q.points
        });
      } else if (q.question_type === 'essay') {
        // Teacher graded essay
        alexScore += 5;
        alexAnswers.push({
          question_id: q.id,
          essay_answer: 'SSR generates HTML strings on the Node server per request, sending ready DOM to browser for fast First Contentful Paint and optimal SEO indexing. Hydration is the process where client-side React parses the server-rendered HTML and attaches virtual DOM event listeners without re-creating DOM nodes.',
          is_correct: true,
          points_awarded: 5,
          teacher_comment: 'Exemplary explanation of the React hydration mechanics!'
        });
      }
    });

    const alexPct = Math.round((alexScore / alexMax) * 100 * 10) / 10;
    const sub1 = await Submission.create({
      test_id: test1.id,
      student_id: student1.id,
      attempt_number: 1,
      total_questions: test1Questions.length,
      correct_answers_count: test1Questions.length,
      score_obtained: alexScore,
      max_score: alexMax,
      percentage: alexPct,
      is_passed: alexPct >= test1.pass_percentage,
      time_taken_seconds: 540,
      status: 'completed',
      is_manually_graded: true,
      proctoring_violations_count: 0,
      proctoring_logs: [],
      started_at: new Date(Date.now() - 7200000),
      submitted_at: new Date(Date.now() - 6660000)
    });

    await SubmissionAnswer.bulkCreate(
      alexAnswers.map((a) => ({ ...a, submission_id: sub1.id }))
    );

    // Certificate for Alex
    await Certificate.create({
      certificate_code: `CERT-${test1.id}-${student1.id}-PRO`,
      student_id: student1.id,
      test_id: test1.id,
      course_id: course2.id,
      title: `Certificate of Mastery: ${test1.title}`,
      score_percentage: alexPct,
      issue_date: new Date()
    });

    // Award Badges to Alex
    await UserBadge.create({
      user_id: student1.id,
      badge_id: badge1.id,
      reason: 'Flawless 100% on Full-Stack Web Engineering Mastery'
    });
    await UserBadge.create({
      user_id: student1.id,
      badge_id: badge2.id,
      reason: 'Passed on first attempt'
    });

    // 10. Create Announcements
    await Announcement.create({
      course_id: course2.id,
      created_by: teacher.id,
      title: '📢 Midterm Exam & Assignment 1 Schedule Announced',
      content: 'Welcome students to the Full-Stack Engineering Module. Please review the rubric criteria for Assignment 1. The exam room is equipped with focus-loss proctoring detection.',
      priority: 'urgent',
      is_pinned: true
    });

    await Announcement.create({
      course_id: null,
      created_by: teacher.id,
      title: '🌟 New Question Bank & Certificate Verification System Live',
      content: 'All verified certificates now carry official validation codes. You can inspect your digital badges in your profile.',
      priority: 'info',
      is_pinned: false
    });

    // 11. Create Discussion Forums
    const topic1 = await ForumTopic.create({
      course_id: course2.id,
      author_id: student1.id,
      title: 'How does React 19 Action dispatch handle optimistic UI updates?',
      content: 'I am comparing useOptimistic with traditional Redux state mutations. In what order does the rollback occur if the server throws a 500 error?',
      category_tag: 'React & State Flow',
      is_pinned: true,
      is_solved: true,
      upvotes_count: 8
    });

    await ForumPost.create({
      topic_id: topic1.id,
      author_id: teacher.id,
      content: 'Great question Alex! `useOptimistic` immediately displays the temporary state while the async action is pending. If the promise rejects, React automatically discards the optimistic value and reverts back to the base state synchronously.',
      is_accepted_answer: true,
      upvotes_count: 12
    });

    // 12. Create Notifications
    await Notification.create({
      user_id: student1.id,
      title: 'Certificate Issued!',
      message: `Your Certificate for ${test1.title} is now ready for download!`,
      type: 'badge',
      link_url: '/student/certificates'
    });

    await Notification.create({
      user_id: student1.id,
      title: 'Assignment Graded',
      message: 'Your Project 1 submission was reviewed by Prof. Alan Turing. Grade: 95/100.',
      type: 'grade',
      link_url: '/student/assignments'
    });

    console.log('[Seeder] Database successfully populated with comprehensive Moodle ecosystem data!');
    console.log('--- Demo Credentials ---');
    console.log('Teacher: teacher@test.com / password123');
    console.log('Student: student@test.com / password123');
    console.log('Student: emma@test.com / password123');
    console.log('------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
