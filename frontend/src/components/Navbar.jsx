import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="glass-panel" style={{
            margin: '1rem',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '1rem',
            zIndex: 100
        }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(to right, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    HostelAI
                </h2>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user ? (
                    <>
                        <Link to="/compare" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Compare</Link>
                        <Link to="/dashboard" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
                        <Link to="/history" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>History</Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontWeight: 700 }}>{user.username[0].toUpperCase()}</span>
                            </div>
                            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }} title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
