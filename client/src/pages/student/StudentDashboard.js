// pages/student/StudentDashboard.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/student').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const ACTIVITIES = [
    { id:'act1', comp:'C1.1', title:'Sorting Everyday Materials',   term:'T1', selfDone:true,  teacherDone:true  },
    { id:'act2', comp:'C1.2', title:'Reversible & Irreversible Changes', term:'T1', selfDone:true,  teacherDone:true  },
    { id:'act3', comp:'C2.3', title:'Magnet Properties Exploration', term:'T1', selfDone:false, teacherDone:false },
    { id:'act4', comp:'C6.2', title:'Design a Fair Test',            term:'T2', selfDone:false, teacherDone:false },
  ];

  return (
    <>
      <div className="page-title">My progress</div>
      <div className="page-sub">Grade {user?.grade}{user?.section} · Science · {user?.name}</div>
      <div className="metrics-row" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
        <div className="metric"><div className="metric-label">Activities done</div><div className="metric-val">{stats?.selfCount ?? 2}</div></div>
        <div className="metric"><div className="metric-label">Teacher assessed</div><div className="metric-val">{stats?.teacherCount ?? 2}</div></div>
        <div className="metric"><div className="metric-label">Pending self-reflection</div><div className="metric-val" style={{color:'var(--hpc-orange)'}}>2</div></div>
      </div>
      <div className="card">
        <div className="card-title">My activities — Science Term 1</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Competency</th><th>Activity</th><th>Term</th><th>Self-reflection</th><th>Teacher rubric</th><th>Actions</th></tr></thead>
            <tbody>
              {ACTIVITIES.map(a => (
                <tr key={a.id}>
                  <td><span className="badge badge-orange">{a.comp}</span></td>
                  <td style={{fontWeight:500,color:'var(--text-primary)'}}>{a.title}</td>
                  <td><span className="badge badge-gray">{a.term}</span></td>
                  <td><span className={`badge badge-${a.selfDone?'success':'warning'}`}>{a.selfDone?'Done':'Pending'}</span></td>
                  <td><span className={`badge badge-${a.teacherDone?'success':'gray'}`}>{a.teacherDone?'Done':'Not yet'}</span></td>
                  <td>
                    <div className="btn-row">
                      {!a.selfDone && <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/reflection/${a.id}`)}>Self-reflect</button>}
                      {a.teacherDone && <button className="btn btn-sm" onClick={() => navigate(`/student/wheel/${a.id}`)}>View wheel</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
