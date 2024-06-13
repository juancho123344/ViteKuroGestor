import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: 'https://back-kuro-gestor-1.onrender.com', // Cambia esto a tu URL de backend
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Cookies.get('token')}`
  }
});

export default axiosInstance;
