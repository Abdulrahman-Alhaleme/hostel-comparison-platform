import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Check, AlertCircle } from 'lucide-react';

const Compare = () => {
    const { token } = useAuth();
    const [hostels, setHostels] = useState([]);
    const [selectedHostels, setSelectedHostels] = useState([]);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch hostels
        // Using unauthenticated endpoint or authenticated? Using authenticated for now
        const fetchHostels = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/hostels/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHostels(res.data);
            } catch (err) {
                console.error("Failed to fetch hostels", err);
            }
        };
        fetchHostels();
    }, [token]);

    const handleSelect = (hostel) => {
        if (selectedHostels.find(h => h.id === hostel.id)) {
            setSelectedHostels(selectedHostels.filter(h => h.id !== hostel.id));
        } else {
            if (selectedHostels.length < 2) {
                setSelectedHostels([...selectedHostels, hostel]);
            }
        }
    };

    const handleCompare = async () => {
        if (selectedHostels.length !== 2) return;
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:8000/api/compare/', {
                hostel_ids: selectedHostels.map(h => h.id)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComparisonResult(res.data);
        } catch (err) {
            setError('Comparison failed. AI service might be unavailable.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        const input = document.getElementById('comparison-result');
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('hostel_comparison.pdf');
        });
    };

    const chartData = selectedHostels.map(h => ({
        name: h.name,
        Price: h.price_per_night,
        Rating: h.rating
    }));

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Compare Hostels</h1>

            {/* Selection Area */}
            {selectedHostels.length < 2 && (
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Select {2 - selectedHostels.length} more hostel{2 - selectedHostels.length > 1 ? 's' : ''} to compare
                </p>
            )}

            {!comparisonResult ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {hostels.map(hostel => (
                        <motion.div
                            key={hostel.id}
                            className={`glass-panel`}
                            style={{
                                padding: '1.5rem',
                                cursor: 'pointer',
                                border: selectedHostels.find(h => h.id === hostel.id) ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                transition: 'all 0.2s'
                            }}
                            whileHover={{ y: -5 }}
                            onClick={() => handleSelect(hostel)}
                        >
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{hostel.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{hostel.city}, {hostel.country}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold' }}>${hostel.price_per_night}/night</span>
                                <span style={{ background: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>★ {hostel.rating}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : null}

            {selectedHostels.length === 2 && !comparisonResult && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button onClick={handleCompare} className="btn-primary" disabled={loading} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
                        {loading ? 'Analyzing...' : 'Compare with AI'}
                    </button>
                </div>
            )}

            {/* Results Area */}
            {comparisonResult && (
                <motion.div
                    id="comparison-result"
                    className="glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '2rem', marginTop: '2rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2>AI Analysis Result</h2>
                        <button onClick={exportPDF} className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Download size={18} /> Export PDF
                        </button>
                    </div>

                    <div style={{ display: 'grid', md: { gridTemplateColumns: '1fr 1fr' }, gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                            <h3 style={{ color: 'var(--primary)' }}>Recommendation</h3>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{comparisonResult.recommendation}</p>
                        </div>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                                    <YAxis stroke="var(--text-muted)" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Price" fill="#a78bfa" />
                                    <Bar dataKey="Rating" fill="#38bdf8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h3>Detailed Analysis</h3>
                        <p style={{ lineHeight: '1.6', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                            {comparisonResult.analysis}
                        </p>
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button onClick={() => { setComparisonResult(null); setSelectedHostels([]); }} className="btn-secondary">Start New Comparison</button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Compare;
