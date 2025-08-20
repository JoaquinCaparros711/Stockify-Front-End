import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al iniciar, intenta restaurar la sesión desde localStorage
    const initializeAuth = useCallback(() => {
        const accessToken = localStorage.getItem("accessToken");
        const savedUser = localStorage.getItem("user");

        if (accessToken && savedUser) {
            try {
                const decodedToken = jwtDecode(accessToken);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser(JSON.parse(savedUser));
                    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
                } else {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                console.error("Token inválido o corrupto, limpiando sesión.", error);
                localStorage.clear();
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Se envuelve logout en useCallback para que su referencia sea estable
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user"); // Limpiamos la key consistente
        delete api.defaults.headers.common["Authorization"];
        navigate("/login");
    }, [navigate]); // navigate es una dependencia estable

    // Escucha el evento 'logout' disparado por el interceptor de la API
    useEffect(() => {
        const handleLogoutEvent = () => {
            logout();
        };

        window.addEventListener('logout', handleLogoutEvent);
        return () => {
            window.removeEventListener('logout', handleLogoutEvent);
        };
    }, [logout]); // Se añade 'logout' como dependencia para cumplir la regla de hooks

    const login = async (data) => {
        try {
            const response = await api.post("/user/login/", {
                username: data.username,
                password: data.password,
            });

            const { access, refresh } = response.data;
            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);

            const decodedToken = jwtDecode(access);
            const userId = decodedToken.user_id;

            // Obtenemos el perfil completo del usuario para guardarlo
            const userProfileResponse = await api.get(`/user/register/${userId}/`);
            const userProfile = userProfileResponse.data;

            localStorage.setItem("user", JSON.stringify(userProfile));
            setUser(userProfile);
            
            api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
            navigate("/");
        } catch (error) {
            console.error("Error en el login:", error);
            throw error; // Lanza el error para que el componente Login lo muestre
        }
    };

    const register = async (formData) => {
        try {
            await api.post("/user/register/", {
                username: formData.username,
                password: formData.password,
                password2: formData.confirmPassword,
                email: formData.email,
                name: formData.name,
                company: {
                    name: formData.companyName,
                    cuit: formData.companyCuit,
                    email: formData.companyEmail,
                    phone: formData.companyPhone,
                    address: formData.companyAddress,
                },
            });
            navigate("/login");
        } catch (error) {
            const errorData = error.response?.data;
            let errorMessage = "Ocurrió un error en el registro.";
            if (errorData) {
                errorMessage = Object.keys(errorData)
                    .map((key) => {
                        if (key === "company" && typeof errorData[key] === "object") {
                            return Object.keys(errorData[key])
                                .map((companyKey) => `Empresa - ${companyKey}: ${errorData[key][companyKey]}`)
                                .join("\n");
                        }
                        return `${key}: ${errorData[key]}`;
                    })
                    .join("\n");
            }
            alert(errorMessage); // Puedes cambiar esto por una notificación bonita si quieres
        }
    };

    const updateProfile = async (userId, profileData) => {
        try {
            const response = await api.patch(`/user/register/${userId}/`, profileData);
            
            const updatedUser = response.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error("Error al actualizar el perfil:", error.response?.data);
            throw error;
        }
    };

    const value = { user, login, logout, register, updateProfile };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);