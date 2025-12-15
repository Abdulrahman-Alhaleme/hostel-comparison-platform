import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.username}!</p>
                </div>
                <Link to="/compare" className="btn-primary" style={{ textDecoration: 'none' }}>New Comparison</Link>
            </header>

            <section>
                <h2 style={{ marginBottom: '1.5rem' }}>Recent Comparisons</h2>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>You haven't made any comparisons yet.</p>
                    <Link to="/compare" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>Start your first comparison</Link>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
