const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function runE2ETests() {
  console.log('🚀 Starting Full Moodle Test & Assessment Ecosystem End-to-End Test Suite...\n');

  try {
    // 1. Health check
    const healthRes = await axios.get(`${API_BASE}/health`);
    console.log('✅ 1. Health check passed:', healthRes.data.service);

    // 2. Teacher Login
    const teacherLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teacher@test.com',
      password: 'password123'
    });
    const teacherToken = teacherLoginRes.data.token;
    const teacherAuth = { headers: { Authorization: `Bearer ${teacherToken}` } };
    console.log('✅ 2. Teacher login successful:', teacherLoginRes.data.user.name);

    // 3. Student Login
    const studentLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student@test.com',
      password: 'password123'
    });
    const studentToken = studentLoginRes.data.token;
    const studentAuth = { headers: { Authorization: `Bearer ${studentToken}` } };
    console.log('✅ 3. Student login successful:', studentLoginRes.data.user.name);

    // 4. Question Bank: Category creation & Bank Question Authoring
    const catRes = await axios.post(
      `${API_BASE}/question-bank/categories`,
      {
        name: 'Distributed Systems & Cloud',
        description: 'Microservices, Consensus algorithms, RPCs, and Fault tolerance.',
        color: '#8b5cf6'
      },
      teacherAuth
    );
    const newCatId = catRes.data.category.id;
    console.log(`✅ 4. Question Bank Category created: #${newCatId} "${catRes.data.category.name}"`);

    // Add Matching & Numerical Questions to Bank
    const bankMatchRes = await axios.post(
      `${API_BASE}/question-bank/questions`,
      {
        category_id: newCatId,
        question_text: 'Match the cloud computing service model with its standard abbreviation:',
        question_type: 'matching',
        points: 3,
        difficulty: 'medium',
        matching_pairs: [
          { id: 'c1', left: 'Infrastructure as a Service', right: 'IaaS' },
          { id: 'c2', left: 'Platform as a Service', right: 'PaaS' },
          { id: 'c3', left: 'Software as a Service', right: 'SaaS' }
        ]
      },
      teacherAuth
    );
    const bankMatchId = bankMatchRes.data.question.id;
    console.log(`✅ 5. Created Matching Question #${bankMatchId} in Question Bank.`);

    // 5. Course Management & Enrollment
    const dynamicCode = 'DS' + Math.floor(100 + Math.random() * 900);
    const courseRes = await axios.post(
      `${API_BASE}/courses`,
      {
        code: dynamicCode,
        title: 'Distributed Systems & Cloud Computing',
        description: 'Advanced engineering of fault-tolerant distributed networks and consensus.',
        category: 'Computer Science',
        icon_color: '#8b5cf6'
      },
      teacherAuth
    );
    const courseId = courseRes.data.course.id;
    console.log(`✅ 6. Course created: #${courseId} "${courseRes.data.course.title}"`);

    // Student enrolls in Course
    await axios.post(`${API_BASE}/courses/${courseId}/enroll`, {}, studentAuth);
    console.log(`✅ 7. Student successfully enrolled in Course #${courseId}`);

    // 6. Test Creation & Importing Question from Bank
    const newTestRes = await axios.post(
      `${API_BASE}/tests`,
      {
        course_id: courseId,
        title: 'Cloud Architecture & Protocols Exam',
        description: 'Evaluating PaaS, IaaS, Raft Consensus, and Network Latencies.',
        duration_minutes: 20,
        pass_percentage: 60,
        category: 'Computer Science',
        max_attempts: 2,
        enable_proctoring: true,
        is_published: true
      },
      teacherAuth
    );
    const testId = newTestRes.data.test.id;
    console.log(`✅ 8. Teacher created Test #${testId} linked to Course #${courseId}`);

    // Import Question from Question Bank into Test
    await axios.post(
      `${API_BASE}/question-bank/import-to-test`,
      { testId, questionIds: [bankMatchId] },
      teacherAuth
    );
    console.log(`✅ 9. Imported Question #${bankMatchId} from Question Bank directly into Test #${testId}`);

    // Add Numerical Question directly to Test
    const numQRes = await axios.post(
      `${API_BASE}/questions/test/${testId}`,
      {
        question_text: 'If a distributed cluster achieves 99.9% uptime per year (365 days), what is the maximum allowed downtime in hours? (Answer in hours):',
        question_type: 'numerical',
        points: 3,
        numerical_answer: 8.76,
        tolerance: 0.1,
        unit: 'hours'
      },
      teacherAuth
    );
    const numQId = numQRes.data.question.id;
    console.log(`✅ 10. Added Numerical Question #${numQId} to Test #${testId}`);

    // 7. Student takes the Exam (Evaluates Matching & Numerical)
    const examDetailRes = await axios.get(`${API_BASE}/tests/${testId}`, studentAuth);
    const testQuestions = examDetailRes.data.test.questions;

    const matchQInTest = testQuestions.find((q) => q.question_type === 'matching');
    const numQInTest = testQuestions.find((q) => q.question_type === 'numerical');

    const submitRes = await axios.post(
      `${API_BASE}/submissions/test/${testId}`,
      {
        answers: [
          {
            question_id: matchQInTest.id,
            matching_answers: {
              c1: 'IaaS',
              c2: 'PaaS',
              c3: 'SaaS'
            }
          },
          {
            question_id: numQInTest.id,
            numerical_answer: 8.76
          }
        ],
        time_taken_seconds: 120,
        proctoring_violations_count: 0
      },
      studentAuth
    );

    const submission = submitRes.data.submission;
    console.log(`✅ 11. Student submitted Exam #${testId}! Score: ${submission.score_obtained} / ${submission.max_score} (${submission.percentage}%) - Passed: ${submission.is_passed}`);
    if (submission.percentage !== 100) {
      throw new Error(`Expected 100% score but got ${submission.percentage}%`);
    }

    // 8. Assignments & Rubric Grading
    const assgnRes = await axios.post(
      `${API_BASE}/assignments`,
      {
        course_id: courseId,
        title: 'Distributed Hash Table (Chord) Simulation',
        description: 'Implement a virtual ring DHT with finger table routing in Node.js.',
        max_points: 50,
        rubric_criteria: [
          { title: 'Finger Table Routing', max_points: 25 },
          { title: 'Node Join/Leave Handling', max_points: 25 }
        ]
      },
      teacherAuth
    );
    const assgnId = assgnRes.data.assignment.id;
    console.log(`✅ 12. Assignment created: #${assgnId} "${assgnRes.data.assignment.title}"`);

    // Student submits assignment
    const assgnSubmitRes = await axios.post(
      `${API_BASE}/assignments/${assgnId}/submit`,
      {
        submission_text: 'DHT Chord node ring implementation with O(log N) lookup lookup tests included.'
      },
      studentAuth
    );
    const assgnSubId = assgnSubmitRes.data.submission.id;
    console.log(`✅ 13. Student submitted Assignment #${assgnId}`);

    // Teacher grades assignment with rubrics
    await axios.post(
      `${API_BASE}/assignments/grade/${assgnSubId}`,
      {
        score_obtained: 48,
        teacher_feedback: 'Superb routing implementation!',
        rubric_scores: { 'Finger Table Routing': 24, 'Node Join/Leave Handling': 24 }
      },
      teacherAuth
    );
    console.log(`✅ 14. Teacher graded Assignment submission with rubric scores.`);

    // 9. Gradebook Overview & CSV Export
    const gradebookRes = await axios.get(`${API_BASE}/gradebook/overview`, teacherAuth);
    console.log(`✅ 15. Gradebook Overview retrieved for ${gradebookRes.data.gradebook.length} enrolled students.`);

    const csvRes = await axios.get(`${API_BASE}/gradebook/export-csv`, teacherAuth);
    if (!csvRes.data.includes('Student ID') || !csvRes.data.includes('Average Score')) {
      throw new Error('Gradebook CSV export missing expected headers!');
    }
    console.log('✅ 16. Gradebook CSV Export generated successfully.');

    // 10. Certificates & Badges Verification
    const certsRes = await axios.get(`${API_BASE}/gamification/my-certificates`, studentAuth);
    console.log(`✅ 17. Student Certificates verified: ${certsRes.data.certificates.length} certificate(s) on file.`);

    const badgesRes = await axios.get(`${API_BASE}/gamification/my-badges`, studentAuth);
    const earnedCount = badgesRes.data.badges.filter((b) => b.is_earned).length;
    console.log(`✅ 18. Student Badges retrieved: ${earnedCount} badge(s) earned.`);

    // 11. Announcements & Forum Discussions
    await axios.post(
      `${API_BASE}/communication/announcements`,
      {
        course_id: courseId,
        title: 'Project 2 Released',
        content: 'Check the assignments tab for specifications.',
        priority: 'normal'
      },
      teacherAuth
    );
    console.log('✅ 19. Course Announcement published and notifications dispatched.');

    const forumTopicRes = await axios.post(
      `${API_BASE}/communication/forums`,
      {
        course_id: courseId,
        title: 'Chord Finger Table Indexing Clarification',
        content: 'Should node identifiers be hashed using SHA-1 or SHA-256 for the ring modulo?'
      },
      studentAuth
    );
    const topicId = forumTopicRes.data.topic.id;

    await axios.post(
      `${API_BASE}/communication/forums/${topicId}/reply`,
      {
        content: 'Use standard SHA-1 with modulo 2^m where m=160 bits for the standard paper simulation.'
      },
      teacherAuth
    );
    console.log(`✅ 20. Discussion Forum thread #${topicId} created and replied.`);

    console.log('\n🌟🎉 ALL 20 END-TO-END MOODLE PLATFORM MODULE TESTS PASSED WITH 100% SUCCESS! 🚀');
  } catch (error) {
    console.error('❌ E2E Test Suite Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

runE2ETests();
