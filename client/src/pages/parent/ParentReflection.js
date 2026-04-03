import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RESOURCES = [
  { key:'booksAndMagazines',  label:'Books and magazines' },
  { key:'newspapers',         label:'Newspapers' },
  { key:'toysGamesAndSports', label:'Toys, games and sports' },
  { key:'phoneAndComputer',   label:'Phone and computer' },
  { key:'internet',           label:'Internet' },
  { key:'publicBroadcast',    label:'Public Broadcast System' },
  { key:'resourcesForCWSN',   label:'Resources for CWSN' },
];

const UNDERSTANDING_QS = [
  { key:'motivated',  text:'My child seems motivated to learn and engage with new concepts learnt at school.' },
  { key:'schedule',   text:'My child follows a schedule at home that includes curriculum and other activities, social connectivity, and screen time.' },
  { key:'difficulty', text:'My child finds the grade-level curriculum difficult and needs additional support.' },
  { key:'progress',   text:'My child is making good progress as per his/her grade.' },
];
const UND_OPTIONS = ['Yes','Sometimes','No','Not sure'];

const SUPPORT_AREAS = [
  'Languages (R1, R2, R3)', 'Mathematics', 'Science', 'Social Science',
  'Building self-belief & self-reliance', 'Developing social skills & conflict resolution',
  'Managing difficult emotions like anger', 'Developing effective study skills like time management',
  'Skill guidance / Digital literacy',
];

export default function ParentReflection() {
  const [term, setTerm]           = useState('T1');
  const [resources, setResources] = useState({});
  const [understanding, setUnderstanding] = useState({});
  const [needsSupport, setNeedsSupport]   = useState([]);
  const [homePlan, setHomePlan]   = useState('');
  const [saving, setSaving]       = useState(false);

  const toggleResource = (key) => setResources(p => ({ ...p, [key]: !p[key] }));
  const setUnder = (key, val) => setUnderstanding(p => ({ ...p, [key]: val }));
  const toggleSupport = (s) => setNeedsSupport(p => p.includes(s) ? p.filter(x => x!==s) : [...p, s]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/part-a/parent', {
        studentId: 's1',
        term,
        homeResources: resources,
        understandingChild: understanding,
        needsSupportIn: needsSupport,
        homeSupportPlan: homePlan,
      });
      toast.success('Partnership card submitted!');
    } catch { toast.error('Submission failed'); }
    setSaving(false);
  };

  return (
    <>
      <div className="page-title">Parent reflection</div>
      <div className="page-sub">
        Part A(4) — Parent-Teacher Partnership Card · Arjun Verma
        <div style={{ display:'inline-flex', gap:6, marginLeft:12 }}>
          {['T1','T2'].map(t => <div key={t} className={`chip${term===t?' selected':''}`} onClick={() => setTerm(t)} style={{fontSize:10}}>Term {t.slice(1)}</div>)}
        </div>
      </div>

      {/* Home resources */}
      <div className="card">
        <div className="card-title">Tick the resources available to your child at home</div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {RESOURCES.map(r => (
            <label key={r.key} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={!!resources[r.key]} onChange={() => toggleResource(r.key)}
                style={{ accentColor:'var(--hpc-orange)', width:16, height:16 }} />
              {r.label}
            </label>
          ))}
        </div>
        <div className="form-group" style={{ marginTop:10, marginBottom:0 }}>
          <label className="form-label">Any other (please specify)</label>
          <input className="form-control" placeholder="Other resources…" style={{ maxWidth:300 }} />
        </div>
      </div>

      {/* Understanding my child */}
      <div className="card">
        <div className="card-title">Understanding my child</div>
        <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:12 }}>Circle the most appropriate option for your child.</div>
        {UNDERSTANDING_QS.map(q => (
          <div key={q.key} style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:8 }}>{q.text}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {UND_OPTIONS.map(opt => (
                <div key={opt} onClick={() => setUnder(q.key, opt)}
                  style={{
                    fontSize:12, padding:'5px 16px', borderRadius:20, cursor:'pointer',
                    border:`1.5px solid ${understanding[q.key]===opt?'var(--hpc-orange)':'var(--border-light)'}`,
                    background: understanding[q.key]===opt ? 'var(--hpc-orange-light)' : '',
                    color: understanding[q.key]===opt ? '#7A2E0A' : 'var(--text-secondary)',
                    transition:'all .15s',
                  }}>{opt}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Support areas */}
      <div className="card">
        <div className="card-title">At school, my child needs support with</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {SUPPORT_AREAS.map(s => (
            <label key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
              <input type="checkbox" checked={needsSupport.includes(s)} onChange={() => toggleSupport(s)}
                style={{ accentColor:'var(--hpc-orange)', width:16, height:16 }} />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Home support plan */}
      <div className="card">
        <div className="card-title">Based on my discussion with the teacher, I will support my child at home by</div>
        <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:8, lineHeight:1.6 }}>
          Fostering a strong parent-teacher partnership is essential to ensure your child's holistic development. While teachers support at school, please use this space to write how you can provide additional support to your child at home.
        </div>
        <textarea className="form-control" rows={4} value={homePlan} onChange={e => setHomePlan(e.target.value)}
          placeholder="I will encourage Arjun to connect what he learns in Science to things he sees at home…" />
        <div style={{ marginTop:12 }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting…' : 'Submit partnership card'}</button>
        </div>
      </div>
    </>
  );
}
