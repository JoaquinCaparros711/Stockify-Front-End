"use client"

import { createContext, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { jwtDecode } from "jwt-decode"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("accessToken")
        const userData = localStorage.getItem("userData")

        if (token && userData) {
        try {
            return JSON.parse(userData)
        } catch (error) {
            console.error("Error parsing user data:", error)
            return null
        }
        }
        return null
    })

    // Función para obtener los datos completos del usuario
    const fetchUserData = async (token) => {
        try {
        const response = await api.get("/user/profile/", {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        })
        return response.data
        } catch (error) {
        console.error("Error fetching user data:", error)
        return null
        }
    }

    const login = async (data) => {
        try {
        const response = await api.post("/user/login/", {
            username: data.username,
            password: data.password,
        })

        const { access, refresh } = response.data

        localStorage.setItem("accessToken", access)
        localStorage.setItem("refreshToken", refresh)

        // Decodificar el token para obtener información básica
        const decodedUser = jwtDecode(access)
        console.log("Token decodificado:", decodedUser) // Para debugging

        // Intentar obtener datos completos del usuario
        const fullUserData = await fetchUserData(access)

        const userData = fullUserData || {
            id: decodedUser.user_id || decodedUser.id,
            username: decodedUser.username || data.username,
            name: decodedUser.name || decodedUser.username || data.username,
            email: decodedUser.email || "",
        }

        console.log("Datos del usuario:", userData) // Para debugging

        // Guardar los datos del usuario en localStorage
        localStorage.setItem("userData", JSON.stringify(userData))
        setUser(userData)
        navigate("/")
        } catch (error) {
        console.error("Error en el login:", error.response?.data)
        alert("Error: Usuario o contraseña incorrectos.")
        }
    }

    const register = async (formData) => {
        try {
        const response = await api.post("/user/register/", {
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

        console.log("Registro exitoso:", response.data)
        alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.")
        navigate("/login")
        } catch (error) {
        console.error("Error en el registro:", error.response?.data)
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

    const logout = () => {
        setUser(null)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userData")
        navigate("/login")
    }

    const value = {
        user,
        login,
        logout,
        register,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext)
}
