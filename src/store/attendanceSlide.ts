import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, type PayloadAction } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface IShiftAssignment {
    assignmentId: number;
    employeeId: number;
    employeeName: string;
    shiftId: number;
    shiftName: string;
    startDate: string;
    endDate: string | null;
    status: string;
}

export interface ICreateShiftAssignment {
    employeeId: number;
    shiftId: number;
    startDate: string;
    endDate: string | null;
}

export interface IUpdateShiftAssignment {
    shiftId: number;
    startDate: string;
    endDate: string | null;
}

export interface IShiftSchedule {
    date: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    status: string;
}

export interface IAttendanceHistory {
    date: string;
    shiftName: string;
    checkIn: string | null;
    checkOut: string | null;
    totalHours: number | null;
    status: string;
}

export interface IAdminAttendance {
    attendanceId: number;
    employeeCode: string;
    fullName: string;
    departmentName: string;
    date: string;
    shiftName: string;
    checkIn: string | null;
    checkOut: string | null;
    status: string;
    lateMinutes: number | null;
}

export interface IAttendanceImportResult {
    totalRows: number;
    successCount: number;
    errors: string[];
    message: string;
}

export interface IAttendanceResponse {
    attendanceId: number;
    attendanceDate: string;
    checkInTime: string | null;
    status: string;
    lateMinutes: number | null;
    message: string;
}

export interface ICheckInRequest {
    employeeId: number;
    location: string | null;
    remarks: string | null;
}

interface IAttendanceState {
    schedules: IShiftSchedule[];
    history: IAttendanceHistory[];
    adminAttendance: IAdminAttendance[];
    importResult: IAttendanceImportResult | null;
    loading: boolean;
    error: string | null;
    lastResponse: any | null;
}

const initialState: IAttendanceState = {
    schedules: [],
    history: [],
    adminAttendance: [],
    importResult: null,
    loading: false,
    error: null,
    lastResponse: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const assignShift = createAsyncThunk(
    "attendance/assignShift",
    async (dto: ICreateShiftAssignment, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/assign-shift",
                method: "POST",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const updateAssignment = createAsyncThunk(
    "attendance/updateAssignment",
    async ({ id, dto }: { id: number; dto: IUpdateShiftAssignment }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Attendance/assignment/${id}`,
                method: "PUT",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchWeeklySchedule = createAsyncThunk(
    "attendance/fetchWeeklySchedule",
    async (employeeId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Attendance/schedule/${employeeId}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchAttendanceHistory = createAsyncThunk(
    "attendance/fetchHistory",
    async (employeeId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Attendance/history/${employeeId}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const fetchAdminAttendance = createAsyncThunk(
    "attendance/fetchAdminView",
    async (params: { date?: string; deptId?: number; status?: string }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Attendance/admin-view",
                method: "GET",
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const importMachineData = createAsyncThunk(
    "attendance/importData",
    async (file: File, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const formData = new FormData();
            formData.append("file", file);
            const response = await request({
                url: "/Attendance/import",
                method: "POST",
                data: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const checkIn = createAsyncThunk(
    "attendance/checkIn",
    async (dto: ICheckInRequest, { rejectWithValue, getState }) => {
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
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const checkOut = createAsyncThunk(
    "attendance/checkOut",
    async (employeeId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Attendance/check-out/${employeeId}`,
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {
        clearLastResponse(state) { state.lastResponse = null; },
        clearError(state) { state.error = null; },
        clearImportResult(state) { state.importResult = null; }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Weekly Schedule
            .addCase(fetchWeeklySchedule.fulfilled, (state, action) => {
                state.loading = false;
                state.schedules = action.payload;
            })
            // Fetch Attendance History
            .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            // Fetch Admin View
            .addCase(fetchAdminAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.adminAttendance = action.payload;
            })
            // Import Data
            .addCase(importMachineData.fulfilled, (state, action) => {
                state.loading = false;
                state.importResult = action.payload;
                state.lastResponse = action.payload;
            })
            // Common Pending/Rejected matchers
            .addMatcher(isPending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addMatcher(isFulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                if (action.type.includes("checkIn") ||
                    action.type.includes("checkOut") ||
                    action.type.includes("assignShift") ||
                    action.type.includes("updateAssignment")) {
                    state.lastResponse = action.payload;
                }
            })
            .addMatcher(isRejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearLastResponse, clearError, clearImportResult } = attendanceSlice.actions;

export const selectSchedules = (state: RootState) => state.attendance.schedules;
export const selectHistory = (state: RootState) => state.attendance.history;
export const selectAdminAttendance = (state: RootState) => state.attendance.adminAttendance;
export const selectImportResult = (state: RootState) => state.attendance.importResult;
export const selectAttendanceLoading = (state: RootState) => state.attendance.loading;
export const selectAttendanceError = (state: RootState) => state.attendance.error;
export const selectLastResponse = (state: RootState) => state.attendance.lastResponse;

export default attendanceSlice.reducer;
