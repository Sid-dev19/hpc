import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEFAULT_ROUTES = {
  admin: '/admin/dashboard', teacher: '/teacher/dashboard',
  student: '/student/dashboard', peer: '/peer/dashboard', parent: '/parent/dashboard'
};

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome, ${user.name}!`);
      navigate(DEFAULT_ROUTES[user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-tertiary)' }}>
      <div style={{ background:'var(--bg-primary)', border:'0.5px solid var(--border-light)', borderRadius:'var(--radius-lg)', padding:'36px 40px', width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:22, fontWeight:700, color:'var(--hpc-orange)', marginBottom:4 }}>HPC Platform</div>
          <div style={{ fontSize:13, color:'var(--text-secondary)' }}>Holistic Progress Card · Middle Stage</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-control" type="email" placeholder="your@school.edu" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width:'100%', padding:'10px', fontSize:14, marginTop:8 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div style={{ marginTop:20, padding:12, background:'var(--bg-secondary)', borderRadius:'var(--radius-md)', fontSize:11, color:'var(--text-secondary)' }}>
          <div style={{ fontWeight:600, marginBottom:4 }}>Demo accounts</div>
          <div>admin@vidyabharati.edu · teacher@vidyabharati.edu</div>
          <div>student@vidyabharati.edu · parent@vidyabharati.edu</div>
          <div style={{ marginTop:2, color:'var(--text-tertiary)' }}>Password: demo123</div>
        </div>
      </div>
    </div>
  );
}
