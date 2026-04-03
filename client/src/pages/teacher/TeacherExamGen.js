import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BLOOM_LEVELS = ['Remember','Understand','Apply','Analyse','Evaluate','Create'];
const BLOOM_COLORS = { Remember:'var(--admin-fg)', Understand:'var(--teacher-fg)', Apply:'var(--hpc-orange)', Analyse:'var(--beginner-fg)', Evaluate:'var(--creativity-color)', Create:'var(--awareness-color)' };

const DEMO_QUESTIONS = [
  { _id:'q1', questionNo:1, sectionLabel:'Section A', questionType:'mcq', bloomLevel:'Apply', difficulty:'easy', status:'approved',
    questionText:'Which of the following is an example of a material that is both a conductor of electricity AND magnetic?',
    options:[{label:'A',text:'Rubber',isCorrect:false},{label:'B',text:'Iron',isCorrect:true},{label:'C',text:'Wood',isCorrect:false},{label:'D',text:'Glass',isCorrect:false}],
    answerKey:'B) Iron', marks:1, competencyCodes:['C1.1'] },
  { _id:'q2', questionNo:2, sectionLabel:'Section A', questionType:'mcq', bloomLevel:'Remember', difficulty:'easy', status:'approved',
    questionText:'The SI unit of length is:',
    options:[{label:'A',text:'Centimetre',isCorrect:false},{label:'B',text:'Metre',isCorrect:true},{label:'C',text:'Kilometre',isCorrect:false},{label:'D',text:'Millimetre',isCorrect:false}],
    answerKey:'B) Metre', marks:1, competencyCodes:['C1.3'] },
  { _id:'q3', questionNo:3, sectionLabel:'Section A', questionType:'mcq', bloomLevel:'Apply', difficulty:'medium', status:'pending_review',
    questionText:'When water changes from liquid to gas, the process is called:',
    options:[{label:'A',text:'Condensation',isCorrect:false},{label:'B',text:'Melting',isCorrect:false},{label:'C',text:'Evaporation',isCorrect:true},{label:'D',text:'Freezing',isCorrect:false}],
    answerKey:'C) Evaporation', marks:1, competencyCodes:['C1.2'] },
  { _id:'q11', questionNo:11, sectionLabel:'Section B', questionType:'short_answer', bloomLevel:'Apply', difficulty:'medium', status:'pending_review',
    questionText:'Explain why a boat made of steel floats on water even though steel is denser than water.',
    answerKey:'A boat floats because its hollow shape traps air, making its average density less than water (1 mark). The upward buoyant force equals the weight of water displaced by the boat\'s shape (1 mark).',
    marks:2, competencyCodes:['C1.4'] },
  { _id:'q19', questionNo:19, sectionLabel:'Section C', questionType:'long_answer', bloomLevel:'Evaluate', difficulty:'hard', status:'pending_review',
    questionText:'Design a fair test to find out which type of soil holds water best — clay, sandy, or loamy. Your answer must include: (a) the variable you will change, (b) the variable you will measure, (c) two variables you will keep the same, and (d) how you will record your results.',
    answerKey:'(a) Type of soil — 1m. (b) Amount of water retained/drained — 1m. (c) Same amount of soil, same water volume, same container, same time — 1m. (d) Results table — 1m.',
    marks:4, competencyCodes:['C6.2','C7.3'] },
];

export default function TeacherExamGen() {
  const [stage, setStage]       = useState(1); // 1=config, 2=generating, 3=review
  const [config, setConfig]     = useState({ grade:'6', examType:'half_yearly', term:'T1', totalMarks:50, durationMins:90 });
  const [questions, setQuestions] = useState(DEMO_QUESTIONS);
  const [generating, setGenerating] = useState(false);
  const [paperId, setPaperId]   = useState(null);

  const setC = (k, v) => setConfig(p => ({ ...p, [k]: v }));

  const createAndGenerate = async () => {
    setGenerating(true);
    setStage(2);
    try {
      const paperRes = await api.post('/exams/papers', {
        ...config,
        subjectId: 'scienceId',
        questionTypeMix: { mcq:{count:10,marks:1}, shortAnswer:{count:8,marks:2}, longAnswer:{count:4,marks:4}, caseBased:{count:1,marks:8} },
        difficultyMix: { easy:30, medium:50, hard:20 },
        bloomDistribution: { remember:10, understand:20, apply:30, analyse:25, evaluate:15, create:0 },
        chapters: ['Ch1','Ch5','Ch6','Ch7','Ch8','Ch9'],
      });
      setPaperId(paperRes.data._id);
      const genRes = await api.post('/ai/generate-exam', { paperId: paperRes.data._id });
      setQuestions(genRes.data.questions || DEMO_QUESTIONS);
      setStage(3);
    } catch {
      toast.error('Using demo questions — connect AI API key to generate real questions');
      setQuestions(DEMO_QUESTIONS);
      setStage(3);
    }
    setGenerating(false);
  };

  const approveQ = (id) => setQuestions(qs => qs.map(q => q._id===id ? {...q, status:'approved'} : q));
  const approveAll = () => setQuestions(qs => qs.map(q => ({...q, status:'approved'})));

  const publishPaper = async () => {
    const pending = questions.filter(q => q.status === 'pending_review').length;
    if (pending > 0) { toast.error(`${pending} questions still pending review`); return; }
    toast.success('Paper published! Students will receive it on exam day.');
  };

  const approved  = questions.filter(q => q.status === 'approved').length;
  const pending   = questions.filter(q => q.status === 'pending_review').length;

  return (
    <>
      <div className="page-title">AI exam paper generator</div>
      <div className="page-sub">Configure → AI generates → Review & approve</div>

      {/* Stepper */}
      <div className="stepper">
        {[{n:1,l:'Configure paper'},{n:2,l:'AI generates'},{n:3,l:'Review & approve'}].map((s,i) => (
          <><div className="step-item" key={s.n}>
            <div className={`step-number ${stage>s.n?'done':stage===s.n?'active':'todo'}`}>
              {stage > s.n ? '✓' : s.n}
            </div>
            <div className={`step-label ${stage>s.n?'done':stage===s.n?'active':'todo'}`}>{s.l}</div>
          </div>
          {i < 2 && <div className="step-connector" />}</>
        ))}
      </div>

      {/* Stage 1: Config */}
      {stage === 1 && (
        <div className="card">
          <div className="card-title">Paper configuration</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Grade</label>
              <select className="form-control" value={config.grade} onChange={e => setC('grade',e.target.value)}>
                <option>6</option><option>7</option><option>8</option>
              </select></div>
            <div className="form-group"><label className="form-label">Exam type</label>
              <select className="form-control" value={config.examType} onChange={e => setC('examType',e.target.value)}>
                <option value="unit_test">Unit test</option>
                <option value="half_yearly">Half-yearly</option>
                <option value="annual">Annual</option>
              </select></div>
            <div className="form-group"><label className="form-label">Term</label>
              <select className="form-control" value={config.term} onChange={e => setC('term',e.target.value)}>
                <option>T1</option><option>T2</option>
              </select></div>
            <div className="form-group"><label className="form-label">Total marks</label>
              <input className="form-control" type="number" value={config.totalMarks} onChange={e => setC('totalMarks',+e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Duration (minutes)</label>
              <input className="form-control" type="number" value={config.durationMins} onChange={e => setC('durationMins',+e.target.value)} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Chapters to include (T1 — select all that apply)</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Ch1: Wonderful World','Ch5: Measurement','Ch6: Material Around Us','Ch7: Temperature','Ch8: States of Water','Ch9: Separation Methods'].map(c => (
                <div key={c} className="chip selected">{c}</div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bloom's taxonomy levels</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {BLOOM_LEVELS.map(b => (
                <div key={b} className="chip selected" style={{ fontSize:11 }}>{b}</div>
              ))}
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom:16 }}>
            <div>
              <label className="form-label" style={{ display:'block', marginBottom:6 }}>Difficulty mix</label>
              {[['Easy','30%','var(--advanced-fg)'],['Medium','50%','var(--hpc-orange)'],['Hard','20%','var(--beginner-fg)']].map(([l,p,c]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, fontSize:12 }}>
                  <span style={{ minWidth:50, color:'var(--text-secondary)' }}>{l}</span>
                  <div style={{ flex:1, background:'var(--border-light)', borderRadius:3, height:6, overflow:'hidden' }}>
                    <div style={{ width:p, background:c, height:'100%', borderRadius:3 }} />
                  </div>
                  <span style={{ minWidth:32, color:'var(--text-secondary)' }}>{p}</span>
                </div>
              ))}
            </div>
            <div>
              <label className="form-label" style={{ display:'block', marginBottom:6 }}>Question type mix</label>
              {[['MCQ','×10','1m each = 10m'],['Short answer','×8','2m each = 16m'],['Long answer','×4','4m each = 16m'],['Case-based','×1','8m']].map(([t,c,m]) => (
                <div key={t} style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:5 }}><strong>{t}</strong> {c} · {m}</div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={createAndGenerate}>Generate with AI</button>
        </div>
      )}

      {/* Stage 2: Generating */}
      {stage === 2 && (
        <div className="card" style={{ textAlign:'center', padding:40 }}>
          <div className="spinner" style={{ margin:'0 auto 16px' }} />
          <div style={{ fontWeight:600, marginBottom:4 }}>AI is generating your exam paper…</div>
          <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Mapping questions to learning outcomes, Bloom levels, and difficulty distribution</div>
        </div>
      )}

      {/* Stage 3: Review */}
      {stage === 3 && (
        <>
          {/* Stats */}
          <div className="metrics-row" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:16 }}>
            <div className="metric"><div className="metric-label">Total questions</div><div className="metric-val">{questions.length}</div></div>
            <div className="metric"><div className="metric-label">Approved</div><div className="metric-val" style={{color:'var(--advanced-fg)'}}>{approved}</div></div>
            <div className="metric"><div className="metric-label">Pending review</div><div className="metric-val" style={{color:'var(--hpc-orange)'}}>{pending}</div></div>
            <div className="metric"><div className="metric-label">Total marks</div><div className="metric-val">50</div></div>
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Filter:</span>
            {[['All',questions.length],['Pending',pending],['Approved',approved]].map(([l,c]) => (
              <div key={l} className={`chip${l==='All'?' selected':''}`}>{l} ({c})</div>
            ))}
            <div style={{ flex:1 }} />
            <button className="btn btn-primary btn-sm" onClick={approveAll}>Approve all remaining</button>
          </div>

          {/* Questions */}
          {questions.map(q => (
            <div key={q._id} className="card" style={{ borderColor: q.status==='pending_review'?'var(--hpc-orange)':'var(--border-light)', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--text-tertiary)', minWidth:24 }}>Q{q.questionNo}.</span>
                <span className="badge" style={{ background: BLOOM_COLORS[q.bloomLevel]+'20', color: BLOOM_COLORS[q.bloomLevel], fontSize:10 }}>{q.bloomLevel}</span>
                <span className={`badge badge-${q.difficulty==='easy'?'success':q.difficulty==='medium'?'warning':'danger'}`} style={{fontSize:10}}>{q.difficulty}</span>
                <span className="badge badge-gray" style={{fontSize:10}}>{q.questionType.replace('_',' ')}</span>
                {q.competencyCodes?.map(c => <span key={c} className="badge badge-orange" style={{fontSize:10}}>{c}</span>)}
                <span className="badge badge-gray" style={{marginLeft:'auto',fontSize:10}}>{q.marks}m</span>
                <span className={`badge badge-${q.status==='approved'?'success':'warning'}`} style={{fontSize:10}}>
                  {q.status==='approved'?'Approved ✓':'Pending review'}
                </span>
              </div>
              <div style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.6, marginBottom:10 }}>{q.questionText}</div>
              {q.options && (
                <div className="grid-2" style={{ marginBottom:10 }}>
                  {q.options.map(opt => (
                    <div key={opt.label} style={{ fontSize:12, padding:'6px 10px', borderRadius:6, border:'0.5px solid var(--border-light)',
                      background: opt.isCorrect?'var(--advanced-bg)':'', color: opt.isCorrect?'var(--advanced-fg)':'var(--text-secondary)' }}>
                      {opt.label}) {opt.text} {opt.isCorrect && '✓'}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize:11, background:'var(--bg-secondary)', borderRadius:6, padding:'8px 10px', color:'var(--text-secondary)', marginBottom:10, lineHeight:1.6 }}>
                <strong>Answer key:</strong> {q.answerKey}
              </div>
              <div className="btn-row">
                {q.status === 'pending_review' && <button className="btn btn-sm btn-primary" onClick={() => approveQ(q._id)}>Approve ✓</button>}
                <button className="btn btn-sm">Edit</button>
                <button className="btn btn-sm btn-ghost" style={{color:'var(--beginner-fg)'}}>Swap</button>
              </div>
            </div>
          ))}

          {/* Paper summary */}
          <div className="card" style={{ marginTop:8 }}>
            <div className="card-title">Paper summary & publish</div>
            <div className="grid-3">
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', marginBottom:8 }}>Question mix</div>
                {[['MCQ (×10)','10 marks'],['Short answer (×8)','16 marks'],['Long answer (×4)','16 marks'],['Case-based (×1)','8 marks'],['Total','50 marks']].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0', borderTop:l==='Total'?'0.5px solid var(--border-light)':'none', marginTop:l==='Total'?4:0 }}>
                    <span style={{color:'var(--text-secondary)'}}>{l}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', marginBottom:8 }}>Bloom coverage</div>
                {[['Remember','10%'],['Understand','20%'],['Apply','30%'],['Analyse','25%'],['Evaluate','15%']].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'3px 0' }}>
                    <span style={{color:'var(--text-secondary)'}}>{l}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', marginBottom:8 }}>Competency coverage</div>
                {[['C1.1–C1.4','Matter'],['C2.1, C2.3','Physical world'],['C5.1','S-T-Society'],['C6.2, C7.1, C7.3','Inquiry & comm.']].map(([c,d]) => (
                  <div key={c} style={{ fontSize:11, color:'var(--text-secondary)', marginBottom:4 }}>
                    <span className="badge badge-orange" style={{fontSize:9}}>{c}</span> {d}
                  </div>
                ))}
              </div>
            </div>
            {pending > 0 && <div className="alert alert-warning" style={{marginTop:12}}><span>⚠</span><div>{pending} questions still pending review before publish.</div></div>}
            <div className="btn-row" style={{ marginTop:12 }}>
              <button className="btn btn-primary" onClick={publishPaper}>Publish paper</button>
              <button className="btn">Export PDF</button>
              <button className="btn">Save as draft</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
