// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const store = localStorage.getItem('user');
        return store ? JSON.parse(store) : null;
    });

    const login = async (form) => {
        try {
            const res = await apiLogin(form); // form = { username, password }
            const { accessToken, user } = res.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            switch (user.role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'manager':
                    navigate('/manager');
                    break;
                case 'staff':
                    navigate('/staff');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            alert(err.response?.data || 'Login failed');
        }
    };

    const register = async (form) => {
        await apiRegister(form);
        await login({ username: form.username, password: form.password });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
