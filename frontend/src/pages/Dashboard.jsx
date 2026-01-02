import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Search, Filter, MapPin, Star, DollarSign, Phone, Globe, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user, token, logout } = useAuth();
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Filters for Hotel List
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');

    // Fetch Hostels for Main View
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
            if (token) fetchHostels(); // Only fetch if token exists
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search, country, minPrice, maxPrice, minRating, token, logout]);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.username}!</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/compare" className="btn-primary" style={{ textDecoration: 'none' }}>New Comparison</Link>
                </div>
            </header>

            {/* MAIN CONTENT: HOSTEL EXPLORER */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={22} /> Explore Hostels
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>

                    {/* FILTERS SIDEBAR */}
                    <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
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

                    {/* HOSTEL GRID */}
                    <div>
                        {loading ? (
                            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Loading hostels...</div>
                        ) : hostels.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {hostels.map((hostel, index) => (
                                    <motion.div
                                        key={hostel.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-panel"
                                        style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                                    >
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{hostel.name}</h3>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                <MapPin size={14} />
                                                {hostel.address ? <span title={hostel.address} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hostel.address}</span> : `${hostel.city}, ${hostel.country}`}
                                            </div>

                                            {/* Facilities Tags */}
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                                                {hostel.facilities && hostel.facilities.slice(0, 3).map((fac, i) => (
                                                    <span key={i} style={{ fontSize: '0.75rem', background: 'var(--glass-border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                                                        {fac}
                                                    </span>
                                                ))}
                                                {hostel.facilities && hostel.facilities.length > 3 && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{hostel.facilities.length - 3}</span>
                                                )}
                                            </div>

                                            {/* Contact Info Row */}
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                                                {hostel.phone_number && (
                                                    <a href={`tel:${hostel.phone_number}`} title={hostel.phone_number} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                                                        <Phone size={13} /> <span style={{ fontSize: '0.8rem' }}>Call</span>
                                                    </a>
                                                )}
                                                {hostel.website && (
                                                    <a href={hostel.website} target="_blank" rel="noopener noreferrer" title="Visit Website" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                                                        <Globe size={13} /> <span style={{ fontSize: '0.8rem' }}>Website</span>
                                                    </a>
                                                )}
                                            </div>

                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {hostel.description}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <DollarSign size={16} color="var(--primary)" />
                                                    {hostel.price_per_night}<span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/night</span>
                                                </div>
                                                <div style={{ background: 'var(--glass-highlight)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
                                <h3>No hostels found</h3>
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
