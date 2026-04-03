import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = ['admin','teacher','student','peer','parent'];
const BLANK = { name:'', email:'', password:'demo123', role:'student', grade:'', section:'', phone:'' };

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [roleFilter, setRole] = useState('student');
  const [modal, setModal]     = useState(null); // null | 'create' | user object
  const [form, setForm]       = useState(BLANK);
  const [saving, setSaving]   = useState(false);

  const load = (role) => api.get(`/users?role=${role}`).then(r => setUsers(r.data)).catch(() => {});

  useEffect(() => { load(roleFilter); }, [roleFilter]);

  const openCreate = () => { setForm({ ...BLANK, role: roleFilter }); setModal('create'); };
  const openEdit   = (u) => { setForm({ ...u, password: '' }); setModal(u); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/users', form);
        toast.success('User created');
      } else {
        await api.put(`/users/${modal._id}`, form);
        toast.success('User updated');
      }
      setModal(null); load(roleFilter);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    await api.delete(`/users/${id}`);
    toast.success('User deactivated'); load(roleFilter);
  };

  return (
    <>
      <div className="page-title">User management</div>
      <div className="page-sub">Manage all school users by role</div>

      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        {ROLES.map(r => (
          <div key={r} className={`chip${roleFilter===r?' selected':''}`} onClick={() => setRole(r)}>
            {r.charAt(0).toUpperCase()+r.slice(1)}s
          </div>
        ))}
        <div style={{ flex:1 }} />
        <button className="btn btn-primary" onClick={openCreate}>+ Add {roleFilter}</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Email</th>
                {['student','peer'].includes(roleFilter) && <><th>Grade</th><th>Section</th></>}
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{u.name}</td>
                  <td>{u.email}</td>
                  {['student','peer'].includes(roleFilter) && <><td>{u.grade}</td><td>{u.section}</td></>}
                  <td><span className={`badge badge-${u.isActive?'success':'danger'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-sm" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deactivate(u._id)}>Deactivate</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:24, color:'var(--text-tertiary)' }}>No {roleFilter}s found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div style={{ background:'var(--bg-primary)', borderRadius:'var(--radius-lg)', padding:24, width:'100%', maxWidth:480, border:'0.5px solid var(--border-light)' }}>
            <div className="card-title">{modal==='create'?'Add new user':'Edit user'}</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Password {modal!=='create'&&'(leave blank to keep)'}</label>
                <input className="form-control" type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} />
              </div>
              {['student','peer'].includes(form.role) && <>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-control" value={form.grade} onChange={e => setForm(f=>({...f,grade:e.target.value}))}>
                    <option value="">–</option>
                    <option>6</option><option>7</option><option>8</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input className="form-control" value={form.section} onChange={e => setForm(f=>({...f,section:e.target.value}))} placeholder="A" />
                </div>
              </>}
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
              </div>
            </div>
            <div className="btn-row" style={{ marginTop:8 }}>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
              <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
