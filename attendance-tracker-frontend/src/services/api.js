import axios from "axios";

const API = axios.create({
  baseURL: "https://online-attendence-tracker-1.onrender.com/api"
});

// 🔐 Attach token to EVERY request
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

export default API; 
