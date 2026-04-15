import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";

interface LocationSettings {
    officeLatitude: number;
    officeLongitude: number;
    attendanceAllowedRadius: number;
}

interface ApprovalSettings {
    topLevelFallbackUserId: number | null;
    defaultFallbackUserId: number | null;
}

interface PayrollSettings {
    payrollCutOffDay: number;
}

interface SystemSettingState {
    locationSettings: LocationSettings | null;
    approvalSettings: ApprovalSettings | null;
    payrollSettings: PayrollSettings | null;
    loading: boolean;
    error: string | null;
}

const initialState: SystemSettingState = {
    locationSettings: null,
    approvalSettings: null,
    payrollSettings: null,
    loading: false,
    error: null,
};

export const fetchLocationSettings = createAsyncThunk(
    "systemSetting/fetchLocationSettings",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/SystemSettings/location",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy cấu hình vị trí");
        }
    }
);

export const updateLocationSettings = createAsyncThunk(
    "systemSetting/updateLocationSettings",
    async (dto: LocationSettings, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/SystemSettings/location",
                method: "PUT",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật cấu hình vị trí");
        }
    }
);

export const fetchApprovalSettings = createAsyncThunk(
    "systemSetting/fetchApprovalSettings",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/SystemSettings/approval",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy cấu hình phê duyệt");
        }
    }
);

export const fetchPayrollSettings = createAsyncThunk(
    "systemSetting/fetchPayrollSettings",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/SystemSettings/payroll",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy cấu hình kỳ lương");
        }
    }
);

export const updatePayrollSettings = createAsyncThunk(
    "systemSetting/updatePayrollSettings",
    async (dto: PayrollSettings, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/SystemSettings/payroll",
                method: "PUT",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật cấu hình kỳ lương");
        }
    }
);

export const updateApprovalSettings = createAsyncThunk(
    "systemSetting/updateApprovalSettings",
    async (dto: ApprovalSettings, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/SystemSettings/approval",
                method: "PUT",
                data: dto,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi cập nhật cấu hình phê duyệt");
        }
    }
);

const systemSettingSlice = createSlice({
    name: "systemSetting",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocationSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLocationSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.locationSettings = action.payload;
            })
            .addCase(fetchLocationSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateLocationSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateLocationSettings.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateLocationSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchApprovalSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchApprovalSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.approvalSettings = action.payload;
            })
            .addCase(fetchApprovalSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateApprovalSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateApprovalSettings.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateApprovalSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPayrollSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPayrollSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.payrollSettings = action.payload;
            })
            .addCase(fetchPayrollSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updatePayrollSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePayrollSettings.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updatePayrollSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectLocationSettings = (state: any) => state.systemSetting.locationSettings;
export const selectApprovalSettings = (state: any) => state.systemSetting.approvalSettings;
export const selectPayrollSettings = (state: any) => state.systemSetting.payrollSettings;
export const selectSystemSettingLoading = (state: any) => state.systemSetting.loading;

export default systemSettingSlice.reducer;
