import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface EvaluationCycle {
    cycleId: number;
    cycleName: string;
    startDate: string;
    endDate: string;
    status: string;
    isActive: boolean;
}

interface EvaluationCycleState {
    cycles: EvaluationCycle[];
    loading: boolean;
    error: string | null;
}

const initialState: EvaluationCycleState = {
    cycles: [],
    loading: false,
    error: null,
};

export const fetchActiveCycles = createAsyncThunk(
    "evaluationCycle/fetchActive",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const response = await request({
                url: "/evaluation-cycles/active",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch cycles");
        }
    }
);

export const evaluationCycleSlice = createSlice({
    name: "evaluationCycle",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveCycles.pending, (state) => { state.loading = true; })
            .addCase(fetchActiveCycles.fulfilled, (state, action) => {
                state.loading = false;
                state.cycles = action.payload;
            })
            .addCase(fetchActiveCycles.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const selectCycles = (state: RootState) => state.evaluationCycle.cycles;
export const selectCycleLoading = (state: RootState) => state.evaluationCycle.loading;

export default evaluationCycleSlice.reducer;
