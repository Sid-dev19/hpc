// pages/student/StudentPartA.js
import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function StudentPartA() {
  const { user } = useAuth();
  const [tab, setTab]     = useState('aboutMe');
  const [form, setForm]   = useState({ strengths:'', interests:'', dreams:'', family:'', iWantToBe:'', step:'', admire:'', loveSubject:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/part-a/student').then(r => {
      if (r.data) setForm({
        strengths: r.data.allAboutMe?.myStrengths || '',
        interests: r.data.allAboutMe?.myInterests || '',
        dreams:    r.data.allAboutMe?.myDreams    || '',
        family:    r.data.allAboutMe?.aboutMyFamily || '',
        iWantToBe: r.data.ambitionCard?.iWantToBe || '',
        step:      r.data.ambitionCard?.stepICanTake || '',
        admire:    r.data.ambitionCard?.personIAdmire || '',
        loveSubject: r.data.ambitionCard?.subjectILove || '',
      });
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/part-a/student', {
        allAboutMe: { myStrengths:form.strengths, myInterests:form.interests, myDreams:form.dreams, aboutMyFamily:form.family },
        ambitionCard: { iWantToBe:form.iWantToBe, stepICanTake:form.step, personIAdmire:form.admire, subjectILove:form.loveSubject },
      });
      toast.success('Saved!');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  return (
    <>
      <div className="page-title">About me</div>
      <div className="page-sub">Part A — General information · All About Me · My Ambition Card</div>
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['aboutMe','All about me'],['ambition','My ambition card']].map(([k,l]) => (
          <div key={k} className={`chip${tab===k?' selected':''}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab === 'aboutMe' && (
        <div className="card">
          <div className="card-title">All about me — Part A(2)</div>
          {[
            { key:'strengths', label:'My strengths', placeholder:'What am I good at? What do people say I do well?' },
            { key:'interests', label:'My interests & hobbies', placeholder:'What do I love doing? What makes me curious?' },
            { key:'dreams',    label:'My dreams', placeholder:'What do I want to achieve? What kind of person do I want to be?' },
            { key:'family',    label:'About my family', placeholder:'Something special about my family or the people I live with…' },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              <textarea className="form-control" rows={3} placeholder={f.placeholder}
                value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]:e.target.value}))} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
        </div>
      )}

      {tab === 'ambition' && (
        <div className="card">
          <div className="card-title">My ambition card — Part A(3)</div>
          <div className="form-grid">
            {[
              { key:'iWantToBe',   label:'I want to be…',                   placeholder:'A scientist, teacher, artist…' },
              { key:'step',        label:'One step I can take right now…',   placeholder:'Study this subject, practise this skill…' },
              { key:'admire',      label:'A person I admire is…',            placeholder:'And what I admire about them is…' },
              { key:'loveSubject', label:'My favourite subject is…',         placeholder:'Because…' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input className="form-control" placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]:e.target.value}))} />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
        </div>
      )}
    </>
  );
}
