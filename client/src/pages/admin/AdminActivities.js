// pages/admin/AdminCompetencies.js
export default function AdminCompetencies() {
  return (
    <>
      <div className="page-title">Competency base</div>
      <div className="page-sub">All 27 Science competencies seeded · 9 CGs · Grades 6–8</div>
      <div className="alert alert-success">
        <span>✓</span>
        <div>Science competencies (27), Learning Outcomes (76), Rubric Descriptors (1,080) and Activity Rubrics (67 activities × 9 cells) are seeded from the Science_HPC_Complete_Seed_v2.xlsx file. Use the seed script to load additional subjects.</div>
      </div>
      <div className="card">
        <div className="card-title">Competency coverage</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>CG</th><th>Description</th><th>Competencies</th><th>LOs seeded</th><th>Grade range</th></tr></thead>
            <tbody>
              {[
                ['CG1','Matter and its properties','C1.1–C1.4','12','6–8'],
                ['CG2','Physical world','C2.1–C2.5','14','6–8'],
                ['CG3','Living world','C3.1–C3.4','10','6–8'],
                ['CG4','Health and well-being','C4.1–C4.4','8','6–8'],
                ['CG5','Science–Technology–Society','C5.1–C5.2','6','6–8'],
                ['CG6','Nature of science','C6.1–C6.2','8','6–8'],
                ['CG7','Scientific communication','C7.1–C7.3','9','6–8'],
                ['CG8',"India's contributions",'C8.1','3','6–8'],
                ['CG9','Frontiers of science','C9.1–C9.2','6','7–8'],
              ].map(([cg,desc,codes,los,gr]) => (
                <tr key={cg}>
                  <td style={{ fontWeight:600, color:'var(--hpc-orange)' }}>{cg}</td>
                  <td>{desc}</td><td><span className="badge badge-gray">{codes}</span></td>
                  <td>{los}</td><td>{gr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// pages/admin/AdminActivities.js
export function AdminActivities() {
  return (
    <>
      <div className="page-title">Activity library</div>
      <div className="page-sub">67 preloaded Science activities · 1 per competency per grade</div>
      <div className="alert alert-info">
        <span>ℹ</span>
        <div>All 67 Science activities are preloaded with assessment questions and B/P/A rubric descriptors. Teachers can add their own activities per section. Click any activity to view or edit its rubric descriptors.</div>
      </div>
      <div className="card">
        <div className="card-title">Filter activities
          <button className="btn btn-primary btn-sm">+ Add activity</button>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
          {['Grade 6','Grade 7','Grade 8'].map(g => <div key={g} className="chip">{g}</div>)}
          {['Preloaded','Teacher-added'].map(t => <div key={t} className="chip">{t}</div>)}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Competency</th><th>Grade</th><th>Activity title</th><th>Approach</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {[
                ['C1.1','6','Sorting Everyday Materials','Technology-integrated','Preloaded'],
                ['C1.2','6','Reversible & Irreversible Changes','Toy-based','Preloaded'],
                ['C2.3','6','Magnet Properties Exploration','Toy-based','Preloaded'],
                ['C1.1','7','Acid–Base Investigation','Art-integrated','Preloaded'],
                ['C2.1','7','Distance-Time Graph Activity','Technology-integrated','Preloaded'],
                ['C3.3','8','Human Impact on Ecosystem Evaluation','Technology-integrated','Preloaded'],
              ].map(([c,g,t,a,type]) => (
                <tr key={c+g}>
                  <td><span className="badge badge-orange">{c}</span></td>
                  <td>{g}</td>
                  <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{t}</td>
                  <td><span className="badge badge-gray">{a}</span></td>
                  <td><span className={`badge badge-${type==='Preloaded'?'success':'warning'}`}>{type}</span></td>
                  <td><button className="btn btn-sm">View rubric</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// pages/admin/AdminExams.js
export function AdminExams() {
  return (
    <>
      <div className="page-title">Exam papers</div>
      <div className="page-sub">All AI-generated exam papers across grades</div>
      <div className="card">
        <div className="card-title">All papers
          <button className="btn btn-primary btn-sm">+ New paper</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Subject</th><th>Grade</th><th>Type</th><th>Term</th><th>Marks</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {[
                ['Science','6','Half-yearly','T1','50','Published'],
                ['Science','7','Half-yearly','T1','50','Under review'],
                ['Science','8','Annual','T2','100','Draft'],
              ].map(([s,g,t,tm,m,st]) => (
                <tr key={s+g+t}>
                  <td>{s}</td><td>{g}</td><td>{t}</td><td>{tm}</td><td>{m}</td>
                  <td><span className={`badge badge-${st==='Published'?'success':st==='Under review'?'warning':'gray'}`}>{st}</span></td>
                  <td><button className="btn btn-sm">Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// pages/admin/AdminAnalytics.js
export function AdminAnalytics() {
  return (
    <>
      <div className="page-title">Analytics</div>
      <div className="page-sub">School-wide performance overview · Term 1 · 2024–25</div>
      <div className="metrics-row">
        {[['Avg Awareness','Proficient'],['Avg Sensitivity','Beginner'],['Avg Creativity','Proficient'],['HPC Completion','61%']].map(([l,v]) => (
          <div className="metric" key={l}><div className="metric-label">{l}</div><div className="metric-val" style={{ fontSize:18 }}>{v}</div></div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">Subject completion — Science</div>
        {[['Grade 6A','74%',74],['Grade 6B','68%',68],['Grade 7A','58%',58],['Grade 7B','52%',52],['Grade 8A','41%',41],['Grade 8B','37%',37]].map(([s,pct,w]) => (
          <div key={s} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-secondary)', marginBottom:3 }}>
              <span>{s}</span><span>{pct}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width:`${w}%` }} /></div>
          </div>
        ))}
      </div>
    </>
  );
}
