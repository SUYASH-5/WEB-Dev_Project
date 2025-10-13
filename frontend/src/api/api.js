import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const login = (data) => API.post('/validate/login', data);
export const registerUser = (data) => API.post('/validate/register', data);
export const updateUser = (data) => API.put('/validate/updateUser', data);
export const deleteUser = () => API.delete('/validate/deleteUser');

// Teacher Routes
export const createClass = (data) => API.post('/OnlyT/create-class', data);
export const updateClass = (id, data) => API.put(`/OnlyT/update-class/${id}`, data);
export const deleteClass = (id) => API.delete(`/OnlyT/delete-class/${id}`);
export const endClass = (id) => API.put(`/OnlyT/class-ended/${id}`);
export const removeStudent = (classId, studentId) => API.put(`/OnlyT/remove-student/${classId}/${studentId}`);


// code execution
export const executeCode = (data) => API.post('/code/run', data);

// class activity
export const enterClass = (id) => API.post(`/class/enter/${id}`);
export const saveClassActivity = (classId, data) => API.put(`/class/save/${classId}`, data);
export const leaveClass = (id) => API.put(`/class/leave/${id}`);