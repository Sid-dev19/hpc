// pages/teacher/TeacherActivities.js
export default function TeacherActivities() {
  return (
    <>
      <div className="page-title">Activity library</div>
      <div className="page-sub">Browse preloaded activities and add your own</div>
      <div className="card">
        <div className="card-title">Science · Grade 6 activities
          <button className="btn btn-primary btn-sm">+ Add activity</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Competency</th><th>Activity</th><th>Approach</th><th>Duration</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {[
                ['C1.1','Sorting Everyday Materials','Technology-integrated','45 min','Preloaded'],
                ['C1.2','Reversible & Irreversible Changes','Toy-based','40 min','Preloaded'],
                ['C1.3','Measurement Station Activity','Technology-integrated','50 min','Preloaded'],
                ['C2.2','Build a Simple Circuit','Technology-integrated','60 min','Preloaded'],
                ['C2.3','Magnet Properties Exploration','Toy-based','40 min','Preloaded'],
                ['C6.2','Design a Fair Test','Technology-integrated','55 min','Preloaded'],
              ].map(([c,t,a,d,type]) => (
                <tr key={c}>
                  <td><span className="badge badge-orange">{c}</span></td>
                  <td style={{fontWeight:500,color:'var(--text-primary)'}}>{t}</td>
                  <td><span className="badge badge-gray">{a}</span></td>
                  <td>{d}</td>
                  <td><span className={`badge badge-${type==='Preloaded'?'success':'warning'}`}>{type}</span></td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-sm">View</button>
                      <button className="btn btn-sm">Assign to class</button>
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
