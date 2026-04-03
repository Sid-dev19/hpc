// pages/parent/ParentDashboard.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/parent').then(r => setData(r.data)).catch(() => {});
  }, []);

  const child = data?.child || { name:'Arjun Verma', grade:6, section:'A' };

  return (
    <>
      <div className="page-title">My child's overview</div>
      <div className="page-sub">
        <strong>{child.name}</strong> · Grade {child.grade}{child.section} · {user?.school?.name}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Quick actions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button className="btn" onClick={() => navigate('/parent/progress')} style={{ textAlign:'left' }}>View progress wheel →</button>
            <button className="btn" onClick={() => navigate('/parent/reflection')} style={{ textAlign:'left' }}>Fill partnership card (Term 1) →</button>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Term 1 summary — Science</div>
          {[['Awareness','Proficient'],['Sensitivity','Beginner'],['Creativity','Proficient']].map(([a,l]) => (
            <div key={a} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, fontSize:13 }}>
              <span style={{ color:'var(--text-secondary)' }}>{a}</span>
              <span className={`badge badge-${l.toLowerCase()}`}>{l}</span>
            </div>
          ))}
          <div style={{ fontSize:11, color:'var(--text-tertiary)', marginTop:4 }}>Performance levels are as assessed by the teacher only.</div>
        </div>
      </div>
    </>
  );
}
