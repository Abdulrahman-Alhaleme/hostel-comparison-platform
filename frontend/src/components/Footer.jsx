import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>World Hotel</h3>
                    <p>
                        Discover the best hotels world-wide using our advanced AI comparison tool.
                        We help you find the perfect stay for your distinct travel needs.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-icon" aria-label="Facebook"><Facebook size={18} /></a>
                        <a href="#" className="social-icon" aria-label="Twitter"><Twitter size={18} /></a>
                        <a href="#" className="social-icon" aria-label="Instagram"><Instagram size={18} /></a>
                        <a href="#" className="social-icon" aria-label="LinkedIn"><Linkedin size={18} /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/compare">Compare Hotels</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact Support</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <ul className="footer-links">
                        <li>
                            <a href="mailto:support@worldhotel.com">
                                <Mail size={16} /> support@worldhotel.com
                            </a>
                        </li>
                        <li>
                            <a href="tel:+1234567890">
                                <Phone size={16} /> +1 (234) 567-890
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <MapPin size={16} /> 123 Travel Street, NY, USA
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} World Hotel. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
