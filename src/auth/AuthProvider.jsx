import { createContext, useContext, useState } from "react";
import { Outlet } from "react-router-dom";

// create context
const AuthContext = createContext();

// context provider
export function AuthProvider() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Load from localStorage on app start
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        if (storedUser && storedToken) {
        // if (storedUser) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    }

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            <Outlet />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
