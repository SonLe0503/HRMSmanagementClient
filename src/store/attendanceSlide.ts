import { createAsyncThunk, createSlice, isPending, isRejected, type PayloadAction } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// ── DTO Interfaces ───────────────────────────────────────────────────────────────

export interface CheckInRequestDto {
    location?: string;
    deviceInfo?: string;
    ipAddress?: string;
    remarks?: string;
}

export interface CheckOutRequestDto {
    location?: string;
    deviceInfo?: string;
    ipAddress?: string;
    remarks?: string;
}

export interface AttendanceResponseDto {
    attendanceId: number;
    employeeId: number;
    employeeName: string;
    attendanceDate: string; 
    shiftId?: number;
    shiftName?: string;
    checkInTime?: string; 
    checkOutTime?: string; 
    workingHours?: number; 
    overtimeHours?: number; 
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
    status: string;
    source?: string;
    isManualAdjusted?: boolean;
    isLocked?: boolean;
    location?: string;
    remarks?: string;
}

export interface AttendanceLogResponseDto {
    logId: number;
    employeeId: number;
    shiftId?: number;
    logTime: string; 
    logType: string;
    source: string;
    deviceInfo?: string;
    ipAddress?: string;
    location?: string;
    remarks?: string;
}

export interface AttendanceDetailResponseDto {
    attendance: AttendanceResponseDto;
    logs: AttendanceLogResponseDto[];
}

export interface ManualAdjustAttendanceDto {
    checkInTime?: string;
    checkOutTime?: string;
    status: string;
    remarks?: string;
}

export interface ManualCreateAttendanceDto {
    employeeId: number;
    attendanceDate: string;
    shiftId?: number;
    checkInTime?: string;
    checkOutTime?: string;
    status: string;
    remarks?: string;
}

interface IAttendanceState {
    records: AttendanceResponseDto[];
    selectedDetail: AttendanceDetailResponseDto | null;
    logs: AttendanceLogResponseDto[];
    myToday: AttendanceDetailResponseDto | null;
    myHistory: AttendanceResponseDto[];
    
    // UI states
    loading: boolean;
    error: string | null;
    successMessage: string | null;
    
    // Legacy support for older components mock
    schedules: any[]; 
}

const initialState: IAttendanceState = {
    records: [],
    selectedDetail: null,
    logs: [],
    myToday: null,
    myHistory: [],
    loading: false,
    error: null,
    successMessage: null,
    schedules: [],
};

// ── Thunks: Employee ───────────────────────────────────────────────────────────────────

export const checkIn = createAsyncThunk(
    "attendance/checkIn",
    async (dto: CheckInRequestDto, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/check-in",
                method: "POST",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi check-in");
        }
    }
);

export const checkOut = createAsyncThunk(
    "attendance/checkOut",
    async (dto: CheckOutRequestDto, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/check-out",
                method: "POST",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi check-out");
        }
    }
);

export const fetchMyToday = createAsyncThunk(
    "attendance/fetchMyToday",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/my-today",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy dữ liệu chấm công hôm nay");
        }
    }
);

export const fetchMyHistory = createAsyncThunk(
    "attendance/fetchMyHistory",
    async (params: { fromDate?: string; toDate?: string }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/my-history",
                method: "GET",
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy lịch sử chấm công");
        }
    }
);

// ── Thunks: Management ───────────────────────────────────────────────────────────────────

export const fetchAttendanceByDate = createAsyncThunk(
    "attendance/fetchByDate",
    async (date: string, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance",
                method: "GET",
                params: { date },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy dữ liệu");
        }
    }
);

export const searchAttendance = createAsyncThunk(
    "attendance/search",
    async (params: { fromDate?: string; toDate?: string; employeeId?: number; status?: string }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/search",
                method: "GET",
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi tìm kiếm chấm công");
        }
    }
);

export const fetchAttendanceDetail = createAsyncThunk(
    "attendance/fetchDetail",
    async ({ employeeId, date }: { employeeId: number; date: string }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Attendance/${employeeId}/${date}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy chi tiết chấm công");
        }
    }
);

export const manualAdjustAttendance = createAsyncThunk(
    "attendance/manualAdjust",
    async ({ attendanceId, dto }: { attendanceId: number; dto: ManualAdjustAttendanceDto }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Attendance/manual-adjust/${attendanceId}`,
                method: "PUT",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi điều chỉnh chấm công");
        }
    }
);

export const manualCreateAttendance = createAsyncThunk(
    "attendance/manualCreate",
    async (dto: ManualCreateAttendanceDto, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/manual-create",
                method: "POST",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi tạo chấm công");
        }
    }
);

export const lockAttendance = createAsyncThunk(
    "attendance/lock",
    async (attendanceId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Attendance/${attendanceId}/lock`,
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            return { attendanceId, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi khóa chấm công");
        }
    }
);

export const unlockAttendance = createAsyncThunk(
    "attendance/unlock",
    async (attendanceId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Attendance/${attendanceId}/unlock`,
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            return { attendanceId, message: response.data.message };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi mở khóa chấm công");
        }
    }
);

export const fetchAttendanceLogs = createAsyncThunk(
    "attendance/fetchLogs",
    async (params: { employeeId: number; date: string }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/logs",
                method: "GET",
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy lịch sử check-in");
        }
    }
);

// MOCK: Weekly Schedule fetching (for ShiftSchedules UI compatibility currently)
export const fetchWeeklySchedule = createAsyncThunk(
    "attendance/fetchWeeklySchedule",
    async (_employeeId: number | undefined) => {
        // Return dummy data since API is not present yet
        return [];
    }
);

export const assignShift = createAsyncThunk(
    "attendance/assignShift",
    async (data: any) => { return data; }
);

export const updateAssignment = createAsyncThunk(
    "attendance/updateAssignment",
    async (data: { id: number; dto: any }) => { return data.dto; }
);


// ── Slice ─────────────────────────────────────────────────────────────────────

export const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {
        clearMessages(state) {
            state.error = null;
            state.successMessage = null;
        },
        clearDetail(state) {
            state.selectedDetail = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // View All / Search
            .addCase(searchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload;
            })
            .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload;
            })
            
            // Detail
            .addCase(fetchAttendanceDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDetail = action.payload;
            })
            
            // My actions
            .addCase(fetchMyToday.fulfilled, (state, action) => {
                state.loading = false;
                state.myToday = action.payload;
            })
            .addCase(fetchMyHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.myHistory = action.payload;
            })
            
            // Adjustments -> Refresh record in list
            .addCase(manualAdjustAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = "Điều chỉnh chấm công thành công";
                const index = state.records.findIndex(r => r.attendanceId === action.payload.attendanceId);
                if (index !== -1) {
                    state.records[index] = action.payload;
                }
                if (state.selectedDetail && state.selectedDetail.attendance.attendanceId === action.payload.attendanceId) {
                    state.selectedDetail.attendance = action.payload;
                }
            })
            .addCase(manualCreateAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = "Tạo chấm công thành công";
                state.records.unshift(action.payload);
            })
            
            // Lock/Unlock
            .addCase(lockAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                const record = state.records.find(r => r.attendanceId === action.payload.attendanceId);
                if (record) record.isLocked = true;
                if (state.selectedDetail && state.selectedDetail.attendance.attendanceId === action.payload.attendanceId) {
                    state.selectedDetail.attendance.isLocked = true;
                }
            })
            .addCase(unlockAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                const record = state.records.find(r => r.attendanceId === action.payload.attendanceId);
                if (record) record.isLocked = false;
                if (state.selectedDetail && state.selectedDetail.attendance.attendanceId === action.payload.attendanceId) {
                    state.selectedDetail.attendance.isLocked = false;
                }
            })
            
            // Logs
            .addCase(fetchAttendanceLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload;
            })
            
            // Compatibility
            .addCase(fetchWeeklySchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.schedules = action.payload;
            })

            // Common State matchers (only handles the common async actions, specific thunks have logic above)
            .addMatcher(isPending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addMatcher(isRejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled') && 
                            // Exclude those that are specifically handled to prevent double overriding loading/msg unnecessarily
                            !action.type.includes('manualAdjust') &&
                            !action.type.includes('manualCreate') && 
                            !action.type.includes('lock') &&
                            !action.type.includes('unlock'),
                (state, action: PayloadAction<any>) => {
                    state.loading = false;
                    // For checkin/checkout success
                    if (action.type.includes("checkIn") || action.type.includes("checkOut")) {
                        state.successMessage = "Thành công!";
                        state.myToday = {
                            ...state.myToday,
                            attendance: action.payload as AttendanceResponseDto,
                            logs: state.myToday?.logs || [] // In real scenario, would re-fetch myToday
                        };
                    }
                }
            );
    },
});

export const { clearMessages, clearDetail } = attendanceSlice.actions;

export const selectRecords = (state: RootState) => state.attendance.records;
export const selectSelectedDetail = (state: RootState) => state.attendance.selectedDetail;
export const selectLogs = (state: RootState) => state.attendance.logs;
export const selectMyToday = (state: RootState) => state.attendance.myToday;
export const selectMyHistory = (state: RootState) => state.attendance.myHistory;
export const selectAttendanceLoading = (state: RootState) => state.attendance.loading;
export const selectAttendanceError = (state: RootState) => state.attendance.error;
export const selectAttendanceSuccess = (state: RootState) => state.attendance.successMessage;

// Legacy support
export const selectSchedules = (state: RootState) => state.attendance.schedules;
export const selectAdminAttendance = (state: RootState) => state.attendance.records; 
export const fetchAdminAttendance = searchAttendance;

export default attendanceSlice.reducer;
