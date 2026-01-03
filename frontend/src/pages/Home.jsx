import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    Find Your Perfect <br />
                    <span style={{
                        background: 'linear-gradient(to right, #a78bfa, #38bdf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Hostel Match</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                    Compare hostels powered by AI. Get personalized recommendations based on price, safety, social atmosphere, and more.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {user ? (
                        <Link to="/compare" className="btn-primary" style={{ textDecoration: 'none', padding: '1rem 2rem', fontSize: '1.1rem' }}>Start Comparing</Link>
                    ) : (
                        <>
                            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '1rem 2rem', fontSize: '1.1rem' }}>Start Comparing</Link>
                            <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '1rem 2rem', fontSize: '1.1rem' }}>Login</Link>
                        </>
                    )}
                </div>
            </motion.div>

            <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {[
                    { title: "AI-Powered Analysis", desc: "Our AI breaks down reviews and descriptions to find hidden gems." },
                    { title: "Direct Comparison", desc: "See two hostels side-by-side with clear winner declarations." },
                    { title: "Personalized", desc: "The more you use it, the better the recommendations get." }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        className="glass-panel"
                        style={{ padding: '2rem', textAlign: 'left' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                    >
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{feature.title}</h3>
                        <p style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;
