import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout
import AppShell from './components/common/AppShell';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminUsers        from './pages/admin/AdminUsers';
import AdminCompetencies from './pages/admin/AdminCompetencies';
import AdminActivities   from './pages/admin/AdminActivities';
import AdminChapterMap   from './pages/admin/AdminChapterMap';
import AdminExams        from './pages/admin/AdminExams';
import AdminAnalytics    from './pages/admin/AdminAnalytics';

// Teacher pages
import TeacherDashboard  from './pages/teacher/TeacherDashboard';
import TeacherRubricFill from './pages/teacher/TeacherRubricFill';
import TeacherFeedback   from './pages/teacher/TeacherFeedback';
import TeacherTermSummary from './pages/teacher/TeacherTermSummary';
import TeacherActivities from './pages/teacher/TeacherActivities';
import TeacherExamGen    from './pages/teacher/TeacherExamGen';

// Student pages
import StudentDashboard    from './pages/student/StudentDashboard';
import StudentPartA        from './pages/student/StudentPartA';
import StudentSelfReflect  from './pages/student/StudentSelfReflect';
import StudentProgressWheel from './pages/student/StudentProgressWheel';
import StudentHPCReport  from './pages/student/StudentHPCReport';

// Parent pages
import ParentDashboard   from './pages/parent/ParentDashboard';
import ParentProgressView from './pages/parent/ParentProgressView';
import ParentReflection   from './pages/parent/ParentReflection';

// Peer pages
import PeerDashboard     from './pages/peer/PeerDashboard';
import PeerAssessment   from './pages/peer/PeerAssessment';

// Role-based route configuration
const DEFAULT_ROUTES = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  peer: '/peer/dashboard',
  parent: '/parent/dashboard'
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has allowed role
  const userRole = user.user_metadata?.role || user.role;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Role-based redirect component
const RoleRedirect = ({ role }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.user_metadata?.role || user.role;
  const targetRoute = DEFAULT_ROUTES[userRole] || '/student/dashboard';
  
  return <Navigate to={targetRoute} replace />;
};

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 border-t-blue-600"></div>
    <div className="ml-3 text-gray-600">Loading...</div>
  </div>
);

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  <AdminDashboard />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  <AdminUsers />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/competencies" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  <AdminCompetencies />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/activities" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  <AdminActivities />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/chapter-map" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  <AdminChapterMap />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/exams" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  <AdminExams />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppShell>
                  <AdminAnalytics />
                </AppShell>
              </ProtectedRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AppShell>
                  <TeacherDashboard />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/teacher/rubric-fill" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AppShell>
                  <TeacherRubricFill />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/teacher/feedback" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AppShell>
                  <TeacherFeedback />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/teacher/term-summary" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AppShell>
                  <TeacherTermSummary />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/teacher/activities" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AppShell>
                  <TeacherActivities />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/teacher/exam-gen" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AppShell>
                  <TeacherExamGen />
                </AppShell>
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <StudentDashboard />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/student/part-a" element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <StudentPartA />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/student/self-reflect" element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <StudentSelfReflect />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/student/progress-wheel" element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <StudentProgressWheel />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/student/hpc-report" element={
              <ProtectedRoute allowedRoles={['student']}>
                <AppShell>
                  <StudentHPCReport />
                </AppShell>
              </ProtectedRoute>
            } />

            {/* Parent Routes */}
            <Route path="/parent/dashboard" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <AppShell>
                  <ParentDashboard />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/parent/progress-view" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <AppShell>
                  <ParentProgressView />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/parent/reflection" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <AppShell>
                  <ParentReflection />
                </AppShell>
              </ProtectedRoute>
            } />

            {/* Peer Routes */}
            <Route path="/peer/dashboard" element={
              <ProtectedRoute allowedRoles={['peer']}>
                <AppShell>
                  <PeerDashboard />
                </AppShell>
              </ProtectedRoute>
            } />
            
            <Route path="/peer/assessment" element={
              <ProtectedRoute allowedRoles={['peer']}>
                <AppShell>
                  <PeerAssessment />
                </AppShell>
              </ProtectedRoute>
            } />

            {/* Default redirect based on role */}
            <Route path="/" element={<RoleRedirect />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
