import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DEFAULT_ROUTES = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  peer: '/peer/dashboard',
  parent: '/parent/dashboard'
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
      const result = await login(form.email, form.password);
      
      if (result.success) {
        toast.success(`Welcome back, ${result.user.user_metadata?.name || result.user.email}!`);
        navigate(DEFAULT_ROUTES[result.user.user_metadata?.role || result.user.role]);
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>HPC Platform Login</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0 }}>
              Demo Credentials:
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.375rem', marginTop: '1rem' }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Admin:</div>
              <div>admin@vidyabharati.edu • demo123</div>
              
              <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Teacher:</div>
              <div>teacher@vidyabharati.edu • demo123</div>
              
              <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Student:</div>
              <div>student@vidyabharati.edu • demo123</div>
              
              <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Peer:</div>
              <div>peer@vidyabharati.edu • demo123</div>
              
              <div style={{ fontWeight: '500' }}>Parent:</div>
              <div>parent@vidyabharati.edu • demo123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
