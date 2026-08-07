import axios from "axios";

const baseURL = import.meta.env.MODE === 'development'
    ? '/api/'
    : 'https://attendance-magic-aehq.vercel.app/api/';

const API = axios.create({
    baseURL: baseURL,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;