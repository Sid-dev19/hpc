// pages/admin/AdminAnalytics.js
export default function AdminAnalytics() {
  return (
    <>
      <div className="page-title">Analytics</div>
      <div className="page-sub">School-wide performance overview · Term 1 · 2024–25</div>
      <div className="metrics-row">
        {[['Avg Awareness','Proficient'],['Avg Sensitivity','Beginner'],['Avg Creativity','Proficient'],['HPC Completion','61%']].map(([l,v]) => (
          <div className="metric" key={l}>
            <div className="metric-label">{l}</div>
            <div className="metric-val" style={{ fontSize:18 }}>{v}</div>
          </div>
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
