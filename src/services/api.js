import axios from 'axios';

// La URL base de tu API de Django.
const baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';


const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// INTERCEPTOR DE PETICIÓN (Request Interceptor)
// Se ejecuta ANTES de que cada petición sea enviada.
api.interceptors.request.use(
    config => {
        // Obtenemos el token de acceso desde localStorage.
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Si el token existe, lo añadimos a la cabecera de autorización.
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR DE RESPUESTA (Response Interceptor)
// Se ejecuta DESPUÉS de recibir una respuesta (o un error).
api.interceptors.response.use(
    // Si la respuesta es exitosa (código 2xx), simplemente la retornamos.
    response => response,
    
    // Si la respuesta es un error...
    async error => {
        const originalRequest = error.config;

        // Si el error es 401 (No autorizado) y no es un reintento.
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Marcamos la petición para evitar bucles infinitos.
            
            try {
                // Obtenemos el refreshToken guardado.
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Si no hay refresh token, disparamos el evento de logout
                    window.dispatchEvent(new Event('logout'));
                    return Promise.reject(error);
                }

                // Hacemos la petición para refrescar el token.
                const response = await axios.post(`${baseURL}/user/token/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;

                // Guardamos el nuevo token de acceso.
                localStorage.setItem('accessToken', access);

                // Actualizamos la cabecera de autorización en nuestra instancia de Axios.
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                
                // Actualizamos la cabecera de la petición original.
                originalRequest.headers['Authorization'] = `Bearer ${access}`;

                // Reintentamos la petición original que había fallado.
                return api(originalRequest);

            } catch (refreshError) {
                // Si el refresco del token también falla, en lugar de recargar la página,
                // disparamos un evento personalizado para que la app reaccione.
                console.error("No se pudo refrescar el token, cerrando sesión.", refreshError);
                window.dispatchEvent(new Event('logout'));
                return Promise.reject(refreshError);
            }
        }

        // Si el error no es 401, simplemente lo retornamos.
        return Promise.reject(error);
    }
);

export default api;
