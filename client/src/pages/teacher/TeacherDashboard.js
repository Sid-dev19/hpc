import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LEVEL_BADGE = {
  Beginner:  'badge-beginner',
  Proficient:'badge-proficient',
  Advanced:  'badge-advanced',
};

export default function TeacherDashboard() {
  const [students, setStudents]   = useState([]);
  const [grade, setGrade]         = useState('6');
  const [section, setSection]     = useState('A');
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/dashboard/teacher?grade=${grade}&section=${section}`)
      .then(r => setStudents(r.data))
      .catch(() => setStudents(DEMO_STUDENTS))
      .finally(() => setLoading(false));
  }, [grade, section]);

  const DEMO_STUDENTS = [
    { _id:'s1', name:'Arjun Verma',   grade:6, section:'A', submissionCount:2,
      latestLevels:{ awarenessLevel:'Proficient', sensitivityLevel:'Beginner', creativityLevel:'Proficient' }},
    { _id:'s2', name:'Zara Sheikh',   grade:6, section:'A', submissionCount:3,
      latestLevels:{ awarenessLevel:'Proficient', sensitivityLevel:'Proficient', creativityLevel:'Advanced' }},
    { _id:'s3', name:'Lakshmi Pillai',grade:6, section:'A', submissionCount:3,
      latestLevels:{ awarenessLevel:'Advanced',  sensitivityLevel:'Proficient', creativityLevel:'Advanced' }},
    { _id:'s4', name:'Rohan Gupta',   grade:6, section:'A', submissionCount:1,
      latestLevels:{ awarenessLevel:'Beginner',  sensitivityLevel:'Beginner',  creativityLevel:'Beginner' }},
    { _id:'s5', name:'Preethi Nair',  grade:6, section:'A', submissionCount:2,
      latestLevels:{ awarenessLevel:'Proficient',sensitivityLevel:'Beginner',  creativityLevel:'Proficient' }},
  ];

  const displayStudents = students.length ? students : DEMO_STUDENTS;

  const disparityFlag = (t, s) => {
    const lvl = { Beginner:1, Proficient:2, Advanced:3 };
    const scores = [
      Math.abs((lvl[t?.awarenessLevel]||0) - (lvl[s?.awarenessLevel]||0)),
      Math.abs((lvl[t?.sensitivityLevel]||0) - (lvl[s?.sensitivityLevel]||0)),
      Math.abs((lvl[t?.creativityLevel]||0) - (lvl[s?.creativityLevel]||0)),
    ];
    const max = Math.max(...scores);
    if (max >= 2) return <span className="badge badge-danger">High</span>;
    if (max === 1) return <span className="badge badge-warning">Moderate</span>;
    return <span className="badge badge-success">Low</span>;
  };

  return (
    <>
      <div className="page-title">Class dashboard</div>
      <div className="page-sub">Science · Term 1 · Select class to view student progress</div>

      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        {['6','7','8'].map(g => (
          <div key={g} className={`chip${grade===g?' selected':''}`} onClick={() => setGrade(g)}>Grade {g}</div>
        ))}
        <div style={{ width:1, height:24, background:'var(--border-light)', margin:'0 4px' }} />
        {['A','B'].map(s => (
          <div key={s} className={`chip${section===s?' selected':''}`} onClick={() => setSection(s)}>Section {s}</div>
        ))}
      </div>

      <div className="metrics-row" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
        <div className="metric"><div className="metric-label">Students</div><div className="metric-val">{displayStudents.length}</div></div>
        <div className="metric"><div className="metric-label">Activities assessed</div><div className="metric-val">{displayStudents.reduce((a,s) => a + s.submissionCount,0)}</div></div>
        <div className="metric"><div className="metric-label">Pending teacher input</div><div className="metric-val" style={{color:'var(--hpc-orange)'}}>1</div></div>
      </div>

      <div className="card">
        <div className="card-title">
          Grade {grade}{section} — C1.1 Sorting Materials (latest activity)
          <span className="badge badge-warning">Pending review: 1</span>
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Teacher (A/S/C)</th>
                  <th>Self (A/S/C)</th>
                  <th>Peer (A/S/C)</th>
                  <th>Disparity</th>
                  <th>Assessed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.map(st => {
                  const t = st.latestLevels;
                  const levels = t ? `${t.awarenessLevel?.[0]||'–'} / ${t.sensitivityLevel?.[0]||'–'} / ${t.creativityLevel?.[0]||'–'}` : '–';
                  const hasSub = st.submissionCount > 0;
                  return (
                    <tr key={st._id}>
                      <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{st.name}</td>
                      <td>
                        {hasSub ? (
                          <span className={`badge ${LEVEL_BADGE[t?.awarenessLevel]||'badge-gray'}`}>{levels}</span>
                        ) : <span style={{color:'var(--text-tertiary)'}}>–</span>}
                      </td>
                      <td><span className="badge badge-warning">P / P / P</span></td>
                      <td>{st._id!=='s4' ? <span className="badge badge-gray">B / P / B</span> : <span style={{color:'var(--text-tertiary)'}}>–</span>}</td>
                      <td>{hasSub ? disparityFlag(t, { awarenessLevel:'Proficient', sensitivityLevel:'Proficient', creativityLevel:'Proficient' }) : <span style={{color:'var(--text-tertiary)'}}>–</span>}</td>
                      <td>{st.submissionCount} activities</td>
                      <td>
                        <div className="btn-row">
                          {!hasSub
                            ? <button className="btn btn-primary btn-sm" onClick={() => navigate(`/teacher/rubric/${st._id}/act1`)}>Fill rubric</button>
                            : <button className="btn btn-sm" onClick={() => navigate(`/teacher/rubric/${st._id}/act1`)}>Edit rubric</button>
                          }
                          <button className="btn btn-sm" onClick={() => navigate(`/student/wheel/act1`)}>View wheel</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ fontSize:11, color:'var(--text-tertiary)', marginTop:8 }}>A=Awareness · S=Sensitivity · C=Creativity · B=Beginner · P=Proficient · A=Advanced</div>
          </div>
        )}
      </div>
    </>
  );
}
