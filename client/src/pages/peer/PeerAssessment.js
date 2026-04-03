import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ENGAGEMENT_QS = [
  { key:'engaged', text:'My peer was engaged and motivated during the activity.' },
  { key:'shared',  text:'My peer effectively shared thoughts and ideas during the activity.' },
];
const ENG_OPTIONS = ['Yes','Sometimes','No','Not sure'];

const PEER_STATEMENTS = {
  Awareness: [
    'My peer learnt something new.',
    'My peer was attentive to every detail of the activity.',
    'My peer understood the activity.',
    'My peer followed the instructions.',
    'My peer was able to focus on the activity.',
    'My peer found this activity meaningful.',
  ],
  Sensitivity: [
    'My peer can express his/her emotions well.',
    'My peer was motivated throughout the activity.',
    'My peer can understand my emotions well.',
    'My peer was able to ask help/support from me or the teacher.',
    'My peer was able to help others in some way.',
    'My peer contributed to the success of the activity.',
  ],
  Creativity: [
    'My peer was curious to learn new things.',
    "My peer was able to think of 'out of the box' solutions.",
    'My peer was able to think of new ways to do the activity.',
    'My peer was able to express his/her creativity during the activity.',
    'My peer was able to generate innovative ideas.',
    'My peer was able to take calculated risks.',
  ],
};

const AB_COLORS = { Awareness:'var(--awareness-color)', Sensitivity:'var(--sensitivity-color)', Creativity:'var(--creativity-color)' };
const scoreToLevel = (c) => c <= 2 ? 'Beginner' : c <= 4 ? 'Proficient' : 'Advanced';

export default function PeerAssessment() {
  const { activityId } = useParams();
  const navigate       = useNavigate();
  const [engagement, setEngagement] = useState({ engaged:'', shared:'' });
  const [circled, setCircled]       = useState({ Awareness:[], Sensitivity:[], Creativity:[] });
  const [needsPractice, setNeedsPractice] = useState('');
  const [saving, setSaving] = useState(false);

  const toggle = (ab, idx) => setCircled(p => {
    const cur = p[ab];
    return { ...p, [ab]: cur.includes(idx) ? cur.filter(i => i!==idx) : [...cur, idx] };
  });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/rubrics/peer', {
        activityId,
        studentId: 's1', // from peer assignment
        term: 'T1',
        awarenessStatements:   circled.Awareness,
        sensitivityStatements: circled.Sensitivity,
        creativityStatements:  circled.Creativity,
        needsPractice,
        engagementRatings: engagement,
      });
      toast.success('Peer feedback submitted!');
      navigate('/peer/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); }
    setSaving(false);
  };

  return (
    <>
      <div className="page-title">Peer feedback</div>
      <div className="page-sub">Arjun Verma · C1.1 — Sorting Everyday Materials · Term 1</div>

      {/* Engagement questions */}
      <div className="card">
        <div className="card-title">Based on your experience of the activity…</div>
        {ENGAGEMENT_QS.map(q => (
          <div key={q.key} style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:8 }}>{q.text}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {ENG_OPTIONS.map(opt => (
                <div key={opt} onClick={() => setEngagement(p => ({ ...p, [q.key]: opt }))}
                  style={{
                    fontSize:12, padding:'5px 16px', borderRadius:20, cursor:'pointer',
                    border:`1.5px solid ${engagement[q.key]===opt?'var(--hpc-orange)':'var(--border-light)'}`,
                    background: engagement[q.key]===opt ? 'var(--hpc-orange-light)' : '',
                    color: engagement[q.key]===opt ? '#7A2E0A' : 'var(--text-secondary)',
                    transition:'all .15s',
                  }}>{opt}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Peer progress grid */}
      <div className="card">
        <div className="card-title">My peer's progress grid</div>
        <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:12 }}>
          Based on your peer's engagement with the activity, <strong>circle the statements you think are true for your peer.</strong>
        </div>
        <div className="grid-3">
          {Object.entries(PEER_STATEMENTS).map(([ability, stmts]) => (
            <div key={ability}>
              <div style={{ fontSize:12, fontWeight:700, color: AB_COLORS[ability], marginBottom:8, textTransform:'uppercase', letterSpacing:'.04em' }}>
                {ability[0]} — {ability}
              </div>
              {stmts.map((stmt, idx) => {
                const isCircled = circled[ability].includes(idx);
                return (
                  <div key={idx} onClick={() => toggle(ability, idx)}
                    style={{
                      fontSize:12, padding:'7px 10px', borderRadius:8, marginBottom:6,
                      cursor:'pointer', userSelect:'none', lineHeight:1.4,
                      border: `1.5px solid ${isCircled ? AB_COLORS[ability] : 'var(--border-light)'}`,
                      background: isCircled ? (ability==='Awareness'?'#FBEAF0':ability==='Sensitivity'?'#FAEEDA':'#EEEDFE') : '',
                      color: isCircled ? AB_COLORS[ability] : 'var(--text-secondary)',
                      transition:'all .15s',
                    }}>{stmt}</div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Score summary */}
        <div className="grid-3" style={{ marginTop:14, paddingTop:12, borderTop:'0.5px solid var(--border-light)' }}>
          {Object.keys(PEER_STATEMENTS).map(ab => {
            const count = circled[ab].length;
            const level = scoreToLevel(count);
            return (
              <div key={ab} style={{ fontSize:11, color:'var(--text-secondary)' }}>
                Circled for {ab[0]}: <strong style={{color:'var(--text-primary)'}}>{count}</strong> → <span className={`badge badge-${level.toLowerCase()}`}>{level}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize:10, color:'var(--text-tertiary)', marginTop:4 }}>For teacher reference: 0–2 = Beginner · 3–4 = Proficient · 5–6 = Advanced</div>
      </div>

      <div className="form-group">
        <label className="form-label">My peer needs to practice…</label>
        <input className="form-control" value={needsPractice} onChange={e => setNeedsPractice(e.target.value)} placeholder="e.g. Connecting science to real life" />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting…' : 'Submit peer feedback'}</button>
    </>
  );
}
