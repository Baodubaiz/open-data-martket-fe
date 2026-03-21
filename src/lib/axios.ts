// lib/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://open-data-martket-be.vercel.app/api/', // đổi thành base URL backend của bạn
    withCredentials: true,
});

export default api;
// http://localhost:3001/api
// https://open-data-martket.vercel.app/api