import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/admin',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const loginAdmin = (data) => API.post('/loginAdmin', data);

// GROUPS
export const getGroups = () => API.get('/getGroups');
export const createGroup = (data) => API.post('/createGroup', data);
export const removeGroup = (id) => API.delete(`/removeGroup/${id}`);

// TEACHERS
export const getTeachers = () => API.get('/getTeachers');
export const updateTeacher = (id, data) => API.put(`/updateTeacher/${id}`, data);
export const verifyTeacher = (id) => API.put(`/verifyTeacher/${id}`);
export const ignoreTeacher = (id) => API.put(`/ignoreTeacher/${id}`);
export const getPendingRequests = () => API.get('/pendingRequests');
export const removeTeacher = (id) => API.delete(`/removeTeacher/${id}`);

// STUDENTS
export const getStudents = () => API.get('/getStudents');
export const addStudent = (id) => API.put(`/addStudent/${id}`);
export const removeStudent = (id) => API.put(`/removeStudent/${id}`);

// REMARKS
export const addRemark = (id, data) => API.put(`/addRemark/${id}`, data);
export const removeRemark = (id) => API.put(`/removeRemark/${id}`);

// ATTENDANCE
export const getAttendance = () => API.get('/getAttendance');
