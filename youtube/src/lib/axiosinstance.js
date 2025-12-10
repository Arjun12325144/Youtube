import axios from "axios";

// Prefer NEXT_PUBLIC_BACKEND_URL for Next.js frontend, fall back to BACKEND_URL or localhost
const baseURL =
    process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000";

const axiosinstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

export default axiosinstance;