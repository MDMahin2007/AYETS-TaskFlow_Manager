import axios from "axios";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const envUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE =
  envUrl && !(isLocalhost && envUrl.includes("onrender.com"))
    ? envUrl
    : isLocalhost
    ? "http://localhost:5000"
    : "https://ayets-taskflow-manager.onrender.com";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 12000,
});

export const getTasks = (params = {}) => api.get("/tasks", { params });
export const createTask = (taskData) =>
  typeof taskData === "string"
    ? api.post("/tasks", { title: taskData })
    : api.post("/tasks", taskData);
export const toggleTask = (id, status) => api.put(`/tasks/${id}`, { status });
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const clearCompletedTasks = () => api.delete("/tasks/completed");
export const getTaskStats = () => api.get("/tasks/stats");

