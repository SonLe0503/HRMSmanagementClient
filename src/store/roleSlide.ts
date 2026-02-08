import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IRole {
    roleId: number;
    roleName: string;
    description?: string;
    isActive: boolean;
}

interface IRoleState {
    roles: IRole[];
    loading: boolean;
    error: string | null;
}

const initialState: IRoleState = {
    roles: [],
    loading: false,
    error: null,
};

// GET: /api/Role
export const fetchAllRoles = createAsyncThunk(
    "role/fetchAllRoles",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Role",
                method: "GET",
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// POST: /api/Role
export const createRole = createAsyncThunk(
    "role/createRole",
    async (data: { roleName: string; description?: string }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Role",
                method: "POST",
                data,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// PATCH: /api/Role/{id}/status?isActive=...
export const changeRoleStatus = createAsyncThunk(
    "role/changeRoleStatus",
    async ({ id, isActive }: { id: number; isActive: boolean }, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Role/${id}/status`,
                method: "PATCH",
                params: { isActive },
            });
            return { id, isActive, message: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

export const roleSlice = createSlice({
    name: "role",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All Roles
            .addCase(fetchAllRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload;
            })
            .addCase(fetchAllRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Role
            .addCase(createRole.fulfilled, () => {
                // Role created successfully
            })
            // Change Role Status
            .addCase(changeRoleStatus.fulfilled, (state, action) => {
                const { id, isActive } = action.payload;
                const role = state.roles.find((r) => r.roleId === id);
                if (role) {
                    role.isActive = isActive;
                }
            });
    },
});

export const selectRoles = (state: RootState) => state.role.roles;
export const selectRoleLoading = (state: RootState) => state.role.loading;
export const selectRoleError = (state: RootState) => state.role.error;

export default roleSlice.reducer;
