import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface CriterionRatingDto {
  criteriaId: number;
  selfRating?: number;
  selfComments?: string;
  managerRating?: number;
  managerComments?: string;
  evidence?: string;
}

export interface SubmitSelfEvaluationDto {
  evaluationId: number;
  ratings: CriterionRatingDto[];
}

export interface SubmitManagerEvaluationDto {
  evaluationId: number;
  overallRating: number;
  ratings: CriterionRatingDto[];
}

export interface SaveEvaluationDraftDto {
  evaluationId: number;
  ratings: CriterionRatingDto[];
}

export interface PendingEvaluationDto {
  evaluationId: number;
  employeeId: number;
  employeeName: string;
  employeeDepartment: string;
  employeePosition: string;
  status: string;
  deadline: string;
  selfEvaluationCompleted: boolean;
}

export interface EvaluationRatingResponseDto {
    ratingId: number;
    evaluationId: number;
    criteriaId: number;
    criteriaName: string;
    criteriaCategory: string;
    weightage: number;
    selfRating?: number;
    selfComments?: string;
    managerRating?: number;
    managerComments?: string;
    evidence?: string;
}

export interface EvaluationDetailDto {
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
    acknowledgementComments?: string;
    ratings: EvaluationRatingResponseDto[];
}


interface ISubmitEvaluationState {
  pendingEvaluations: PendingEvaluationDto[];
  evaluationDetail: EvaluationDetailDto | null;
  loading: boolean;
  error: any | null;
}

const initialState: ISubmitEvaluationState = {
  pendingEvaluations: [],
  evaluationDetail: null,
  loading: false,
  error: null,
};

export const fetchPendingEvaluations = createAsyncThunk(
  "submitEvaluation/fetchPending",
  async (evaluatorId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/submitevaluation/pending/${evaluatorId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchEvaluationDetail = createAsyncThunk(
  "submitEvaluation/fetchDetail",
  async (evaluationId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/submitevaluation/${evaluationId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const submitSelfEvaluation = createAsyncThunk(
  "submitEvaluation/submitSelf",
  async (dto: SubmitSelfEvaluationDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/submitevaluation/self",
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

export const submitManagerEvaluation = createAsyncThunk(
  "submitEvaluation/submitManager",
  async (dto: SubmitManagerEvaluationDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/submitevaluation/manager",
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

export const saveEvaluationDraft = createAsyncThunk(
  "submitEvaluation/saveDraft",
  async (dto: SaveEvaluationDraftDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/submitevaluation/draft",
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

export const submitEvaluationSlice = createSlice({
  name: "submitEvaluation",
  initialState,
  reducers: {
    clearEvaluationDetail(state) {
      state.evaluationDetail = null;
    },
    clearSubmitError(state) {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingEvaluations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingEvaluations.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingEvaluations = action.payload;
      })
      .addCase(fetchPendingEvaluations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEvaluationDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvaluationDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.evaluationDetail = action.payload;
      })
      .addCase(fetchEvaluationDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEvaluationDetail, clearSubmitError } = submitEvaluationSlice.actions;

export const selectPendingEvaluations = (state: RootState) => state.submitEvaluation.pendingEvaluations;
export const selectEvaluationDetail = (state: RootState) => state.submitEvaluation.evaluationDetail;
export const selectSubmitEvaluationLoading = (state: RootState) => state.submitEvaluation.loading;
export const selectSubmitEvaluationError = (state: RootState) => state.submitEvaluation.error;

export default submitEvaluationSlice.reducer;
