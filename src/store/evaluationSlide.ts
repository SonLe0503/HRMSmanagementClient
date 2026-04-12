import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface EvaluatorAssignmentDto {
  employeeId: number;
  templateId: number;
  primaryEvaluatorId: number;
  secondaryEvaluatorId?: number;
  notes?: string;
}

export interface AssignEvaluatorsDto {
  cycleId: number;
  assignments: EvaluatorAssignmentDto[];
}

export interface AutoAssignEvaluatorsDto {
  cycleId: number;
  templateId: number;
  includeSecondaryEvaluator: boolean;
  departmentId?: number;
}

export interface BulkAssignByDepartmentDto {
  cycleId: number;
  departmentId: number;
  templateId: number;
  primaryEvaluatorId: number;
  secondaryEvaluatorId?: number;
}

export interface EvaluationResponseDto {
  evaluationId: number;
  cycleId: number;
  cycleName: string;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  employeeDepartment: string;
  employeePosition: string;
  templateId: number;
  templateName: string;
  primaryEvaluatorId?: number;
  primaryEvaluatorName?: string;
  secondaryEvaluatorId?: number;
  secondaryEvaluatorName?: string;
  status: string;
  overallRating?: number;
  submittedDate?: string;
  acknowledgedDate?: string;
}

export interface EvaluationListDto {
  evaluationId: number;
  employeeId: number;
  employeeName: string;
  employeeDepartment: string;
  primaryEvaluatorName: string;
  status: string;
}

export interface AssignmentPreviewDto {
  employeeId: number;
  employeeName: string;
  department: string;
  suggestedPrimaryEvaluatorId?: number;
  suggestedPrimaryEvaluatorName?: string;
  suggestedSecondaryEvaluatorId?: number;
  suggestedSecondaryEvaluatorName?: string;
  hasDirectManager: boolean;
  issue?: string;
}

export interface AssignmentResultDto {
  successCount: number;
  failedCount: number;
  successfulAssignments: EvaluationResponseDto[];
  errors: AssignmentErrorDto[];
}

export interface AssignmentErrorDto {
  employeeId: number;
  employeeName: string;
  errorMessage: string;
}

export interface ChangeEvaluatorDto {
  primaryEvaluatorId?: number;
  secondaryEvaluatorId?: number;
  reason?: string;
}

interface IEvaluationState {
  evaluations: EvaluationListDto[];
  selectedEvaluation: EvaluationResponseDto | null;
  assignmentPreview: AssignmentPreviewDto[];
  assignmentResult: AssignmentResultDto | null;
  loading: boolean;
  error: any | null;
}

const initialState: IEvaluationState = {
  evaluations: [],
  selectedEvaluation: null,
  assignmentPreview: [],
  assignmentResult: null,
  loading: false,
  error: null,
};

export const fetchEvaluationsByCycle = createAsyncThunk(
  "evaluation/fetchByCycle",
  async (cycleId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluations/cycle/${cycleId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchEvaluationsByEmployee = createAsyncThunk(
  "evaluation/fetchByEmployee",
  async (employeeId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluations/employee/${employeeId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchEvaluationsByEvaluator = createAsyncThunk(
  "evaluation/fetchByEvaluator",
  async (evaluatorId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluations/evaluator/${evaluatorId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchEvaluationById = createAsyncThunk(
  "evaluation/fetchById",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluations/${id}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchAssignmentPreview = createAsyncThunk(
  "evaluation/fetchPreview",
  async (cycleId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluations/cycle/${cycleId}/preview`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const assignEvaluators = createAsyncThunk(
  "evaluation/assign",
  async (dto: AssignEvaluatorsDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluations/assign",
        method: "POST",
        data: dto,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const autoAssignEvaluators = createAsyncThunk(
  "evaluation/autoAssign",
  async (dto: AutoAssignEvaluatorsDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluations/auto-assign",
        method: "POST",
        data: dto,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const bulkAssignByDepartment = createAsyncThunk(
  "evaluation/bulkAssign",
  async (dto: BulkAssignByDepartmentDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluations/bulk-assign-department",
        method: "POST",
        data: dto,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const changeEvaluator = createAsyncThunk(
  "evaluation/changeEvaluator",
  async ({ id, dto }: { id: number; dto: ChangeEvaluatorDto }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluations/${id}/evaluator`,
        method: "PATCH",
        data: dto,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const evaluationSlice = createSlice({
  name: "evaluation",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedEvaluation(state) {
      state.selectedEvaluation = null;
    },
    clearAssignmentResult(state) {
      state.assignmentResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvaluationsByCycle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvaluationsByCycle.fulfilled, (state, action) => {
        state.loading = false;
        state.evaluations = action.payload;
      })
      .addCase(fetchEvaluationsByCycle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEvaluationsByEmployee.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvaluationsByEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.evaluations = action.payload;
      })
      .addCase(fetchEvaluationsByEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEvaluationsByEvaluator.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEvaluationsByEvaluator.fulfilled, (state, action) => {
        state.loading = false;
        state.evaluations = action.payload;
      })
      .addCase(fetchEvaluationsByEvaluator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEvaluationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvaluation = action.payload;
      })
      .addCase(fetchAssignmentPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.assignmentPreview = action.payload;
      })
      .addCase(assignEvaluators.fulfilled, (state, action) => {
        state.loading = false;
        state.assignmentResult = action.payload;
        // Optionally update list if matching cycle
      })
      .addCase(autoAssignEvaluators.fulfilled, (state, action) => {
        state.loading = false;
        state.assignmentResult = action.payload;
      })
      .addCase(bulkAssignByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignmentResult = action.payload;
      })
      .addCase(changeEvaluator.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedEvaluation?.evaluationId === action.payload.evaluationId) {
          state.selectedEvaluation = action.payload;
        }
        const index = state.evaluations.findIndex(e => e.evaluationId === action.payload.evaluationId);
        if (index !== -1) {
          state.evaluations[index].primaryEvaluatorName = action.payload.primaryEvaluatorName;
        }
      });
  },
});

export const { clearError, clearSelectedEvaluation, clearAssignmentResult } = evaluationSlice.actions;

export const selectEvaluations = (state: RootState) => state.evaluation.evaluations;
export const selectSelectedEvaluation = (state: RootState) => state.evaluation.selectedEvaluation;
export const selectAssignmentPreview = (state: RootState) => state.evaluation.assignmentPreview;
export const selectAssignmentResult = (state: RootState) => state.evaluation.assignmentResult;
export const selectEvaluationLoading = (state: RootState) => state.evaluation.loading;
export const selectEvaluationError = (state: RootState) => state.evaluation.error;

export default evaluationSlice.reducer;
