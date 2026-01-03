import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const HotelDetails = () => {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(true);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await axios.get(`http://localhost:8000/api/hostels/${id}`, { headers });
                setHotel(res.data);

                // Trigger Analysis
                fetchAnalysis(res.data.id, headers);
            } catch (error) {
                console.error("Error fetching hotel:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAnalysis = async (hostelId, headers) => {
            try {
                const res = await axios.post('http://localhost:8000/api/analysis/hostel', { hostel_id: hostelId }, { headers });
                setAnalysis(res.data);
            } catch (error) {
                console.error("Error fetching analysis:", error);
            } finally {
                setAnalyzing(false);
            }
        };

        fetchHotel();
    }, [id]);

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>Loading...</div>;
    }

    if (!hotel) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>Hotel not found</div>;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                {/* Header Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{hotel.name}</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{hotel.city}, {hotel.country}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>
                                <span>{hotel.rating}</span>
                                <Star fill="#fbbf24" size={32} />
                            </div>
                            <p style={{ color: 'var(--text-muted)' }}>Price per night: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>${hotel.price_per_night}</span></p>
                        </div>
                    </div>
                </div>

                {/* AI Analysis Card - Noon Style (Theme Aware) */}
                <motion.div
                    className="glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '0', overflow: 'hidden' }}
                >
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Hostel Ratings & Review Summary</h2>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>{hotel.rating}</span>
                            <div style={{ display: 'flex' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={24} fill={i < Math.round(hotel.rating / 2) ? "#22c55e" : "var(--glass-border)"} color="none" />
                                ))}
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0' }}>Based on detailed analysis</p>

                        <div style={{ background: 'var(--glass-highlight)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.1rem' }}>Summarised by HostelAI</span>
                            </div>

                            {analyzing ? (
                                <div style={{ color: 'var(--text-muted)' }}>Analyzing reviews...</div>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Summary */}
                                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                        <div style={{ marginTop: '0.25rem', minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-main)' }}></div>
                                        {analysis?.summary}
                                    </li>

                                    {/* Pros */}
                                    {analysis?.pros.map((pro, index) => (
                                        <li key={`pro-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                            <div style={{ marginTop: '0.25rem', minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-main)' }}></div>
                                            <span style={{ fontWeight: 500, color: '#22c55e' }}>Advantage:</span> {pro}
                                        </li>
                                    ))}

                                    {/* Cons */}
                                    {analysis?.cons.map((con, index) => (
                                        <li key={`con-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                            <div style={{ marginTop: '0.25rem', minWidth: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-main)' }}></div>
                                            <span style={{ fontWeight: 500, color: '#ef4444' }}>Disadvantage:</span> {con}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Details Grid */}


            </div>
        </div>
    );
};

export default HotelDetails;
