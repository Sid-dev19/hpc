// pages/teacher/TeacherTermSummary.js
import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SUBJECTS = ['Science','Mathematics','Language R1','Language R2','Social Science','Art Education','Physical Education'];
const ABILITIES = ['Awareness','Sensitivity','Creativity'];
const LEVELS    = ['B','P','A'];

export default function TeacherTermSummary() {
  const [studentName] = useState('Arjun Verma');
  const [term, setTerm]   = useState('T1');
  const [summary, setSummary] = useState({});
  const [saving, setSaving] = useState(false);

  const setLevel = (subject, ability, level) => {
    setSummary(prev => ({
      ...prev,
      [subject]: { ...(prev[subject]||{}), [ability]: level }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(summary).map(([subject, levels]) =>
          api.post('/term-summary', {
            studentId: 's1', subjectId: subject, term,
            awarenessLevel: levels.Awareness,
            sensitivityLevel: levels.Sensitivity,
            creativityLevel: levels.Creativity,
          })
        )
      );
      toast.success('Term summary saved (Part C)');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  return (
    <>
      <div className="page-title">Term summary — Part C</div>
      <div className="page-sub">
        {studentName} · Holistic Summary for the Academic Year
        <span className="badge badge-gray" style={{marginLeft:8}}>Teacher fills only — not influenced by student/peer</span>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['T1','T2'].map(t => <div key={t} className={`chip${term===t?' selected':''}`} onClick={() => setTerm(t)}>Term {t.slice(1)}</div>)}
      </div>
      <div className="card">
        <div className="card-title">Performance level descriptors — tick one per ability per subject</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Ability</th>
                <th style={{background:'var(--beginner-bg)',color:'var(--beginner-fg)'}}>Beginner (B)</th>
                <th style={{background:'var(--proficient-bg)',color:'var(--proficient-fg)'}}>Proficient (P)</th>
                <th style={{background:'var(--advanced-bg)',color:'var(--advanced-fg)'}}>Advanced (A)</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map(sub => (
                ABILITIES.map((ab, i) => (
                  <tr key={sub+ab}>
                    {i === 0 && <td rowSpan={3} style={{ fontWeight:600, color:'var(--text-primary)', verticalAlign:'middle' }}>{sub}</td>}
                    <td style={{ color: i===0?'var(--awareness-color)':i===1?'var(--sensitivity-color)':'var(--creativity-color)', fontWeight:500, fontSize:12 }}>{ab}</td>
                    {LEVELS.map(lv => (
                      <td key={lv} style={{ textAlign:'center' }}>
                        <input type="radio"
                          name={`${sub}-${ab}`}
                          checked={summary[sub]?.[ab]===lv}
                          onChange={() => setLevel(sub, ab, lv)}
                          style={{ accentColor:'var(--hpc-orange)', width:16, height:16, cursor:'pointer' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
        <div className="alert alert-warning" style={{ marginTop:12 }}>
          <span>⚠</span><div>Performance levels are based on teacher's assessment only. Do not take student or peer feedback from the Progress Wheel into account for Part C.</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save term summary'}</button>
      </div>
    </>
  );
}
