// pages/admin/AdminDashboard.js
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chapterTerms, setChapterTerms] = useState([]);

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-title">School overview</div>
      <div className="page-sub">Middle Stage · Grades 6–8</div>
      <div className="metrics-row">
        {[
          { label: 'Students', val: stats?.totalStudents ?? '–' },
          { label: 'Teachers', val: stats?.totalTeachers ?? '–' },
          { label: 'Rubric submissions', val: stats?.totalSubmissions ?? '–' },
          { label: 'Pending teacher reviews', val: stats?.pendingSubmissions ?? '–' },
        ].map(m => (
          <div className="metric" key={m.label}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-val">{m.val}</div>
          </div>
        ))}
      </div>
      {stats?.gradeStats && (
        <div className="card">
          <div className="card-title">Completion by grade</div>
          {stats.gradeStats.map(g => (
            <div key={g._id} style={{ marginBottom: 10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-secondary)', marginBottom:3 }}>
                <span>Grade {g._id}</span><span>{g.count} students</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, g.count * 3)}%` }} /></div>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <div className="card-title">Activity library status</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Subject</th><th>Activities seeded</th><th>Status</th></tr></thead>
            <tbody>
              {[['Science','67','Seeded'],['Mathematics','–','Pending'],['Language R1','–','Pending'],['Social Science','–','Pending']].map(([s,c,st]) => (
                <tr key={s}><td>{s}</td><td>{c}</td>
                  <td><span className={`badge badge-${st==='Seeded'?'success':'gray'}`}>{st}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
