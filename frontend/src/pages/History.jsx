import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
    const { token, logout } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/compare/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
                if (err.response && err.response.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchHistory();
        }
    }, [token, logout]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this comparison?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/compare/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(history.filter(item => item.id !== id));
        } catch (err) {
            console.error("Failed to delete comparison", err);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Your Comparison History</h1>

            {loading ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Loading history...</div>
            ) : history.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {history.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(`/compare/${item.id}`)}
                            className="glass-panel"
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                            whileHover={{ scale: 1.01, backgroundColor: 'var(--glass-highlight)' }}
                        >
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                    {item.hostel_names[0]} <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>vs</span> {item.hostel_names[1]}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    {item.recommendation.substring(0, 100)}...
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <Clock size={14} />
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleDelete(e, item.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s, color 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.color = '#ef4444';
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                                title="Delete comparison"
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    You haven't made any comparisons yet.
                </div>
            )}
        </div>
    );
};

export default History;
