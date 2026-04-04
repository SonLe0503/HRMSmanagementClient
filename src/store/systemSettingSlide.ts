import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";

interface LocationSettings {
    officeLatitude: number;
    officeLongitude: number;
    attendanceAllowedRadius: number;
}

interface SystemSettingState {
    locationSettings: LocationSettings | null;
    loading: boolean;
    error: string | null;
}

const initialState: SystemSettingState = {
    locationSettings: null,
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
            });
    },
});

export const selectLocationSettings = (state: any) => state.systemSetting.locationSettings;
export const selectSystemSettingLoading = (state: any) => state.systemSetting.loading;

export default systemSettingSlice.reducer;
