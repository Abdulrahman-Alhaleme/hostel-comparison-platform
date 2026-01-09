import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="glass-panel navbar">
            <Link to="/" className="nav-brand">
                <h2>World Hotel</h2>
            </Link>

            <button
                className="mobile-menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`nav-items ${isOpen ? 'open' : ''}`}>
                <button
                    onClick={toggleTheme}
                    className="icon-btn"
                    title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user ? (
                    <>
                        <Link to="/compare" className="nav-link" onClick={() => setIsOpen(false)}>Compare</Link>
                        <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
                        <Link to="/history" className="nav-link" onClick={() => setIsOpen(false)}>History</Link>
                        <div className="user-snippet">
                            <div className="avatar">
                                <span>{user.username[0].toUpperCase()}</span>
                            </div>
                            <button onClick={logout} className="icon-btn" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Login</Link>
                        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }} onClick={() => setIsOpen(false)}>Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
