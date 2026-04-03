import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = [
  { value:'Yes',        emoji:'😊', label:'Yes' },
  { value:'To an extent',emoji:'🙂', label:'To an extent' },
  { value:'No',         emoji:'😟', label:'No' },
  { value:'Not sure',   emoji:'❓', label:'Not sure' },
];

const STATEMENTS = {
  Awareness: [
    'I was able to learn something new.',
    'I was attentive to every detail of the activity.',
    'I was able to understand the activity.',
    'I was able to follow the instructions.',
    'I was able to focus and engage with the activity.',
    'I found purpose and meaning in the activity.',
  ],
  Sensitivity: [
    'I was able to understand and express my emotions.',
    'I was able to motivate myself & my peer when things were difficult.',
    'I was able to understand the emotions of my peer.',
    'I was able to seek and use support from my peers and teacher.',
    'I was able to help others in some way.',
    'I was able to contribute individually or as a group member.',
  ],
  Creativity: [
    'I was curious to explore and learn new things during the activity.',
    "I was able to think of 'out of the box' solutions.",
    'I was able to think of new ways to do the activity.',
    'I was able to express my creativity while doing the activity.',
    'I was able to generate innovative ideas.',
    'I was able to take calculated risks.',
  ],
};

const AB_COLORS = { Awareness:'var(--awareness-color)', Sensitivity:'var(--sensitivity-color)', Creativity:'var(--creativity-color)' };
const scoreToLevel = (count) => count <= 2 ? 'Beginner' : count <= 4 ? 'Proficient' : 'Advanced';

export default function StudentSelfReflect() {
  const { activityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emoji, setEmoji]       = useState({ proud:'', apply:'', motivated:'' });
  const [circled, setCircled]   = useState({ Awareness:[], Sensitivity:[], Creativity:[] });
  const [learnings, setLearnings] = useState('');
  const [interesting, setInteresting] = useState('');
  const [practice, setPractice]   = useState('');
  const [saving, setSaving]       = useState(false);

  const toggleStatement = (ability, idx) => {
    setCircled(prev => {
      const current = prev[ability];
      const updated = current.includes(idx) ? current.filter(i => i !== idx) : [...current, idx];
      return { ...prev, [ability]: updated };
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/rubrics/self-reflection', {
        activityId,
        term: 'T1',
        emojiResponses: emoji,
        awarenessStatements:   circled.Awareness,
        sensitivityStatements: circled.Sensitivity,
        creativityStatements:  circled.Creativity,
        myLearnings:   learnings,
        interestingThing: interesting,
        needsPractice: practice,
      });
      toast.success('Self-reflection submitted!');
      navigate('/student/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    setSaving(false);
  };

  return (
    <>
      <div className="page-title">Student self-reflection</div>
      <div className="page-sub">C1.1 — Sorting Everyday Materials · Science · Term 1</div>

      {/* Emoji responses */}
      <div className="card">
        <div className="card-title">Based on your experience of the activity…</div>
        {[
          { key:'proud',     text:'I am proud of myself and my effort.' },
          { key:'apply',     text:'I will be able to apply what I learnt from this activity to real life situations.' },
          { key:'motivated', text:'I am motivated to learn further about the concepts covered in the activity.' },
        ].map(q => (
          <div key={q.key} style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:8 }}>{q.text}</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {EMOJI_OPTIONS.map(opt => (
                <div key={opt.value}
                  onClick={() => setEmoji(p => ({ ...p, [q.key]: opt.value }))}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                    padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:11,
                    border:`1.5px solid ${emoji[q.key]===opt.value?'var(--hpc-orange)':'var(--border-light)'}`,
                    background: emoji[q.key]===opt.value?'var(--hpc-orange-light)':'',
                    color: emoji[q.key]===opt.value?'#7A2E0A':'var(--text-secondary)',
                    transition:'all .15s',
                  }}>
                  <span style={{ fontSize:22 }}>{opt.emoji}</span>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Progress grid */}
      <div className="card">
        <div className="card-title">My progress grid</div>
        <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:12 }}>
          Below are a few statements. Read each one carefully and <strong>circle the ones which are true</strong> based on your performance on the activity.
        </div>
        <div className="grid-3">
          {Object.entries(STATEMENTS).map(([ability, stmts]) => (
            <div key={ability}>
              <div style={{ fontSize:12, fontWeight:700, color: AB_COLORS[ability], marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>
                {ability[0]} — {ability}
              </div>
              {stmts.map((stmt, idx) => {
                const isCircled = circled[ability].includes(idx);
                return (
                  <div key={idx} onClick={() => toggleStatement(ability, idx)}
                    style={{
                      fontSize:12, padding:'8px 10px', borderRadius:8, marginBottom:6,
                      cursor:'pointer', userSelect:'none',
                      border: `1.5px solid ${isCircled ? AB_COLORS[ability] : 'var(--border-light)'}`,
                      background: isCircled ? (ability==='Awareness'?'#FBEAF0':ability==='Sensitivity'?'#FAEEDA':'#EEEDFE') : '',
                      color: isCircled ? (ability==='Awareness'?'var(--awareness-color)':ability==='Sensitivity'?'var(--sensitivity-color)':'var(--creativity-color)') : 'var(--text-secondary)',
                      transition:'all .15s',
                    }}>
                    {stmt}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Score summary */}
        <div className="grid-3" style={{ marginTop:14, paddingTop:12, borderTop:'0.5px solid var(--border-light)' }}>
          {Object.keys(STATEMENTS).map(ab => {
            const count = circled[ab].length;
            const level = scoreToLevel(count);
            return (
              <div key={ab} style={{ fontSize:12, color:'var(--text-secondary)' }}>
                Circled for {ab[0]}: <strong style={{color:'var(--text-primary)'}}>{count}</strong> → <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize:10, color:'var(--text-tertiary)', marginTop:6 }}>Scoring (for teacher reference): 0–2 circles = Beginner · 3–4 = Proficient · 5–6 = Advanced</div>
      </div>

      {/* My learnings */}
      <div className="card">
        <div className="card-title">My learnings</div>
        <div className="form-group">
          <label className="form-label">By doing this activity, I learnt…</label>
          <textarea className="form-control" rows={3} value={learnings} onChange={e => setLearnings(e.target.value)} placeholder="Write your reflections and insights from the activity…" />
        </div>
        <div className="form-group">
          <label className="form-label">The most interesting thing about this activity was…</label>
          <input className="form-control" value={interesting} onChange={e => setInteresting(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">I need practice on…</label>
          <input className="form-control" value={practice} onChange={e => setPractice(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting…' : 'Submit self-reflection'}</button>
      </div>
    </>
  );
}
