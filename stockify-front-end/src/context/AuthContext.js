import { createContext, useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { jwtDecode } from "jwt-decode"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // ✅ Verificar token y restaurar sesión si existe
    useEffect(() => {
        const initializeAuth = async () => {
            const access = localStorage.getItem("accessToken")
            const savedProfile = localStorage.getItem("userProfile")

            if (access) {
                try {
                    const decoded = jwtDecode(access)
                    const userId = decoded.user_id

                    if (savedProfile) {
                        setUser(JSON.parse(savedProfile))
                    } else {
                        const res = await api.get(`/user/register/${userId}/`)
                        localStorage.setItem("userProfile", JSON.stringify(res.data))
                        setUser(res.data)
                    }

                    // Opcional: set token en axios headers por si hace falta
                    api.defaults.headers.common["Authorization"] = `Bearer ${access}`

                } catch (e) {
                    console.error("Error al cargar sesión persistida:", e)
                    localStorage.removeItem("accessToken")
                    localStorage.removeItem("refreshToken")
                    localStorage.removeItem("userProfile")
                    setUser(null)
                }
            }

            setLoading(false)
        }

        initializeAuth()
    }, [])

    const login = async (data) => {
        try {
            const response = await api.post("/user/login/", {
                username: data.username,
                password: data.password,
            })

            const { access, refresh } = response.data
            localStorage.setItem("accessToken", access)
            localStorage.setItem("refreshToken", refresh)

            const decodedToken = jwtDecode(access)
            const userId = decodedToken.user_id;

            const userProfileResponse = await api.get(`/user/register/${userId}/`);
            const userProfile = userProfileResponse.data;

            localStorage.setItem("userProfile", JSON.stringify(userProfile));
            setUser(userProfile)

            // Set Authorization en axios
            api.defaults.headers.common["Authorization"] = `Bearer ${access}`

            navigate("/")
        } catch (error) {
            console.error("Error en el login:", error);
            // --- ¡LÍNEA CLAVE! ---
            // Esto "devuelve" el error al componente que llamó a la función.
            throw error;
        }
    }

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
            })

            navigate("/login")
        } catch (error) {
            const errorData = error.response?.data
            let errorMessage = "Ocurrió un error en el registro."
            if (errorData) {
                errorMessage = Object.keys(errorData)
                    .map((key) => {
                        if (key === "company" && typeof errorData[key] === "object") {
                            return Object.keys(errorData[key])
                                .map((companyKey) => `Empresa - ${companyKey}: ${errorData[key][companyKey]}`)
                                .join("\n")
                        }
                        return `${key}: ${errorData[key]}`
                    })
                    .join("\n")
            }
            alert(errorMessage)
        }
    }

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken")
            if (refreshToken) {
                await api.post("/user/logout/", { refresh: refreshToken })
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error)
        } finally {
            setUser(null)
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("userProfile")
            navigate("/login")
        }
    }

    const updateProfile = async (userId, profileData) => {
        try {
            const response = await api.patch(`/user/register/${userId}/`, profileData); // URL CORRECTA
            
            const updatedUser = response.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error("Error al actualizar el perfil:", error.response?.data);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
