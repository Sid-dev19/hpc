// pages/admin/AdminExams.js
export default function AdminExams() {
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
                ['Science','6','Half-yearly','T1','50','published'],
                ['Science','7','Half-yearly','T1','50','under_review'],
                ['Science','8','Annual','T2','100','draft'],
              ].map(([s,g,t,tm,m,st]) => (
                <tr key={s+g+t}>
                  <td>{s}</td><td>{g}</td><td>{t}</td><td><span className="badge badge-gray">{tm}</span></td><td>{m}</td>
                  <td><span className={`badge badge-${st==='published'?'success':st==='under_review'?'warning':'gray'}`}>{st.replace('_',' ')}</span></td>
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
