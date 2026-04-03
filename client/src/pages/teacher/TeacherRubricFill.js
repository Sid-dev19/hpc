import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ABILITIES = ['Awareness','Sensitivity','Creativity'];
const LEVELS    = ['Beginner','Proficient','Advanced'];
const AB_COLORS = { Awareness:'var(--awareness-color)', Sensitivity:'var(--sensitivity-color)', Creativity:'var(--creativity-color)' };
const AB_CLASS  = { Awareness:'aq-awareness', Sensitivity:'aq-sensitivity', Creativity:'aq-creativity' };

const DEMO_ACTIVITY = {
  title: 'Sorting Everyday Materials',
  competencyCode: 'C1.1',
  aqAwareness: 'Can the student name the property used to sort without prompting? Do they handle borderline objects correctly?',
  aqSensitivity: 'Does the student connect the classification to real-life use (e.g. why rubber is used for insulation)?',
  aqCreativity: 'Does the student suggest an alternative way to group the same materials and defend it?',
};

const DEMO_RUBRICS = {
  Awareness: {
    Beginner:  'Sorted 1–2 groups only with prompting; named properties with difficulty; frequent errors',
    Proficient:'Independently sorted into 3–4 categories; named properties; occasional errors on borderline objects',
    Advanced:  'Accurately classified all objects; explained reasoning spontaneously; handled all ambiguous cases',
  },
  Sensitivity: {
    Beginner:  'Engaged only when prompted; made no connections to real-life uses of materials',
    Proficient:'Connected classification to everyday use with some prompting; showed curiosity about a few objects',
    Advanced:  'Self-initiated real-world connections; asked follow-up questions about unfamiliar materials',
  },
  Creativity: {
    Beginner:  'Used only teacher-suggested categories; could not propose alternatives when asked',
    Proficient:'Suggested one alternative classification criterion when prompted; partial justification given',
    Advanced:  'Independently proposed a new classification criterion; defended it with logical reasoning',
  },
};

export default function TeacherRubricFill() {
  const { studentId, activityId } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity]     = useState(DEMO_ACTIVITY);
  const [rubrics, setRubrics]       = useState(DEMO_RUBRICS);
  const [selected, setSelected]     = useState({ Awareness:null, Sensitivity:null, Creativity:null });
  const [notes, setNotes]           = useState('');
  const [term, setTerm]             = useState('T1');
  const [aiDraft, setAiDraft]       = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [saving, setSaving]         = useState(false);
  const studentName = 'Arjun Verma'; // would come from API

  useEffect(() => {
    api.get(`/activities/${activityId}`).then(r => {
      setActivity(r.data.activity);
      const rubMap = {};
      r.data.rubrics.forEach(rb => {
        if (!rubMap[rb.ability]) rubMap[rb.ability] = {};
        rubMap[rb.ability][rb.level] = rb.descriptorText;
      });
      if (Object.keys(rubMap).length) setRubrics(rubMap);
    }).catch(() => {});
  }, [activityId]);

  const selectLevel = (ability, level) => {
    setSelected(prev => ({ ...prev, [ability]: level }));
    setAiDraft(null);
  };

  const handleSave = async () => {
    if (!selected.Awareness || !selected.Sensitivity || !selected.Creativity) {
      toast.error('Please select a level for all three abilities'); return;
    }
    setSaving(true);
    try {
      await api.post('/rubrics/teacher', {
        activityId, studentId, term,
        awarenessLevel:   selected.Awareness,
        sensitivityLevel: selected.Sensitivity,
        creativityLevel:  selected.Creativity,
        observationNotes: notes,
      });
      toast.success('Rubric saved!');
      navigate('/teacher/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const generateAiDraft = async () => {
    if (!selected.Awareness || !selected.Sensitivity || !selected.Creativity) {
      toast.error('Select all three ability levels first'); return;
    }
    setDraftLoading(true);
    try {
      const r = await api.post('/ai/draft-feedback', {
        studentId, activityId, studentName,
        activityTitle: activity.title,
        competencyCode: activity.competencyCode,
      });
      setAiDraft(r.data);
    } catch { toast.error('AI draft failed — please try again'); }
    setDraftLoading(false);
  };

  return (
    <>
      <div className="page-title">Fill assessment rubric</div>
      <div className="page-sub">
        {studentName} · Grade 6A · {activity?.title} · {activity?.competencyCode}
        <span className="badge badge-gray" style={{ marginLeft:8 }}>Term</span>
        {['T1','T2'].map(t => (
          <span key={t} className={`chip${term===t?' selected':''}`} style={{ marginLeft:4, fontSize:10 }} onClick={() => setTerm(t)}>{t}</span>
        ))}
      </div>

      {/* Assessment questions */}
      <div className="card">
        <div className="card-title">Assessment questions <span className="badge badge-gray">Observation guide — not shared with students</span></div>
        {ABILITIES.map(ab => (
          <div key={ab} className={`aq-item ${AB_CLASS[ab]}`}>
            <div className="aq-label" style={{ color: AB_COLORS[ab] }}>{ab}</div>
            {activity?.[`aq${ab}`] || `Observe student's ${ab.toLowerCase()} during the activity.`}
          </div>
        ))}
      </div>

      {/* BPA selector per ability */}
      <div className="card">
        <div className="card-title">Select performance level per ability</div>
        {ABILITIES.map(ab => (
          <div key={ab} style={{ marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color: AB_COLORS[ab], marginBottom:8 }}>
              Scientific {ab}
            </div>
            <div className="bpa-grid">
              {LEVELS.map(lv => (
                <div
                  key={lv}
                  className={`bpa-cell ${lv.toLowerCase()}${selected[ab]===lv?' selected':''}`}
                  onClick={() => selectLevel(ab, lv)}
                >
                  <div className="bpa-level-label">{lv} {selected[ab]===lv && '✓'}</div>
                  {rubrics[ab]?.[lv] || `${lv} level for ${ab}.`}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Observation notes (internal)</label>
          <textarea className="form-control" rows={3} placeholder="Notes on challenges, collaboration, engagement — feeds into the AI feedback draft…"
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      {/* AI feedback draft */}
      <div className="card">
        <div className="card-title">
          AI-drafted teacher feedback
          <button className="btn btn-sm" onClick={generateAiDraft} disabled={draftLoading}>
            {draftLoading ? 'Generating…' : aiDraft ? 'Regenerate' : 'Generate AI draft'}
          </button>
        </div>
        {!aiDraft && !draftLoading && (
          <div style={{ color:'var(--text-tertiary)', fontSize:12, padding:'8px 0' }}>
            Select all three ability levels, then click "Generate AI draft" to get a feedback template you can edit.
          </div>
        )}
        {draftLoading && <div className="loading-center" style={{ height:80 }}><div className="spinner" /></div>}
        {aiDraft && (
          <div>
            <textarea className="form-control" rows={4} defaultValue={aiDraft.feedbackText} style={{ marginBottom:10 }} />
            <div className="grid-2" style={{ marginBottom:10 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, marginBottom:5 }}>Areas of strength</div>
                {aiDraft.strengths?.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:3 }}>· {s}</div>)}
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:600, marginBottom:5 }}>Barriers to success</div>
                {aiDraft.barriers?.map((b,i) => <div key={i} style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:3 }}>· {b}</div>)}
              </div>
            </div>
            <div style={{ fontSize:12, color:'var(--text-secondary)' }}>
              <strong>Future steps:</strong> {aiDraft.futureSteps}
            </div>
          </div>
        )}
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save & submit'}</button>
        <button className="btn" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </>
  );
}
