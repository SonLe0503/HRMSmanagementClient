import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IWorkflowStage {
    stageId: number;
    workflowId: number;
    stageOrder: number;
    stageName: string;
    approvalType: string;
    timeoutHours: number | null;
    isAutoApprove: boolean;
    createdDate: string;
    workflowStageApprovers?: any[];
}

export interface ICreateWorkflowStageDTO {
    WorkflowId: number;
    StageOrder: number;
    StageName: string;
    ApprovalType: string;
    TimeoutHours?: number | null;
    IsAutoApprove: boolean;
}

export interface IUpdateWorkflowStageDTO {
    StageOrder: number;
    StageName: string;
    ApprovalType: string;
    TimeoutHours?: number | null;
    IsAutoApprove: boolean;
}

interface IWorkflowStageState {
    stages: IWorkflowStage[];
    loading: boolean;
    error: string | null;
}

const initialState: IWorkflowStageState = {
    stages: [],
    loading: false,
    error: null,
};

// API calls using request utility
export const fetchStagesByWorkflow = createAsyncThunk(
    "workflowStage/fetchStagesByWorkflow",
    async (workflowId: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/WorkflowStage/workflow/${workflowId}`,
                method: "GET"
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch stages");
        }
    }
);

export const fetchStageById = createAsyncThunk(
    "workflowStage/fetchStageById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/WorkflowStage/${id}`,
                method: "GET"
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch stage details");
        }
    }
);

export const createStage = createAsyncThunk(
    "workflowStage/createStage",
    async (data: ICreateWorkflowStageDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/WorkflowStage",
                method: "POST",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to create stage");
        }
    }
);

export const updateStage = createAsyncThunk(
    "workflowStage/updateStage",
    async ({ id, data }: { id: number; data: IUpdateWorkflowStageDTO }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/WorkflowStage/${id}`,
                method: "PUT",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to update stage");
        }
    }
);

export const deleteStage = createAsyncThunk(
    "workflowStage/deleteStage",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/WorkflowStage/${id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to delete stage");
        }
    }
);

const workflowStageSlice = createSlice({
    name: "workflowStage",
    initialState,
    reducers: {
        clearStages: (state) => {
            state.stages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStagesByWorkflow.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStagesByWorkflow.fulfilled, (state, action) => {
                state.loading = false;
                state.stages = action.payload;
            })
            .addCase(fetchStagesByWorkflow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createStage.pending, (state) => {
                state.loading = true;
            })
            .addCase(createStage.fulfilled, (state, action) => {
                state.loading = false;
                state.stages.push(action.payload);
                state.stages.sort((a, b) => a.stageOrder - b.stageOrder);
            })
            .addCase(createStage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateStage.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStage.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.stages.findIndex(s => s.stageId === action.payload.stageId);
                if (index !== -1) {
                    state.stages[index] = action.payload;
                    state.stages.sort((a, b) => a.stageOrder - b.stageOrder);
                }
            })
            .addCase(updateStage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteStage.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteStage.fulfilled, (state, action) => {
                state.loading = false;
                state.stages = state.stages.filter(s => s.stageId !== action.payload);
            })
            .addCase(deleteStage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearStages } = workflowStageSlice.actions;
export const selectStages = (state: RootState) => state.workflowStage.stages;
export const selectStageLoading = (state: RootState) => state.workflowStage.loading;

export default workflowStageSlice.reducer;
