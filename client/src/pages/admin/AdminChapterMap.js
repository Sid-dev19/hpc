// pages/admin/AdminChapterMap.js
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminChapterMap() {
  const [subjects, setSubjects] = useState([]);
  const [selSubject, setSelSubject] = useState('');
  const [selGrade, setSelGrade] = useState('6');
  const [mappings, setMappings] = useState([]);
  const [schoolId, setSchoolId] = useState('');

  useEffect(() => {
    api.get('/competencies/subjects').then(r => setSubjects(r.data));
    api.get('/auth/me').then(r => setSchoolId(r.data.school?._id));
  }, []);

  useEffect(() => {
    if (schoolId && selSubject)
      api.get(`/schools/${schoolId}/chapter-terms?grade=${selGrade}&subjectId=${selSubject}`)
        .then(r => setMappings(r.data)).catch(() => {});
  }, [schoolId, selSubject, selGrade]);

  const setTerm = async (mapping, term) => {
    try {
      await api.post(`/schools/${schoolId}/chapter-terms`, {
        ...mapping, subjectId: selSubject, grade: Number(selGrade), term
      });
      toast.success('Term updated');
      setMappings(prev => prev.map(m => m.chapterNo === mapping.chapterNo ? { ...m, term } : m));
    } catch { toast.error('Failed to update term'); }
  };

  const SCIENCE_GR6 = [
    { chapterNo:1,  chapterName:'The Wonderful World of Science', primaryCompetencies:'C6.2, C7.1' },
    { chapterNo:2,  chapterName:'Diversity in Living World',       primaryCompetencies:'C3.1, C3.2' },
    { chapterNo:3,  chapterName:'Mindful Eating: A Path to a Healthy Body', primaryCompetencies:'C4.1, C4.2' },
    { chapterNo:4,  chapterName:'Exploring Magnets',               primaryCompetencies:'C2.3, C6.2' },
    { chapterNo:5,  chapterName:'Measurement of Length and Motion', primaryCompetencies:'C1.3, C2.1' },
    { chapterNo:6,  chapterName:'Material Around Us',              primaryCompetencies:'C1.1, C1.2' },
    { chapterNo:7,  chapterName:'Temperature and its Measurement', primaryCompetencies:'C1.3, C1.4' },
    { chapterNo:8,  chapterName:'A Journey through States of Water', primaryCompetencies:'C1.2, C1.4' },
    { chapterNo:9,  chapterName:'Methods of Separation in Everyday Life', primaryCompetencies:'C1.1, C6.2' },
    { chapterNo:10, chapterName:'Living Creatures: Exploring Their Characteristics', primaryCompetencies:'C3.1, C3.2' },
    { chapterNo:11, chapterName:"Nature's Treasures",              primaryCompetencies:'C3.4, C5.1' },
    { chapterNo:12, chapterName:'Beyond Earth',                    primaryCompetencies:'C2.5, C9.1' },
  ];

  const displayMappings = mappings.length > 0 ? mappings : SCIENCE_GR6.map(c => ({ ...c, term: null }));

  return (
    <>
      <div className="page-title">Chapter–term mapping</div>
      <div className="page-sub">Assign each chapter to Term 1 or Term 2 for your school</div>
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Subject</label>
          <select className="form-control" style={{ minWidth:180 }} value={selSubject} onChange={e => setSelSubject(e.target.value)}>
            <option value="">Select subject…</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Grade</label>
          <select className="form-control" value={selGrade} onChange={e => setSelGrade(e.target.value)}>
            <option>6</option><option>7</option><option>8</option>
          </select>
        </div>
      </div>
      <div className="card">
        <div className="card-title">
          Chapters {selGrade && `· Grade ${selGrade}`}
          <span className="badge badge-warning">Admin assigns — teachers can override per section</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Ch.</th><th>Chapter name</th><th>Primary competencies</th><th>Term assignment</th></tr>
            </thead>
            <tbody>
              {displayMappings.map(m => (
                <tr key={m.chapterNo}>
                  <td style={{ color:'var(--text-tertiary)' }}>Ch{m.chapterNo}</td>
                  <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{m.chapterName}</td>
                  <td><span className="badge badge-gray">{m.primaryCompetencies}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      {['T1','T2','ongoing'].map(t => (
                        <div key={t} className={`chip${m.term===t?' selected':''}`}
                          onClick={() => setTerm(m, t)} style={{ fontSize:11 }}>{t}</div>
                      ))}
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
