// pages/admin/AdminCompetencies.js
export default function AdminCompetencies() {
  return (
    <>
      <div className="page-title">Competency base</div>
      <div className="page-sub">All 27 Science competencies seeded · 9 CGs · Grades 6–8</div>
      <div className="alert alert-success">
        <span>✓</span>
        <div>Science competencies (27), Learning Outcomes (76), Rubric Descriptors and Activity Rubrics (67 activities) are seeded. Use the seed script to load additional subjects.</div>
      </div>
      <div className="card">
        <div className="card-title">Science — competency coverage</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>CG</th><th>Description</th><th>Competencies</th><th>LOs seeded</th><th>Grades</th></tr></thead>
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
              ].map(([cg,d,c,l,g]) => (
                <tr key={cg}>
                  <td style={{ fontWeight:600, color:'var(--hpc-orange)' }}>{cg}</td>
                  <td>{d}</td>
                  <td><span className="badge badge-gray">{c}</span></td>
                  <td>{l}</td><td>{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
