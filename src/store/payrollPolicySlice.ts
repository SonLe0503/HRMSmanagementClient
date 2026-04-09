import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IPayrollPolicy {
    policyId: number;
    policyName: string;
    policyType: string;
    description: string | null;
    isActive: boolean;
    effectiveStartDate: string;
    effectiveEndDate: string | null;
    applicableEmployeeGroup: string;
    baseAmount: number;
}

export interface IPayrollPolicyFilter {
    policyType?: string;
    status?: boolean;
    employeeGroup?: string;
}

export interface ICreatePayrollPolicyDTO {
    PolicyName: string;
    PolicyType: string;
    Description?: string | null;
    EffectiveStartDate: string;
    EffectiveEndDate?: string | null;
    ApplicableEmployeeGroup?: string | null;
    CalculationFormula?: string | null;
}

interface IPayrollPolicyState {
    policies: IPayrollPolicy[];
    currentPolicy: IPayrollPolicy | null;
    loading: boolean;
    error: string | null;
}

const initialState: IPayrollPolicyState = {
    policies: [],
    currentPolicy: null,
    loading: false,
    error: null,
};

// API calls
export const fetchAllPayrollPolicies = createAsyncThunk(
    "payrollPolicy/fetchAllPayrollPolicies",
    async (filters: IPayrollPolicyFilter | undefined, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (filters) {
                if (filters.policyType) params.append("policyType", filters.policyType);
                if (filters.status !== undefined) params.append("status", filters.status.toString());
                if (filters.employeeGroup) params.append("employeeGroup", filters.employeeGroup);
            }

            const response = await request({
                url: `/PayrollPolicies?${params.toString()}`,
                method: "GET"
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch payroll policies");
        }
    }
);

export const fetchPayrollPolicyById = createAsyncThunk(
    "payrollPolicy/fetchPayrollPolicyById",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `/PayrollPolicies/${id}`,
                method: "GET"
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch payroll policy details");
        }
    }
);

export const createPayrollPolicy = createAsyncThunk(
    "payrollPolicy/createPayrollPolicy",
    async (data: ICreatePayrollPolicyDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/PayrollPolicies",
                method: "POST",
                data,
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                } : {},
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to create payroll policy");
        }
    }
);

const payrollPolicySlice = createSlice({
    name: "payrollPolicy",
    initialState,
    reducers: {
        clearCurrentPolicy: (state) => {
            state.currentPolicy = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAllPayrollPolicies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPayrollPolicies.fulfilled, (state, action) => {
                state.loading = false;
                state.policies = action.payload;
            })
            .addCase(fetchAllPayrollPolicies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch By Id
            .addCase(fetchPayrollPolicyById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayrollPolicyById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPolicy = action.payload;
            })
            .addCase(fetchPayrollPolicyById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createPayrollPolicy.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPayrollPolicy.fulfilled, (state) => {
                state.loading = false;
                // Note: action.payload from backend is { MessageCode, Message, PolicyId }
                // We typically need to fetch all again or let the UI handle success
            })
            .addCase(createPayrollPolicy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentPolicy } = payrollPolicySlice.actions;

export const selectPayrollPolicies = (state: RootState) => state.payrollPolicy.policies;
export const selectCurrentPayrollPolicy = (state: RootState) => state.payrollPolicy.currentPolicy;
export const selectPayrollPolicyLoading = (state: RootState) => state.payrollPolicy.loading;

export default payrollPolicySlice.reducer;
