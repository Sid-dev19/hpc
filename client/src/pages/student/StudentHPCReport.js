// pages/student/StudentHPCReport.js
import { useAuth } from '../../context/AuthContext';
export default function StudentHPCReport() {
  const { user } = useAuth();
  return (
    <>
      <div className="page-title">My HPC report</div>
      <div className="page-sub">Holistic Progress Card · {user?.name} · Grade {user?.grade}{user?.section} · 2024–25</div>
      <div className="alert alert-info"><span>ℹ</span><div>Your full HPC report is generated after Term 2 assessment is complete. Below is your Term 1 summary.</div></div>
      <div className="card">
        <div className="card-title">Part C — Term 1 summary</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Subject</th><th>Ability</th><th>Term 1 level</th></tr></thead>
            <tbody>
              {[['Science','Awareness','Proficient'],['Science','Sensitivity','Beginner'],['Science','Creativity','Proficient']].map(([s,a,l]) => (
                <tr key={a}><td>{s}</td><td style={{color:a==='Awareness'?'var(--awareness-color)':a==='Sensitivity'?'var(--sensitivity-color)':'var(--creativity-color)',fontWeight:500}}>{a}</td>
                  <td><span className={`badge badge-${l.toLowerCase()}`}>{l}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
