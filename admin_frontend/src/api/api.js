import axios from 'axios';



const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/admin',
  headers: { 'Content-Type': 'application/json' }
});

// AUTH
export const loginAdmin = (data) => API.post('/loginAdmin', data,{withCredentials: true});
export const logout =()=>API.get('/logoutAdmin',{withCredentials:true});
export const verifySession = () => API.get('/verify-session',{withCredentials: true});

// GROUPS
export const getGroups = () => API.get('/getGroups',{withCredentials: true});
export const createGroup = (data) => API.post('/createGroup', data,{withCredentials: true});
export const removeGroup = (id) => API.delete(`/removeGroup/${id}`,{withCredentials: true});

// TEACHERS
export const getTeachers = () => API.get('/getTeachers',{withCredentials: true});
export const updateTeacher = (id, data) => API.put(`/updateTeacher/${id}`, data,{withCredentials: true});
export const verifyTeacher = (id) => API.put(`/verifyTeacher/${id}`,{},{withCredentials: true});
export const ignoreTeacher = (id) => API.put(`/ignoreTeacher/${id}`,{}, {withCredentials: true});
export const getPendingRequests = () => API.get('/pendingRequests',{withCredentials: true});
export const removeTeacher = (id) => API.delete(`/removeTeacher/${id}`,{withCredentials: true});

// STUDENTS
export const getStudents = () => API.get('/getStudents',{withCredentials: true});
export const addStudent = (id) => API.put(`/addStudent/${id}`,{withCredentials: true});
export const removeStudent = (id) => API.put(`/removeStudent/${id}`,{}, {withCredentials: true});

// REMARKS
export const addRemark = (id, data) => API.put(`/addRemark/${id}`, data,{withCredentials: true});
export const removeRemark = (id) => API.put(`/removeRemark/${id}`,{withCredentials: true});

// ATTENDANCE
export const getAttendance = () => API.get('/getAttendance',{withCredentials: true});
