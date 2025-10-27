import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// AUTH
export const login = (data) => API.post('/validate/loginUser', data , { withCredentials: true });
export const registerUser = (data) => API.post('/validate/registerUser', data, { withCredentials: true });
export const updateUser = (data) => API.put('/validate/updateUser', data, { withCredentials: true });
export const deleteUser = () => API.delete('/validate/deleteUser', { withCredentials: true });
export const verify = () => API.get('/validate/verify', { withCredentials: true });
export const getProfile = () => API.get('/validate/profile', { withCredentials: true });
export const logout = () => API.get('/validate/logout', { withCredentials: true });
export const getUsers = () => API.get('/validate/users', { withCredentials: true });
export const group = () => API.get('/validate/group', { withCredentials: true });

// Teacher Routes
export const createClass = (data) => API.post('/OnlyT/create-class', data, { withCredentials: true });
export const updateClass = (id, data) => API.put(`/OnlyT/update-class/${id}`, data, { withCredentials: true });
export const deleteClass = (id) => API.delete(`/OnlyT/delete-class/${id}`, { withCredentials: true });
export const endClass = (id) => API.put(`/OnlyT/class-ended/${id}`, {}, { withCredentials: true });
export const removeStudent = (classId, studentId) => API.put(`/OnlyT/remove-student/${classId}/${studentId}`, {}, { withCredentials: true });
export const blockStudent = (studentId) => API.put(`/OnlyT/block-student/${studentId}`, {}, { withCredentials: true });
export const addStudentToGroup = (studentId) => API.put(`/OnlyT/add-student/${studentId}`, {}, { withCredentials: true });
export const updateClassCode = (id, data) => API.put(`/OnlyT/update-code/${id}`, data, { withCredentials: true });


// code execution
export const executeCode = (data) => API.post('/code/run', data, { withCredentials: true });

// class activity
export const getClasses = () => API.get('/class', { withCredentials: true });
export const getClassById = (id) => API.get(`/class/${id}`, { withCredentials: true });
export const enterClass = (id) => API.post(`/class/enter/${id}`, {}, { withCredentials: true });
export const saveClassActivity = (classId, data) => API.put(`/class/save/${classId}`, data, { withCredentials: true });
export const leaveClass = (id) => API.put(`/class/leave/${id}`, {}, { withCredentials: true });