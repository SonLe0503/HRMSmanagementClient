import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface CompetencyReportFilterDTO {
    cycleId?: number;
    employeeId?: number;
    departmentId?: number;
    criteriaIds?: number[];
    criteriaCategory?: string;
    scope: "Individual" | "Team" | "Organization";
}

export interface CompetencyReportItemDTO {
    criteriaId: number;
    criteriaName: string;
    criteriaCategory: string;
    averageManagerRating: number;
    averageSelfRating: number | null;
    gap: number;
}

export interface CompetencyTrendPointDTO {
    cycleId: number;
    cycleName: string;
    averageManagerRating: number;
    averageSelfRating: number | null;
}

export interface CompetencyTrendDTO {
    criteriaId: number;
    criteriaName: string;
    points: CompetencyTrendPointDTO[];
}

export interface EmployeeComparisonDTO {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    employeeAverageRating: number;
    teamAverageRating: number;
}

export interface DepartmentComparisonDTO {
    departmentId: number;
    departmentName: string;
    averageRating: number;
}

export interface HighLowPerformerDTO {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    averageRating: number;
    group: "High" | "Low";
}

export interface CompetencyReportResponseDTO {
    scope: string;
    cycleName: string | null;
    hasEnoughData: boolean;
    disclaimerMessage: string | null;
    competencyProfiles: CompetencyReportItemDTO[];
    trends: CompetencyTrendDTO[];
    strengths: CompetencyReportItemDTO[];
    developmentGaps: CompetencyReportItemDTO[];
    employeeComparisons: EmployeeComparisonDTO[];
    departmentComparisons: DepartmentComparisonDTO[];
    highLowPerformers: HighLowPerformerDTO[];
}

export interface CompetencyDrilldownRequestDTO {
    criteriaId: number;
    cycleId?: number;
    employeeId?: number;
    departmentId?: number;
}

export interface CompetencyDrilldownItemDTO {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    departmentName: string | null;
    selfRating: number | null;
    managerRating: number | null;
    selfComments: string | null;
    managerComments: string | null;
}

export interface CompetencyDrilldownResponseDTO {
    criteriaId: number;
    criteriaName: string;
    criteriaCategory: string | null;
    details: CompetencyDrilldownItemDTO[];
}

export interface ExportCompetencyReportRequestDTO {
    filter: CompetencyReportFilterDTO;
    format: "csv" | "excel" | "pdf";
}

interface CompetencyState {
    report: CompetencyReportResponseDTO | null;
    drilldown: CompetencyDrilldownResponseDTO | null;
    loading: boolean;
    error: string | null;
}

const initialState: CompetencyState = {
    report: null,
    drilldown: null,
    loading: false,
    error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

export const generateCompetencyReport = createAsyncThunk(
    "competency/generate",
    async (filter: CompetencyReportFilterDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/competency-reports/generate",
                method: "POST",
                data: filter,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to generate report");
        }
    }
);

export const getCompetencyDrilldown = createAsyncThunk(
    "competency/drilldown",
    async (requestData: CompetencyDrilldownRequestDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/competency-reports/drilldown",
                method: "POST",
                data: requestData,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch drilldown");
        }
    }
);

export const exportCompetencyReport = createAsyncThunk(
    "competency/export",
    async (exportRequest: ExportCompetencyReportRequestDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/competency-reports/export",
                method: "POST",
                data: exportRequest,
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const fileName = `competency-report-${new Date().getTime()}.${exportRequest.format === "excel" ? "xlsx" : exportRequest.format}`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            return { success: true };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to export report");
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

export const competencySlice = createSlice({
    name: "competency",
    initialState,
    reducers: {
        clearReport(state) { state.report = null; },
        clearDrilldown(state) { state.drilldown = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateCompetencyReport.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(generateCompetencyReport.fulfilled, (state, action) => {
                state.loading = false;
                state.report = action.payload;
            })
            .addCase(generateCompetencyReport.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
            
            .addCase(getCompetencyDrilldown.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(getCompetencyDrilldown.fulfilled, (state, action) => {
                state.loading = false;
                state.drilldown = action.payload;
            })
            .addCase(getCompetencyDrilldown.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const { clearReport, clearDrilldown } = competencySlice.actions;

export const selectCompetencyReport = (state: RootState) => state.competency.report;
export const selectCompetencyDrilldown = (state: RootState) => state.competency.drilldown;
export const selectCompetencyLoading = (state: RootState) => state.competency.loading;
export const selectCompetencyError = (state: RootState) => state.competency.error;

export default competencySlice.reducer;
