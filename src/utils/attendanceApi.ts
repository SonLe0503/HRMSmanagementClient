import axios from 'axios';
import type { CheckInRequest, AttendanceResponse, AttendanceHistory } from '../interface';

const API_BASE_URL = 'http://localhost:5103/api';

export const attendanceApi = {
    checkIn: (data: CheckInRequest) =>
        axios.post<AttendanceResponse>(`${API_BASE_URL}/attendance/check-in`, data),

    checkOut: (employeeId: number) =>
        axios.post<AttendanceResponse>(`${API_BASE_URL}/attendance/check-out/${employeeId}`),

    getHistory: (employeeId: number) =>
        axios.get<AttendanceHistory[]>(`${API_BASE_URL}/attendance/history/${employeeId}`),
};