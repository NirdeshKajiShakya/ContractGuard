import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", 
  withCredentials: false
});

export default api;