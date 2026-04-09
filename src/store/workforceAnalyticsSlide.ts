import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface WorkforceAnalyticsRequestDTO {
    timePeriod: "monthly" | "quarterly" | "yearly" | "custom";
    startDate?: string;
    endDate?: string;
    organizationLevel: "company" | "division" | "department" | "team";
    departmentId?: number;
    managerEmployeeId?: number;
    employeeGroup: "all" | "full-time" | "part-time" | "contract";
    comparisonPeriod: "none" | "previous-period" | "previous-year";
}

export interface HeadcountAnalyticsDTO {
    totalHeadcount: number;
    newHires: number;
    terminations: number;
    headcountByDepartment: any[];
    headcountTrend: any[];
    vacancyRate: number;
    contractorVsPermanentRatio: number;
}

export interface DemographicsAnalyticsDTO {
    ageDistribution: any[];
    genderDistribution: any[];
    tenureDistribution: any[];
    locationDistribution: any[];
    positionLevelDistribution: any[];
}

export interface AttritionAnalyticsDTO {
    overallTurnoverRate: number;
    turnoverByDepartment: any[];
    turnoverByTenureBand: any[];
    attritionTrend: any[];
    reasonsForLeaving: any[];
}

export interface TalentAnalyticsDTO {
    performanceRatingDistribution: any[];
    highPerformerCount: number;
    promotionRate: number;
    internalMobilityPatterns: any[];
    skillGapAnalysis: any[];
}

export interface EngagementProductivityAnalyticsDTO {
    averageAttendanceRate: number;
    leaveUtilizationPatterns: any[];
    overtimeTrends: any[];
    productivityMetrics: any[];
}

export interface WorkforceAnalyticsResponseDTO {
    success: boolean;
    message: string;
    headcountAnalytics: HeadcountAnalyticsDTO;
    demographicsAnalytics: DemographicsAnalyticsDTO;
    attritionAnalytics: AttritionAnalyticsDTO;
    talentAnalytics: TalentAnalyticsDTO;
    engagementProductivity: EngagementProductivityAnalyticsDTO;
}

export interface AIInsightsResponseDTO {
    success: boolean;
    message: string;
    attritionRisks: any[];
    headcountRecommendations: any[];
    hiringForecasts: any[];
    retentionSuggestions: any[];
}

export interface SaveWorkforceViewDTO {
    viewName: string;
    filters: WorkforceAnalyticsRequestDTO;
}

export interface ScheduleWorkforceReportDTO {
    frequency: "daily" | "weekly" | "monthly";
    dayOfWeek: string;
    time?: string;
    recipients: string[];
    format: "csv" | "excel" | "pdf";
    filters: WorkforceAnalyticsRequestDTO;
}

interface WorkforceAnalyticsState {
    analytics: WorkforceAnalyticsResponseDTO | null;
    aiInsights: AIInsightsResponseDTO | null;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: WorkforceAnalyticsState = {
    analytics: null,
    aiInsights: null,
    loading: false,
    error: null,
    successMessage: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const generateWorkforceAnalytics = createAsyncThunk(
    "workforceAnalytics/generate",
    async (payload: WorkforceAnalyticsRequestDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/workforce-analytics/generate",
                method: "POST",
                data: payload,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to generate analytics");
        }
    }
);

export const getWorkforceAIInsights = createAsyncThunk(
    "workforceAnalytics/aiInsights",
    async (payload: WorkforceAnalyticsRequestDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/workforce-analytics/ai-insights",
                method: "POST",
                data: payload,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to get AI insights");
        }
    }
);

export const saveWorkforceCustomView = createAsyncThunk(
    "workforceAnalytics/saveView",
    async (payload: SaveWorkforceViewDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/workforce-analytics/save-view",
                method: "POST",
                data: payload,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to save view");
        }
    }
);

export const scheduleWorkforceReport = createAsyncThunk(
    "workforceAnalytics/scheduleReport",
    async (payload: ScheduleWorkforceReportDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/workforce-analytics/schedule-report",
                method: "POST",
                data: payload,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to schedule report");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const workforceAnalyticsSlice = createSlice({
    name: "workforceAnalytics",
    initialState,
    reducers: {
        clearAnalyticsState(state) {
            state.analytics = null;
            state.aiInsights = null;
            state.error = null;
            state.successMessage = null;
        },
        clearSuccessMessage(state) {
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Generate
            .addCase(generateWorkforceAnalytics.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(generateWorkforceAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(generateWorkforceAnalytics.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            // AI Insights
            .addCase(getWorkforceAIInsights.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(getWorkforceAIInsights.fulfilled, (state, action) => {
                state.loading = false;
                state.aiInsights = action.payload;
            })
            .addCase(getWorkforceAIInsights.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            // Others
            .addCase(saveWorkforceCustomView.fulfilled, (state, action) => {
                state.successMessage = action.payload.message;
            })
            .addCase(scheduleWorkforceReport.fulfilled, (state, action) => {
                state.successMessage = action.payload.message;
            });
    },
});

export const { clearAnalyticsState, clearSuccessMessage } = workforceAnalyticsSlice.actions;

export const selectWorkforceAnalytics = (state: RootState) => state.workforceAnalytics.analytics;
export const selectWorkforceAIInsights = (state: RootState) => state.workforceAnalytics.aiInsights;
export const selectWorkforceLoading = (state: RootState) => state.workforceAnalytics.loading;
export const selectWorkforceError = (state: RootState) => state.workforceAnalytics.error;
export const selectWorkforceSuccessMessage = (state: RootState) => state.workforceAnalytics.successMessage;

export default workforceAnalyticsSlice.reducer;
