import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IUser {
    userId: number;
    username: string;
    email: string;
    isActive: boolean;
    roles: string[];
}

interface IUserState {
    users: IUser[];
    loading: boolean;
    error: string | null;
}

const initialState: IUserState = {
    users: [],
    loading: false,
    error: null,
};

// GET: /api/User
export const fetchAllUsers = createAsyncThunk(
    "user/fetchAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/User",
                method: "GET",
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// POST: /api/User
export const createUser = createAsyncThunk(
    "user/createUser",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/User",
                method: "POST",
                data,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// PUT: /api/User/{id}
export const updateUser = createAsyncThunk(
    "user/updateUser",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/User/${id}`,
                method: "PUT",
                data,
            });
            return { id, data, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// PATCH: /api/User/{id}/activate
export const activateUser = createAsyncThunk(
    "user/activateUser",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/User/${id}/activate`,
                method: "PATCH",
            });
            return { id, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// PATCH: /api/User/{id}/deactivate
export const deactivateUser = createAsyncThunk(
    "user/deactivateUser",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/User/${id}/deactivate`,
                method: "PATCH",
            });
            return { id, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All Users
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create User
            .addCase(createUser.fulfilled, () => {
                // Handle success in component
            })
            // Update User
            .addCase(updateUser.fulfilled, () => {
                // Handle success/refetch in component
            })
            // Activate User
            .addCase(activateUser.fulfilled, (state, action) => {
                const user = state.users.find((u) => u.userId === action.payload.id);
                if (user) {
                    user.isActive = true;
                }
            })
            // Deactivate User
            .addCase(deactivateUser.fulfilled, (state, action) => {
                const user = state.users.find((u) => u.userId === action.payload.id);
                if (user) {
                    user.isActive = false;
                }
            });
    },
});

export const selectUsers = (state: RootState) => state.user.users;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;

export default userSlice.reducer;
