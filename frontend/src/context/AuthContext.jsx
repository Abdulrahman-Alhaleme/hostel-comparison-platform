import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        },
    });

    useEffect(() => {
        if (token) {
            api.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => {
                    setToken(null);
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (username, password) => {
        // في التطبيق الحقيقي، يتم استخدام تنسيق form-data بواسطة OAuth2PasswordRequestForm
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const res = await api.post('/auth/login', formData);
        setToken(res.data.access_token);
        localStorage.setItem('token', res.data.access_token);

        // جلب المستخدم فوراً
        const userRes = await axios.get('http://localhost:8000/api/auth/me', {
            headers: { Authorization: `Bearer ${res.data.access_token}` }
        });
        setUser(userRes.data);
    };

    const register = async (email, username, password) => {
        await api.post('/auth/register', { email, username, password });
        await login(username, password);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
