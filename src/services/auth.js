import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const verifyToken = async (token) => {
    const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const initiateGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
};

export const handleGoogleCallback = async () => {
    const response = await api.get('/auth/login-success', {
        withCredentials: true
    });
    return response.data;
};