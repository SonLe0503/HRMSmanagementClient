export interface CheckInRequest {
    employeeId: number;
    location?: string;
    remarks?: string;
}

export interface AttendanceResponse {
    attendanceId: number;
    attendanceDate: string;
    checkInTime: string;
    status: string;
    lateMinutes: number;
    message: string;
}

export interface AttendanceHistory {
    date: string;
    shiftName: string;
    checkIn?: string;
    checkOut?: string;
    totalHours?: number;
    status: string;
}