import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface EvaluationResultListDto {
  evaluationId: number;
  cycleName: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  completionDate?: string;
  overallRating?: number;
  status: string;
  isNew: boolean;
}

export interface CriteriaResultDto {
  criteriaId: number;
  criteriaName: string;
  criteriaCategory: string;
  description: string;
  weightage: number;
  selfRating?: number;
  selfComments?: string;
  managerRating?: number;
  managerComments?: string;
  evidence?: string;
  difference?: number;
}

export interface EvaluationFeedbackDto {
  keyStrengths: string;
  developmentAreas: string;
  trainingRecommendations: string;
  careerDevelopmentSuggestions: string;
  goalsForNextPeriod: string;
}

export interface ComparisonDataDto {
  previousOverallRating?: number;
  ratingChange?: number;
  performanceTrend: string;
}

export interface EvaluationResultDto {
  evaluationId: number;
  employeeId: number;
  cycleName: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  completionDate?: string;
  overallRating?: number;
  status: string;
  isNew: boolean;
  isAcknowledged: boolean;
  primaryEvaluatorName?: string;
  secondaryEvaluatorName?: string;
  criteriaResults: CriteriaResultDto[];
  managerFeedback: EvaluationFeedbackDto;
  comparison?: ComparisonDataDto;
  supportingDocuments: string[];
}

export interface EvaluationChartDataDto {
  criteriaLabels: string[];
  selfRatings: number[];
  managerRatings: number[];
  weightages: number[];
}

export interface PerformanceSummaryDto {
  currentOverallRating?: number;
  previousOverallRating?: number;
  change?: number;
  trendDirection?: string;
  totalEvaluations: number;
  averageRating?: number;
  highestRating?: number;
  lowestRating?: number;
  recentEvaluations: EvaluationResultListDto[];
}

export interface AcknowledgeEvaluationDto {
  evaluationId: number;
  acknowledgementComments?: string;
}

export interface RequestReviewDto {
  evaluationId: number;
  disagreementPoints: string;
  supportingEvidence: string;
  detailedExplanation: string;
}

interface IEvaluationResultState {
  availableResults: EvaluationResultListDto[];
  resultDetail: EvaluationResultDto | null;
  chartData: EvaluationChartDataDto | null;
  performanceSummary: PerformanceSummaryDto | null;
  loading: boolean;
  error: any | null;
}

const initialState: IEvaluationResultState = {
  availableResults: [],
  resultDetail: null,
  chartData: null,
  performanceSummary: null,
  loading: false,
  error: null,
};

export const fetchAvailableResults = createAsyncThunk(
  "evaluationResult/fetchAvailable",
  async (employeeId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationresult/employee/${employeeId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchEvaluationResultDetail = createAsyncThunk(
  "evaluationResult/fetchDetail",
  async (evaluationId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationresult/${evaluationId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchChartData = createAsyncThunk(
  "evaluationResult/fetchChart",
  async (evaluationId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationresult/${evaluationId}/chart`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchPerformanceSummary = createAsyncThunk(
  "evaluationResult/fetchSummary",
  async (employeeId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationresult/employee/${employeeId}/summary`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const acknowledgeEvaluation = createAsyncThunk(
  "evaluationResult/acknowledge",
  async (dto: AcknowledgeEvaluationDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationresult/acknowledge",
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

export const requestReview = createAsyncThunk(
  "evaluationResult/appeal",
  async (dto: RequestReviewDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationresult/appeal",
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

export const evaluationResultSlice = createSlice({
  name: "evaluationResult",
  initialState,
  reducers: {
    clearResultDetail(state) {
      state.resultDetail = null;
      state.chartData = null;
    },
    clearResultError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableResults.fulfilled, (state, action) => {
        state.loading = false;
        state.availableResults = action.payload;
      })
      .addCase(fetchAvailableResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEvaluationResultDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvaluationResultDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.resultDetail = action.payload;
      })
      .addCase(fetchEvaluationResultDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.chartData = action.payload;
      })
      .addCase(fetchPerformanceSummary.fulfilled, (state, action) => {
        state.performanceSummary = action.payload;
      })
      .addCase(acknowledgeEvaluation.fulfilled, (state, action) => {
        state.resultDetail = action.payload.data || action.payload;
      });
  },
});

export const { clearResultDetail, clearResultError } = evaluationResultSlice.actions;

export const selectAvailableResults = (state: RootState) => state.evaluationResult.availableResults;
export const selectResultDetail = (state: RootState) => state.evaluationResult.resultDetail;
export const selectChartData = (state: RootState) => state.evaluationResult.chartData;
export const selectPerformanceSummary = (state: RootState) => state.evaluationResult.performanceSummary;
export const selectEvaluationResultLoading = (state: RootState) => state.evaluationResult.loading;

export default evaluationResultSlice.reducer;
