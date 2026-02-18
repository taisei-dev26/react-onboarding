import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http:// localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.status, error.message);
        return Promise.reject(error)
    }
);

export default apiClient;