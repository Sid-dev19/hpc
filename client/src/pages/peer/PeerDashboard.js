// pages/peer/PeerDashboard.js
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PeerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ASSIGNMENTS = [
    { studentName:'Arjun Verma', actId:'act1', activity:'Sorting Everyday Materials', comp:'C1.1', done:false },
    { studentName:'Arjun Verma', actId:'act2', activity:'Reversible & Irreversible Changes', comp:'C1.2', done:true },
  ];
  return (
    <>
      <div className="page-title">My peer assignments</div>
      <div className="page-sub">You are the peer assessor for: <strong>{user?.peerId?.name || 'Arjun Verma'}</strong></div>
      <div className="card">
        <div className="card-title">Activities to assess</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Activity</th><th>Competency</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {ASSIGNMENTS.map(a => (
                <tr key={a.actId}>
                  <td style={{fontWeight:500,color:'var(--text-primary)'}}>{a.studentName}</td>
                  <td>{a.activity}</td>
                  <td><span className="badge badge-orange">{a.comp}</span></td>
                  <td><span className={`badge badge-${a.done?'success':'warning'}`}>{a.done?'Done':'Pending'}</span></td>
                  <td>
                    {!a.done && <button className="btn btn-primary btn-sm" onClick={() => navigate(`/peer/assess/${a.actId}`)}>Assess now</button>}
                    {a.done && <span style={{fontSize:12,color:'var(--text-tertiary)'}}>Submitted</span>}
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
