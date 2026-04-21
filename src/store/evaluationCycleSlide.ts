import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface CreateEvaluationCycleDto {
  cycleName: string;
  cycleType: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  selfEvaluationStart: string;
  selfEvaluationEnd: string;
  managerEvaluationStart: string;
  managerEvaluationEnd: string;
  reviewMeetingStart?: string;
  reviewMeetingEnd?: string;
}

export interface UpdateEvaluationCycleDto {
  cycleName: string;
  cycleType: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  selfEvaluationStart: string;
  selfEvaluationEnd: string;
  managerEvaluationStart: string;
  managerEvaluationEnd: string;
  reviewMeetingStart?: string;
  reviewMeetingEnd?: string;
}

export interface EvaluationCycleResponseDto {
  cycleId: number;
  cycleName: string;
  cycleType: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  selfEvaluationStart: string;
  selfEvaluationEnd: string;
  managerEvaluationStart: string;
  managerEvaluationEnd: string;
  reviewMeetingStart?: string;
  reviewMeetingEnd?: string;
  status: string;
  employeeCount: number;
  createdDate: string;
  createdBy?: number;
  createdByName?: string;
}

export interface TimelineOverviewDto {
  selfEvaluationStart: string;
  selfEvaluationEnd: string;
  managerEvaluationStart: string;
  managerEvaluationEnd: string;
  reviewMeetingStart?: string;
  reviewMeetingEnd?: string;
}

export interface EvaluationCycleSummaryDto {
  cycleId: number;
  cycleName: string;
  cycleType: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  employeeCount: number;
  assignedEvaluatorsCount: number;
  status: string;
  timeline: TimelineOverviewDto;
}

export interface EvaluationCycleListDto {
  cycleId: number;
  cycleName: string;
  cycleType: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  status: string;
  employeeCount: number;
}

export interface CloseCycleDto {
  closureNotes?: string;
}

interface IEvaluationCycleState {
  cycles: EvaluationCycleListDto[];
  selectedCycle: EvaluationCycleResponseDto | null;
  selectedCycleSummary: EvaluationCycleSummaryDto | null;
  loading: boolean;
  error: any | null;
}

const initialState: IEvaluationCycleState = {
  cycles: [],
  selectedCycle: null,
  selectedCycleSummary: null,
  loading: false,
  error: null,
};

export const fetchAllCycles = createAsyncThunk(
  "evaluationCycle/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationcycle",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchActiveAndCompletedCycles = createAsyncThunk(
  "evaluationCycle/fetchActiveAndCompleted",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationcycle/active-and-completed",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchActiveCycles = createAsyncThunk(
  "evaluationCycle/fetchActive",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationcycle/active",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchCycleById = createAsyncThunk(
  "evaluationCycle/fetchById",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationcycle/${id}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchCycleSummary = createAsyncThunk(
  "evaluationCycle/fetchSummary",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationcycle/${id}/summary`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const createCycle = createAsyncThunk(
  "evaluationCycle/create",
  async (dto: CreateEvaluationCycleDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationcycle",
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

export const updateCycle = createAsyncThunk(
  "evaluationCycle/update",
  async ({ id, dto }: { id: number; dto: UpdateEvaluationCycleDto }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationcycle/${id}`,
        method: "PUT",
        data: dto,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const activateCycle = createAsyncThunk(
  "evaluationCycle/activate",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationcycle/${id}/activate`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data; // Backend returns { message, data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const closeCycle = createAsyncThunk(
  "evaluationCycle/close",
  async ({ id, dto }: { id: number; dto: CloseCycleDto }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      await request({
        url: `/evaluationcycle/${id}/close`,
        method: "PATCH",
        data: dto,
        headers: { Authorization: `Bearer ${token}` },
      });
      return { id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const evaluationCycleSlice = createSlice({
  name: "evaluationCycle",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedCycle(state) {
      state.selectedCycle = null;
      state.selectedCycleSummary = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.cycles = action.payload;
      })
      .addCase(fetchAllCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchActiveCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.cycles = action.payload;
      })
      .addCase(fetchActiveCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchActiveAndCompletedCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveAndCompletedCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.cycles = action.payload;
      })
      .addCase(fetchActiveAndCompletedCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCycleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCycle = action.payload;
      })
      .addCase(fetchCycleSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCycleSummary = action.payload;
      })
      .addCase(createCycle.fulfilled, (state, action) => {
        state.loading = false;
        state.cycles.unshift(action.payload);
      })
      .addCase(updateCycle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cycles.findIndex(c => c.cycleId === action.payload.cycleId);
        if (index !== -1) {
          state.cycles[index] = action.payload;
        }
        if (state.selectedCycle && state.selectedCycle.cycleId === action.payload.cycleId) {
          state.selectedCycle = action.payload;
        }
      })
      .addCase(activateCycle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cycles.findIndex(c => c.cycleId === action.payload.cycleId);
        if (index !== -1) {
          state.cycles[index].status = action.payload.status;
        }
        if (state.selectedCycle && state.selectedCycle.cycleId === action.payload.cycleId) {
          state.selectedCycle.status = action.payload.status;
        }
      })
      .addCase(closeCycle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cycles.findIndex(c => c.cycleId === action.payload.id);
        if (index !== -1) {
          state.cycles[index].status = "Cancelled";
        }
        if (state.selectedCycle && state.selectedCycle.cycleId === action.payload.id) {
          state.selectedCycle.status = "Cancelled";
        }
      });
  },
});

export const { clearError, clearSelectedCycle } = evaluationCycleSlice.actions;

export const selectCycles = (state: RootState) => state.evaluationCycle.cycles;
export const selectSelectedCycle = (state: RootState) => state.evaluationCycle.selectedCycle;
export const selectSelectedCycleSummary = (state: RootState) => state.evaluationCycle.selectedCycleSummary;
export const selectCycleLoading = (state: RootState) => state.evaluationCycle.loading;
export const selectCycleError = (state: RootState) => state.evaluationCycle.error;

export default evaluationCycleSlice.reducer;
