import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IWorkflowStageApprover {
    id: number;
    stageId: number;
    approverType: number;
    roleId: number | null;
    userId: number | null;
    isDynamic: boolean;
    dynamicRule: string | null;
    role?: any;
    user?: any;
}

export interface ICreateWorkflowStageApproverDTO {
    StageId: number;
    ApproverType: number;
    RoleId?: number | null;
    UserId?: number | null;
    DynamicRule?: string | null;
    IsDynamic?: boolean;
}

export interface IUpdateWorkflowStageApproverDTO {
    ApproverType: number;
    RoleId?: number | null;
    UserId?: number | null;
    DynamicRule?: string | null;
}

interface IStageApproveState {
    approvers: IWorkflowStageApprover[];
    loading: boolean;
    error: string | null;
}

const initialState: IStageApproveState = {
    approvers: [],
    loading: false,
    error: null,
};

// API calls using request utility
export const fetchApproversByStage = createAsyncThunk(
    "stageApprove/fetchApproversByStage",
    async (stageId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/WorkflowStageApprove/stage/${stageId}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch approvers");
        }
    }
);

export const createApprover = createAsyncThunk(
    "stageApprove/createApprover",
    async (data: ICreateWorkflowStageApproverDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/WorkflowStageApprove",
                method: "POST",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to create approver");
        }
    }
);

export const updateApprover = createAsyncThunk(
    "stageApprove/updateApprover",
    async ({ id, data }: { id: number; data: IUpdateWorkflowStageApproverDTO }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/WorkflowStageApprove/${id}`,
                method: "PUT",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to update approver");
        }
    }
);

export const deleteApprover = createAsyncThunk(
    "stageApprove/deleteApprover",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/WorkflowStageApprove/${id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to delete approver");
        }
    }
);

const stageApproveSlice = createSlice({
    name: "stageApprove",
    initialState,
    reducers: {
        clearApprovers: (state) => {
            state.approvers = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchApproversByStage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApproversByStage.fulfilled, (state, action) => {
                state.loading = false;
                state.approvers = action.payload;
            })
            .addCase(fetchApproversByStage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createApprover.pending, (state) => {
                state.loading = true;
            })
            .addCase(createApprover.fulfilled, (state, action) => {
                state.loading = false;
                state.approvers.push(action.payload);
            })
            .addCase(createApprover.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateApprover.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateApprover.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.approvers.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.approvers[index] = action.payload;
                }
            })
            .addCase(updateApprover.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteApprover.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteApprover.fulfilled, (state, action) => {
                state.loading = false;
                state.approvers = state.approvers.filter(a => a.id !== action.payload);
            })
            .addCase(deleteApprover.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearApprovers } = stageApproveSlice.actions;
export const selectApprovers = (state: RootState) => state.stageApprove.approvers;
export const selectStageApproveLoading = (state: RootState) => state.stageApprove.loading;

export default stageApproveSlice.reducer;
