import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Check, AlertCircle, X, Filter } from 'lucide-react';

const Compare = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const [results1, setResults1] = useState([]);
    const [results2, setResults2] = useState([]);
    const [selection1, setSelection1] = useState(null);
    const [selection2, setSelection2] = useState(null);
    const [search1, setSearch1] = useState('');
    const [search2, setSearch2] = useState('');
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // وظيفة الجلب
    const searchHostels = async (query, country, setResults) => {
        try {
            const params = { country };
            if (query) params.search = query;
            if (minPrice) params.min_price = minPrice;
            if (maxPrice) params.max_price = maxPrice;
            if (minRating) params.min_rating = minRating;

            const res = await axios.get('http://localhost:8000/api/hostels/', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // تأثيرات التحميل الأولي والبحث
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchHostels(search1, 'USA', setResults1);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search1, token, minPrice, maxPrice, minRating]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchHostels(search2, 'Canada', setResults2);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search2, token, minPrice, maxPrice, minRating]);

    // تحميل المقارنة التاريخية إذا كان المعرف موجودًا
    useEffect(() => {
        const fetchComparison = async () => {
            if (!id || !token) return;
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:8000/api/compare/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setComparisonResult(res.data);

                // اختيارات وهمية لعرض واجهة المستخدم إذا كانت الأسماء متاحة
                if (res.data.hostel_names && res.data.hostel_names.length === 2) {
                    setSelection1({ name: res.data.hostel_names[0], city: 'History', country: '', price_per_night: 0, rating: 0 });
                    setSelection2({ name: res.data.hostel_names[1], city: 'History', country: '', price_per_night: 0, rating: 0 });
                }
            } catch (err) {
                setError('Failed to load comparison.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, [id, token]);

    const handleCompare = async () => {
        if (!selection1 || !selection2) return;
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:8000/api/compare/', {
                hostel_ids: [selection1.id, selection2.id]
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

    const chartData = (selection1 && selection2) ? [selection1, selection2].map(h => ({
        name: h.name,
        Price: h.price_per_night,
        Rating: h.rating
    })) : [];

    const renderHostelCard = (hostel, onRemove) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{ padding: '1.5rem', border: '2px solid var(--primary)', position: 'relative' }}
        >
            <button
                onClick={onRemove}
                style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'var(--glass-highlight)', border: 'none',
                    color: 'var(--text-main)', borderRadius: '50%',
                    width: '30px', height: '30px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                ✕
            </button>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{hostel.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{hostel.city}, {hostel.country}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>${hostel.price_per_night}/night</span>
                <span style={{ background: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>★ {hostel.rating}</span>
            </div>
        </motion.div>
    );

    const renderSearchColumn = (selection, setSelection, search, setSearch, otherSelection, placeholder, results) => {
        if (selection) {
            return renderHostelCard(selection, () => setSelection(null));
        }

        // تصفية بيت الشباب المختار *الآخر* من النتائج إذا كان موجودًا
        const filtered = results.filter(h =>
            otherSelection ? h.id !== otherSelection.id : true
        );

        return (
            <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        marginBottom: '1rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        outline: 'none'
                    }}
                />
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filtered.length > 0 ? (
                        filtered.map(hostel => (
                            <motion.div
                                key={hostel.id}
                                whileHover={{ backgroundColor: 'var(--glass-highlight)' }}
                                onClick={() => setSelection(hostel)}
                                style={{
                                    padding: '1rem',
                                    borderBottom: '1px solid var(--glass-border)',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>{hostel.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{hostel.city}</span>
                                    <span>${hostel.price_per_night}</span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                            {search ? 'No matches found' : 'Start typing to search...'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Compare Hostels</h1>

            <div style={{ marginBottom: '2rem' }}>
                <button
                    className="btn-secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Filter size={18} /> Filters
                </button>

                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="glass-panel"
                        style={{ marginTop: '1rem', padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Min Price ($)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                placeholder="0"
                                style={{ width: '150px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Max Price ($)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                placeholder="Any"
                                style={{ width: '150px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Min Rating (0-5)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={minRating}
                                onChange={e => setMinRating(e.target.value)}
                                placeholder="0"
                                min="0" max="5" step="0.5"
                                style={{ width: '150px' }}
                            />
                        </div>
                        <button
                            className="btn-secondary"
                            style={{ alignSelf: 'flex-end', height: 'fit-content' }}
                            onClick={() => { setMinPrice(''); setMaxPrice(''); setMinRating(''); }}
                        >
                            Reset
                        </button>
                    </motion.div>
                )}
            </div>

            {!comparisonResult ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                    {/* العمود 1 - الولايات المتحدة */}
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>United States</h2>
                        {renderSearchColumn(
                            selection1,
                            setSelection1,
                            search1,
                            setSearch1,
                            selection2,
                            "Search USA hotels...",
                            results1
                        )}
                    </div>

                    {/* العمود 2 - كندا */}
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Canada</h2>
                        {renderSearchColumn(
                            selection2,
                            setSelection2,
                            search2,
                            setSearch2,
                            selection1,
                            "Search Canada hotels...",
                            results2
                        )}
                    </div>
                </div>
            ) : null}

            {selection1 && selection2 && !comparisonResult && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button onClick={handleCompare} className="btn-primary" disabled={loading} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
                        {loading ? 'Analyzing...' : 'Compare with AI'}
                    </button>
                </div>
            )}

            {/* منطقة النتائج */}
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
                        <div style={{ background: 'var(--glass-highlight)', padding: '1rem', borderRadius: '0.5rem' }}>
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
                        <h3 style={{ marginBottom: '1.5rem' }}>Detailed Analysis</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {comparisonResult.comparison_table && comparisonResult.comparison_table.length > 0 ? (
                                <div className="glass-panel" style={{ gridColumn: '1 / -1', overflowX: 'auto', background: 'var(--glass-highlight)', padding: '0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <th style={{ padding: '1.5rem', color: 'var(--primary)', width: '40%' }}>Feature / Advantage</th>
                                                <th style={{ padding: '1.5rem', color: 'var(--text-main)', textAlign: 'center', width: '30%' }}>{selection1.name}</th>
                                                <th style={{ padding: '1.5rem', color: 'var(--text-main)', textAlign: 'center', width: '30%' }}>{selection2.name}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonResult.comparison_table.map((row, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{row.feature}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.details}</div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                        {row.hostel1_has ?
                                                            <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)' }}>
                                                                <Check color="#22c55e" size={28} strokeWidth={3} />
                                                            </div>
                                                            :
                                                            <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)' }}>
                                                                <X color="#ef4444" size={28} strokeWidth={3} />
                                                            </div>
                                                        }
                                                    </td>
                                                    <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                        {row.hostel2_has ?
                                                            <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)' }}>
                                                                <Check color="#22c55e" size={28} strokeWidth={3} />
                                                            </div>
                                                            :
                                                            <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)' }}>
                                                                <X color="#ef4444" size={28} strokeWidth={3} />
                                                            </div>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                (() => {
                                    // محلل بسيط لمخرجات الذكاء الاصطناعي
                                    const text = comparisonResult.analysis || '';
                                    const lines = text.split('\n');
                                    const points = [];
                                    let currentPoint = null;

                                    lines.forEach(line => {
                                        const match = line.match(/^(\d+)\.\s*\*\*(.*?)\*\*:\s*(.*)/) || line.match(/^(\d+)\.\s*([^:]+):\s*(.*)/);

                                        if (match) {
                                            if (currentPoint) points.push(currentPoint);
                                            currentPoint = {
                                                id: match[1],
                                                title: match[2],
                                                content: match[3],
                                            };
                                        } else if (currentPoint) {
                                            currentPoint.content += '\n' + line;
                                        } else if (line.trim()) {
                                            // نص المقدمة
                                            if (!points.find(p => p.id === 'intro')) {
                                                points.push({ id: 'intro', title: 'Overview', content: line });
                                            } else {
                                                points[0].content += '\n' + line;
                                            }
                                        }
                                    });
                                    if (currentPoint) points.push(currentPoint);

                                    return points.map((point, index) => (
                                        <motion.div
                                            key={point.id || index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="glass-panel"
                                            style={{
                                                padding: '1.5rem',
                                                background: 'var(--glass-highlight)',
                                                border: '1px solid var(--glass-border)'
                                            }}
                                        >
                                            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                                {point.title}
                                            </h4>
                                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                                {point.content}
                                            </p>
                                        </motion.div>
                                    ));
                                })()
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button onClick={() => {
                            setComparisonResult(null);
                            setSelection1(null);
                            setSelection2(null);
                            setSearch1('');
                            setSearch2('');
                        }} className="btn-secondary">Start New Comparison</button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Compare;
