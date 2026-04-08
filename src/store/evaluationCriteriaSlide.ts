import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface CreateEvaluationCriterionDto {
  criteriaName: string;
  criteriaCategory?: string;
  description?: string;
  weightage: number;
  displayOrder: number;
}

export interface UpdateEvaluationCriterionDto {
  criteriaName: string;
  criteriaCategory?: string;
  description?: string;
  weightage: number;
  displayOrder: number;
}

export interface EvaluationCriterionResponseDto {
  criteriaId: number;
  templateId: number;
  criteriaName: string;
  criteriaCategory?: string;
  description?: string;
  weightage: number;
  displayOrder: number;
}

export interface EvaluationCriterionListDto {
  criteriaId: number;
  criteriaName: string;
  criteriaCategory?: string;
  weightage: number;
  displayOrder: number;
}

export interface BulkCreateCriteriaDto {
  criteria: CreateEvaluationCriterionDto[];
}

interface IEvaluationCriteriaState {
  criteria: EvaluationCriterionListDto[];
  selectedCriterion: EvaluationCriterionResponseDto | null;
  loading: boolean;
  error: any | null;
}

const initialState: IEvaluationCriteriaState = {
  criteria: [],
  selectedCriterion: null,
  loading: false,
  error: null,
};

export const fetchCriteriaByTemplate = createAsyncThunk(
  "evaluationCriteria/fetchByTemplate",
  async (templateId: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${templateId}/criteria`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchCriterionById = createAsyncThunk(
  "evaluationCriteria/fetchById",
  async ({ templateId, id }: { templateId: number; id: number }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${templateId}/criteria/${id}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const createCriterion = createAsyncThunk(
  "evaluationCriteria/create",
  async ({ templateId, dto }: { templateId: number; dto: CreateEvaluationCriterionDto }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${templateId}/criteria`,
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

export const createCriteriaBulk = createAsyncThunk(
  "evaluationCriteria/createBulk",
  async ({ templateId, dto }: { templateId: number; dto: BulkCreateCriteriaDto }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${templateId}/criteria/bulk`,
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

export const updateCriterion = createAsyncThunk(
  "evaluationCriteria/update",
  async ({ templateId, id, dto }: { templateId: number; id: number; dto: UpdateEvaluationCriterionDto }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${templateId}/criteria/${id}`,
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

export const deleteCriterion = createAsyncThunk(
  "evaluationCriteria/delete",
  async ({ templateId, id }: { templateId: number; id: number }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      await request({
        url: `/evaluationtemplate/${templateId}/criteria/${id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return { id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const evaluationCriteriaSlice = createSlice({
  name: "evaluationCriteria",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedCriterion(state) {
      state.selectedCriterion = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCriteriaByTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCriteriaByTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.criteria = action.payload;
      })
      .addCase(fetchCriteriaByTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCriterion.fulfilled, (state, action) => {
        state.loading = false;
        state.criteria.push({
          criteriaId: action.payload.criteriaId,
          criteriaName: action.payload.criteriaName,
          criteriaCategory: action.payload.criteriaCategory,
          weightage: action.payload.weightage,
          displayOrder: action.payload.displayOrder
        });
      })
      .addCase(createCriteriaBulk.fulfilled, (state, action) => {
        state.loading = false;
        state.criteria = [...state.criteria, ...action.payload];
      })
      .addCase(updateCriterion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.criteria.findIndex(c => c.criteriaId === action.payload.criteriaId);
        if (index !== -1) {
          state.criteria[index] = {
            criteriaId: action.payload.criteriaId,
            criteriaName: action.payload.criteriaName,
            criteriaCategory: action.payload.criteriaCategory,
            weightage: action.payload.weightage,
            displayOrder: action.payload.displayOrder
          };
        }
      })
      .addCase(deleteCriterion.fulfilled, (state, action) => {
        state.loading = false;
        state.criteria = state.criteria.filter(c => c.criteriaId !== action.payload.id);
      });
  },
});

export const { clearError, clearSelectedCriterion } = evaluationCriteriaSlice.actions;

export const selectCriteria = (state: RootState) => state.evaluationCriteria.criteria;
export const selectCriteriaLoading = (state: RootState) => state.evaluationCriteria.loading;
export const selectCriteriaError = (state: RootState) => state.evaluationCriteria.error;

export default evaluationCriteriaSlice.reducer;
