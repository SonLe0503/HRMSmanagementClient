import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IWorkflow {
    workflowId: number;
    workflowName: string;
    workflowType: string;
    description: string | null;
    isActive: boolean;
    effectiveDate: string | null;
    createdDate: string;
    createdBy: number | null;
    modifiedDate: string | null;
    modifiedBy: number | null;
    workflowStages?: any[];
}

export interface ICreateWorkflowDTO {
    WorkflowName: string;
    WorkflowType: string;
    Description?: string | null;
    EffectiveDate?: string | null;
    IsActive: boolean;
}

export interface IUpdateWorkflowDTO {
    WorkflowName: string;
    WorkflowType: string;
    Description?: string | null;
    EffectiveDate?: string | null;
    IsActive: boolean;
}

interface IWorkflowState {
    workflows: IWorkflow[];
    loading: boolean;
    error: string | null;
}

const initialState: IWorkflowState = {
    workflows: [],
    loading: false,
    error: null,
};

// API calls using request utility
export const fetchAllWorkflows = createAsyncThunk(
    "workflow/fetchAllWorkflows",
    async (_, { rejectWithValue }) => {
        try {
            const response = await request({
                url: "/Workflow",
                method: "GET"
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch workflows");
        }
    }
);

export const fetchWorkflowById = createAsyncThunk(
    "workflow/fetchWorkflowById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/Workflow/${id}`,
                method: "GET"
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch workflow details");
        }
    }
);

export const createWorkflow = createAsyncThunk(
    "workflow/createWorkflow",
    async (data: ICreateWorkflowDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            // Remove null/undefined to avoid potential .NET DateOnly parsing issues for optional fields
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v != null)
            );

            const response = await request({
                url: "/Workflow",
                method: "POST",
                data: cleanData,
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                } : {},
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to create workflow");
        }
    }
);

export const updateWorkflow = createAsyncThunk(
    "workflow/updateWorkflow",
    async ({ id, data }: { id: number; data: IUpdateWorkflowDTO }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Workflow/${id}`,
                method: "PUT",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to update workflow");
        }
    }
);

export const deleteWorkflow = createAsyncThunk(
    "workflow/deleteWorkflow",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/Workflow/${id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to deactivate workflow");
        }
    }
);

// Toggle status is mapped to soft delete (isActive = false) in backend via Delete method
export const deactivateWorkflow = deleteWorkflow;

const workflowSlice = createSlice({
    name: "workflow",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllWorkflows.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllWorkflows.fulfilled, (state, action) => {
                state.loading = false;
                state.workflows = action.payload;
            })
            .addCase(fetchAllWorkflows.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createWorkflow.pending, (state) => {
                state.loading = true;
            })
            .addCase(createWorkflow.fulfilled, (state, action) => {
                state.loading = false;
                state.workflows.unshift(action.payload);
            })
            .addCase(createWorkflow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateWorkflow.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateWorkflow.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.workflows.findIndex(w => w.workflowId === action.payload.workflowId);
                if (index !== -1) {
                    state.workflows[index] = action.payload;
                }
            })
            .addCase(updateWorkflow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete (Deactivate)
            .addCase(deleteWorkflow.fulfilled, (state, action) => {
                state.loading = false;
                const workflow = state.workflows.find(w => w.workflowId === action.payload);
                if (workflow) {
                    workflow.isActive = false;
                }
            });
    },
});

export const selectWorkflows = (state: RootState) => state.workflow.workflows;
export const selectWorkflowLoading = (state: RootState) => state.workflow.loading;

export default workflowSlice.reducer;
