// pages/parent/ParentProgressView.js
import ProgressWheel from '../../components/shared/ProgressWheel';

export default function ParentProgressView() {
  const demoTeacher = { awarenessLevel:'Proficient', sensitivityLevel:'Beginner', creativityLevel:'Proficient' };
  const demoStudent = { awarenessLevel:'Proficient', sensitivityLevel:'Proficient', creativityLevel:'Proficient' };
  const demoPeer    = { awarenessLevel:'Beginner',   sensitivityLevel:'Proficient', creativityLevel:'Beginner'  };

  return (
    <>
      <div className="page-title">Progress wheel — Arjun Verma</div>
      <div className="page-sub">C1.1 — Sorting Everyday Materials · View only — all 3 rings</div>
      <div className="grid-2" style={{ alignItems:'start' }}>
        <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <ProgressWheel teacherData={demoTeacher} studentData={demoStudent} peerData={demoPeer} size={300} />
        </div>
        <div>
          <div className="card">
            <div className="card-title">Reading the wheel</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.8 }}>
              <div>• <strong>Inner ring (T)</strong> = Teacher's assessment</div>
              <div>• <strong>Middle ring (S)</strong> = Arjun's self-assessment</div>
              <div>• <strong>Outer ring (P)</strong> = Peer's assessment</div>
              <div>• <strong>Fill depth</strong> = Beginner (33%) · Proficient (66%) · Advanced (100%)</div>
              <div>• <strong>3 segments</strong> = Awareness · Sensitivity · Creativity</div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">C1.1 — This activity summary</div>
            {[
              { ab:'Awareness',   t:'Proficient', s:'Proficient', p:'Beginner' },
              { ab:'Sensitivity', t:'Beginner',   s:'Proficient', p:'Proficient' },
              { ab:'Creativity',  t:'Proficient', s:'Proficient', p:'Beginner' },
            ].map(row => (
              <div key={row.ab} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, marginBottom:8 }}>
                <span style={{ fontWeight:600, minWidth:90 }}>{row.ab}</span>
                <span>T: <span className={`badge badge-${row.t.toLowerCase()}`}>{row.t}</span></span>
                <span>S: <span className={`badge badge-${row.s.toLowerCase()}`}>{row.s}</span></span>
                <span>P: <span className={`badge badge-${row.p.toLowerCase()}`}>{row.p}</span></span>
              </div>
            ))}
            <div style={{ fontSize:11, color:'var(--text-tertiary)', marginTop:4 }}>T=Teacher · S=Self · P=Peer</div>
          </div>
          <div className="alert alert-warning">
            <span>⚠</span>
            <div><strong>Note:</strong> If you notice a wide gap between the teacher's and Arjun's assessment, this is an opportunity for discussion at the Parent-Teacher meeting.</div>
          </div>
        </div>
      </div>
    </>
  );
}
