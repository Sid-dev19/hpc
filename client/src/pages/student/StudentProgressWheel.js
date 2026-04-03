// pages/student/StudentProgressWheel.js
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProgressWheel from '../../components/shared/ProgressWheel';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentProgressWheel() {
  const { activityId } = useParams();
  const { user }       = useAuth();
  const [wheelData, setWheelData] = useState(null);
  const [tooltip, setTooltip]     = useState(null);

  useEffect(() => {
    if (user?._id && activityId) {
      api.get(`/rubrics/wheel/${user._id}/${activityId}`)
        .then(r => setWheelData(r.data))
        .catch(() => setWheelData({
          teacher: { awarenessLevel:'Proficient', sensitivityLevel:'Beginner', creativityLevel:'Proficient' },
          student: { awarenessLevel:'Proficient', sensitivityLevel:'Proficient', creativityLevel:'Proficient' },
          peer:    { awarenessLevel:'Beginner',   sensitivityLevel:'Proficient', creativityLevel:'Beginner' },
          disparity: [{ ability:'sensitivity', teacherLevel:'Beginner', studentLevel:'Proficient' }],
        }));
    }
  }, [user, activityId]);

  const LEGEND = [
    { label:'Inner ring (T)', desc:'Teacher assessment' },
    { label:'Middle ring (S)', desc:'Your self-assessment' },
    { label:'Outer ring (P)', desc:'Peer assessment' },
    { label:'Fill depth', desc:'Beginner=33% · Proficient=66% · Advanced=100%' },
  ];

  return (
    <>
      <div className="page-title">My progress wheel</div>
      <div className="page-sub">C1.1 — Sorting Everyday Materials · 3 rings: Teacher · Self · Peer</div>
      <div className="grid-2" style={{ alignItems:'start' }}>
        <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          {wheelData ? (
            <ProgressWheel
              teacherData={wheelData.teacher}
              studentData={wheelData.student}
              peerData={wheelData.peer}
              size={300}
              onSegmentClick={seg => setTooltip(seg)}
            />
          ) : <div className="spinner" style={{ margin:40 }} />}
          {tooltip && (
            <div style={{ marginTop:12, padding:'8px 14px', background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', fontSize:12, color:'var(--text-secondary)' }}>
              <strong>{tooltip.ability}</strong> · {tooltip.ring === 'teacher' ? 'Teacher' : tooltip.ring === 'student' ? 'Self' : 'Peer'}: <span className={`badge badge-${tooltip.level?.toLowerCase()}`}>{tooltip.level}</span>
            </div>
          )}
        </div>
        <div>
          <div className="card">
            <div className="card-title">Summary</div>
            {[
              { label:'Awareness',   teacher:wheelData?.teacher?.awarenessLevel,   self:wheelData?.student?.awarenessLevel,   peer:wheelData?.peer?.awarenessLevel },
              { label:'Sensitivity', teacher:wheelData?.teacher?.sensitivityLevel, self:wheelData?.student?.sensitivityLevel, peer:wheelData?.peer?.sensitivityLevel },
              { label:'Creativity',  teacher:wheelData?.teacher?.creativityLevel,  self:wheelData?.student?.creativityLevel,  peer:wheelData?.peer?.creativityLevel },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, fontSize:12 }}>
                <span style={{ fontWeight:600, minWidth:100 }}>{row.label}</span>
                <span style={{ color:'var(--text-secondary)' }}>T: <span className={`badge badge-${(row.teacher||'').toLowerCase()}`}>{row.teacher||'–'}</span></span>
                <span style={{ color:'var(--text-secondary)' }}>S: <span className={`badge badge-${(row.self||'').toLowerCase()}`}>{row.self||'–'}</span></span>
                <span style={{ color:'var(--text-secondary)' }}>P: <span className={`badge badge-${(row.peer||'').toLowerCase()}`}>{row.peer||'–'}</span></span>
              </div>
            ))}
          </div>
          {wheelData?.disparity?.length > 0 && (
            <div className="alert alert-warning">
              <span>⚠</span>
              <div>
                <strong>Disparity noted:</strong> {wheelData.disparity[0].ability} — your teacher marked {wheelData.disparity[0].teacherLevel} but you marked {wheelData.disparity[0].studentLevel}. Talk to your teacher about this difference.
              </div>
            </div>
          )}
          <div className="card">
            <div className="card-title">Legend</div>
            {LEGEND.map(l => (
              <div key={l.label} style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:5 }}>
                <strong>{l.label}</strong>: {l.desc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
