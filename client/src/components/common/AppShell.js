import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  admin: [
    { section: 'Overview', items: [{ to: '/admin/dashboard', label: 'Dashboard' }] },
    { section: 'Setup', items: [
      { to: '/admin/competencies', label: 'Competency base' },
      { to: '/admin/activities',   label: 'Activity library' },
      { to: '/admin/chapters',     label: 'Chapter mapping' },
    ]},
    { section: 'Users', items: [
      { to: '/admin/users?role=teacher', label: 'Teachers' },
      { to: '/admin/users?role=student', label: 'Students' },
      { to: '/admin/users?role=parent',  label: 'Parents' },
    ]},
    { section: 'Exams', items: [{ to: '/admin/exams', label: 'Exam papers' }] },
    { section: 'Reports', items: [{ to: '/admin/analytics', label: 'Analytics' }] },
  ],
  teacher: [
    { section: 'My classes', items: [{ to: '/teacher/dashboard', label: 'Class overview' }] },
    { section: 'Assessments', items: [
      { to: '/teacher/term-summary', label: 'Term summary' },
    ]},
    { section: 'Activities', items: [{ to: '/teacher/activities', label: 'Activity library' }] },
    { section: 'Exams', items: [{ to: '/teacher/exams', label: 'Generate paper' }] },
  ],
  student: [
    { section: 'My HPC', items: [
      { to: '/student/dashboard', label: 'My progress' },
      { to: '/student/about-me',  label: 'About me' },
      { to: '/student/hpc-report',label: 'HPC report' },
    ]},
  ],
  peer: [
    { section: 'Peer assessment', items: [
      { to: '/peer/dashboard', label: 'My assignments' },
    ]},
  ],
  parent: [
    { section: 'My child', items: [
      { to: '/parent/dashboard',  label: 'Overview' },
      { to: '/parent/progress',   label: 'Progress wheel' },
      { to: '/parent/reflection', label: 'My reflection' },
    ]},
  ]
};

const ROLE_BADGE = {
  admin:   'badge badge-admin',
  teacher: 'badge badge-teacher',
  student: 'badge badge-student',
  peer:    'badge badge-peer',
  parent:  'badge badge-parent'
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const nav = NAV[user?.role] || [];

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="topbar-logo">HPC Platform</span>
        <span className={ROLE_BADGE[user?.role]}>{user?.role}</span>
        <span className="topbar-spacer" />
        <span className="topbar-user">{user?.name} · {user?.school?.name}</span>
        <button className="btn btn-sm btn-ghost" onClick={handleLogout} style={{ marginLeft: 12 }}>
          Sign out
        </button>
      </div>
      <div className="page-layout">
        <nav className="sidebar">
          {nav.map(group => (
            <div key={group.section}>
              <div className="sidebar-section">{group.section}</div>
              {group.items.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) =>
                  `sidebar-link${isActive ? ' active' : ''}`}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <main className="page-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
