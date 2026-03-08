import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface IEmployeeList {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    email: string;
    phone: string | null;
    gender: string | null;
    employmentStatus: string;
    departmentName: string;
    positionName: string;
}

export interface IEmployeeDetail {
    employeeId: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    departmentId: number | null;
    departmentName: string | null;
    positionId: number | null;
    positionName: string | null;
    managerId: number | null;
    managerName: string | null;
    joinDate: string;
    resignationDate: string | null;
    employmentStatus: string;
    employmentType: string;
    baseSalary: number | null;
}

interface IEmployeeState {
    employees: IEmployeeList[];
    selectedEmployee: IEmployeeDetail | null;
    loading: boolean;
    error: string | null;
}

const initialState: IEmployeeState = {
    employees: [],
    selectedEmployee: null,
    loading: false,
    error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

// GET /api/Employee
export const fetchAllEmployees = createAsyncThunk(
    "employee/fetchAll",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Employee",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// GET /api/Employee/{id}
export const fetchEmployeeById = createAsyncThunk(
    "employee/fetchById",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Employee/${id}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// POST /api/Employee
export const createEmployee = createAsyncThunk(
    "employee/create",
    async (data: any, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/Employee",
                method: "POST",
                data,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// PUT /api/Employee/{id}
export const updateEmployee = createAsyncThunk(
    "employee/update",
    async ({ id, data }: { id: number; data: any }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: `/Employee/${id}`,
                method: "PUT",
                data,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// PATCH /api/Employee/{id}/status
export const updateEmployeeStatus = createAsyncThunk(
    "employee/updateStatus",
    async (
        { id, status, disabledBy }: { id: number; status: string; disabledBy?: number },
        { rejectWithValue, getState }
    ) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const params: any = { status };
            if (disabledBy !== undefined) params.disabledBy = disabledBy;
            await request({
                url: `/Employee/${id}/status`,
                method: "PATCH",
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            return { id, status };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const employeeSlice = createSlice({
    name: "employee",
    initialState,
    reducers: {
        clearSelectedEmployee(state) {
            state.selectedEmployee = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAllEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(fetchAllEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch By Id
            .addCase(fetchEmployeeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedEmployee = action.payload;
            })
            .addCase(fetchEmployeeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEmployee.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployee.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Status
            .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
                const emp = state.employees.find(
                    (e) => e.employeeId === action.payload.id
                );
                if (emp) {
                    emp.employmentStatus = action.payload.status;
                }
            });
    },
});

export const { clearSelectedEmployee } = employeeSlice.actions;

export const selectEmployees = (state: RootState) => state.employee.employees;
export const selectSelectedEmployee = (state: RootState) => state.employee.selectedEmployee;
export const selectEmployeeLoading = (state: RootState) => state.employee.loading;
export const selectEmployeeError = (state: RootState) => state.employee.error;

export default employeeSlice.reducer;
