import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';

// Common Components
import AppHeader from './components/common/AppHeader';
import AppSidebar from './components/common/AppSidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TestEditorPage from './pages/teacher/TestEditorPage';
import TestSubmissionsPage from './pages/teacher/TestSubmissionsPage';
import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage';
import StudentManagementPage from './pages/teacher/StudentManagementPage';
import QuestionBankPage from './pages/teacher/QuestionBankPage';
import CoursesManagerPage from './pages/teacher/CoursesManagerPage';
import AssignmentsTeacherPage from './pages/teacher/AssignmentsTeacherPage';
import GradebookPage from './pages/teacher/GradebookPage';
import TeacherLiveProctoringPage from './pages/teacher/TeacherLiveProctoringPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentHistoryPage from './pages/student/StudentHistoryPage';
import StudentCertificatesBadgesPage from './pages/student/StudentCertificatesBadgesPage';
import ExamPage from './pages/student/ExamPage';
import ResultSummaryPage from './pages/student/ResultSummaryPage';

// Shared Pages
import AnnouncementsPage from './pages/common/AnnouncementsPage';
import DiscussionForumPage from './pages/common/DiscussionForumPage';

const { Content } = Layout;

// Dashboard Layout with Fixed & Collapsible Sidebar and Scrolling Content
const DashboardLayout = () => {
  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('pariksha_sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = (val) => {
    const nextVal = typeof val === 'boolean' ? val : !collapsed;
    setCollapsed(nextVal);
    localStorage.setItem('pariksha_sidebar_collapsed', String(nextVal));
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <AppHeader
        showToggle={true}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <Layout style={{ position: 'relative' }}>
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        <Content
          style={{
            marginLeft: collapsed ? '80px' : '240px',
            minHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
            transition: 'margin-left 0.2s cubic-bezier(0.2, 0, 0, 1)'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

// Simple Header-only Layout for Results
const HeaderOnlyLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <AppHeader />
      <Content style={{ minHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated && user ? (
            <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* Teacher Module Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="question-bank" element={<QuestionBankPage />} />
        <Route path="courses" element={<CoursesManagerPage />} />
        <Route path="assignments" element={<AssignmentsTeacherPage />} />
        <Route path="gradebook" element={<GradebookPage />} />
        <Route path="proctoring" element={<TeacherLiveProctoringPage />} />
        <Route path="students" element={<StudentManagementPage />} />
        <Route path="analytics" element={<TeacherAnalyticsPage />} />
        <Route path="test/:id" element={<TestEditorPage />} />
        <Route path="test/:testId/submissions" element={<TestSubmissionsPage />} />
      </Route>

      {/* Student Module Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="assignments" element={<StudentAssignmentsPage />} />
        <Route path="history" element={<StudentHistoryPage />} />
        <Route path="certificates" element={<StudentCertificatesBadgesPage />} />
      </Route>

      {/* Shared Community & Communication Routes */}
      <Route
        path="/announcements"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AnnouncementsPage />} />
      </Route>

      <Route
        path="/forums"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DiscussionForumPage />} />
      </Route>

      {/* Student Result & Review */}
      <Route
        path="/student/result/:id"
        element={
          <ProtectedRoute allowedRoles={['student', 'teacher']}>
            <HeaderOnlyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ResultSummaryPage />} />
      </Route>

      {/* Student Distraction-free Exam Room */}
      <Route
        path="/student/exam/:testId"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ExamPage />
          </ProtectedRoute>
        }
      />

      {/* Root Redirection */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
