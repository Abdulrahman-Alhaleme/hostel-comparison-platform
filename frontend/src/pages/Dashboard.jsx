import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Search, Filter, MapPin, Star, DollarSign, Phone, Globe, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import './Dashboard.css';

const Dashboard = () => {
    const { user, token, logout } = useAuth();
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // فلاتر لقائمة الفنادق
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');

    // جلب بيوت الشباب للعرض الرئيسي
    useEffect(() => {
        const fetchHostels = async () => {
            setLoading(true);
            try {
                const params = {};
                if (search) params.search = search;
                if (country) params.country = country;
                if (minPrice) params.min_price = minPrice;
                if (maxPrice) params.max_price = maxPrice;
                if (minRating) params.min_rating = minRating;

                const res = await axios.get('http://localhost:8000/api/hostels/', {
                    params,
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHostels(res.data);
            } catch (err) {
                console.error("Failed to fetch hostels", err);
                if (err.response && err.response.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (token) fetchHostels(); // الجلب فقط في حالة وجود رمز مميز
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search, country, minPrice, maxPrice, minRating, token, logout]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.username}!</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/compare" className="btn-primary" style={{ textDecoration: 'none' }}>New Comparison</Link>
                </div>
            </header>

            {/* المحتوى الرئيسي: مستكشف بيوت الشباب */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={22} /> Explore Hotels
                </h2>

                <div className="dashboard-grid">

                    {/* شريط الفلاتر الجانبي */}
                    <div className="glass-panel filter-sidebar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <Filter size={20} />
                            <h3 style={{ margin: 0 }}>Filters</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Search Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Country</label>
                                <select className="input-field" value={country} onChange={e => setCountry(e.target.value)}>
                                    <option value="">All Countries</option>
                                    <option value="USA">USA</option>
                                    <option value="Canada">Canada</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Price Range ($)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="number" className="input-field" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                                    <input type="number" className="input-field" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Min Rating: {minRating || 0}</label>
                                <input type="range" min="0" max="5" step="0.5" value={minRating || 0} onChange={e => setMinRating(e.target.value)} style={{ width: '100%' }} />
                            </div>

                            <button
                                className="btn-secondary"
                                onClick={() => { setSearch(''); setCountry(''); setMinPrice(''); setMaxPrice(''); setMinRating(''); }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* شبكة بيوت الشباب */}
                    <div>
                        {loading ? (
                            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Loading hotels...</div>
                        ) : hostels.length > 0 ? (
                            <div className="hotel-grid">
                                {hostels.map((hostel, index) => (
                                    <motion.div
                                        key={hostel.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-panel hotel-card"
                                        onClick={() => navigate(`/hotel/${hostel.id}`)}
                                        whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                    >
                                        <div className="hotel-card-content">
                                            <h3 className="card-title">{hostel.name}</h3>

                                            <div className="card-location">
                                                <MapPin size={14} />
                                                {hostel.address ? <span title={hostel.address} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hostel.address}</span> : `${hostel.city}, ${hostel.country}`}
                                            </div>

                                            {/* وسوم المرافق */}
                                            <div className="card-tags">
                                                {hostel.facilities && hostel.facilities.slice(0, 3).map((fac, i) => (
                                                    <span key={i} className="tag-badge">
                                                        {fac}
                                                    </span>
                                                ))}
                                                {hostel.facilities && hostel.facilities.length > 3 && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{hostel.facilities.length - 3}</span>
                                                )}
                                            </div>

                                            {/* صف معلومات الاتصال */}
                                            <div className="contact-row">
                                                {hostel.phone_number && (
                                                    <a href={`tel:${hostel.phone_number}`} title={hostel.phone_number} className="contact-link" style={{ color: 'var(--text-muted)' }}>
                                                        <Phone size={13} /> <span style={{ fontSize: '0.8rem' }}>Call</span>
                                                    </a>
                                                )}
                                                {hostel.website && (
                                                    <a href={hostel.website} target="_blank" rel="noopener noreferrer" className="contact-link" title="Visit Website" style={{ color: 'var(--primary)' }}>
                                                        <Globe size={13} /> <span style={{ fontSize: '0.8rem' }}>Website</span>
                                                    </a>
                                                )}
                                            </div>

                                            <p className="description-preview">
                                                {hostel.description}
                                            </p>

                                            <div className="card-footer">
                                                <div className="price-tag">
                                                    <DollarSign size={16} color="var(--primary)" />
                                                    {hostel.price_per_night}<span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/night</span>
                                                </div>
                                                <div className="rating-badge">
                                                    <Star size={14} fill="orange" color="orange" />
                                                    {hostel.rating}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                                <h3>No hotels found</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
