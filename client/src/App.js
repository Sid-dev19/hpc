import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout
import AppShell from './components/common/AppShell';
import LoginPage from './pages/LoginPage';

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
import StudentHPCReport    from './pages/student/StudentHPCReport';

// Peer pages
import PeerDashboard from './pages/peer/PeerDashboard';
import PeerAssessment from './pages/peer/PeerAssessment';

// Parent pages
import ParentDashboard    from './pages/parent/ParentDashboard';
import ParentProgressView from './pages/parent/ParentProgressView';
import ParentReflection   from './pages/parent/ParentReflection';

// Role → default route map
const DEFAULT_ROUTES = {
  admin:   '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  peer:    '/peer/dashboard',
  parent:  '/parent/dashboard'
};

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={DEFAULT_ROUTES[user.role]} replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={DEFAULT_ROUTES[user.role]} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* ── Admin ── */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AppShell /></ProtectedRoute>
          }>
            <Route path="dashboard"    element={<AdminDashboard />} />
            <Route path="users"        element={<AdminUsers />} />
            <Route path="competencies" element={<AdminCompetencies />} />
            <Route path="activities"   element={<AdminActivities />} />
            <Route path="chapters"     element={<AdminChapterMap />} />
            <Route path="exams"        element={<AdminExams />} />
            <Route path="analytics"    element={<AdminAnalytics />} />
          </Route>

          {/* ── Teacher ── */}
          <Route path="/teacher" element={
            <ProtectedRoute roles={['teacher']}><AppShell /></ProtectedRoute>
          }>
            <Route path="dashboard"    element={<TeacherDashboard />} />
            <Route path="rubric/:studentId/:activityId" element={<TeacherRubricFill />} />
            <Route path="feedback/:studentId/:activityId" element={<TeacherFeedback />} />
            <Route path="term-summary" element={<TeacherTermSummary />} />
            <Route path="activities"   element={<TeacherActivities />} />
            <Route path="exams"        element={<TeacherExamGen />} />
          </Route>

          {/* ── Student ── */}
          <Route path="/student" element={
            <ProtectedRoute roles={['student']}><AppShell /></ProtectedRoute>
          }>
            <Route path="dashboard"         element={<StudentDashboard />} />
            <Route path="about-me"          element={<StudentPartA />} />
            <Route path="reflection/:activityId" element={<StudentSelfReflect />} />
            <Route path="wheel/:activityId" element={<StudentProgressWheel />} />
            <Route path="hpc-report"        element={<StudentHPCReport />} />
          </Route>

          {/* ── Peer ── */}
          <Route path="/peer" element={
            <ProtectedRoute roles={['student','peer']}><AppShell /></ProtectedRoute>
          }>
            <Route path="dashboard"             element={<PeerDashboard />} />
            <Route path="assess/:activityId"    element={<PeerAssessment />} />
          </Route>

          {/* ── Parent ── */}
          <Route path="/parent" element={
            <ProtectedRoute roles={['parent']}><AppShell /></ProtectedRoute>
          }>
            <Route path="dashboard"  element={<ParentDashboard />} />
            <Route path="progress"   element={<ParentProgressView />} />
            <Route path="reflection" element={<ParentReflection />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
