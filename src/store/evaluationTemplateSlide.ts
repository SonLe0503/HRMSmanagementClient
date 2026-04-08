import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface CreateEvaluationTemplateDto {
  templateName: string;
  description?: string;
}

export interface UpdateEvaluationTemplateDto {
  templateName: string;
  description?: string;
}

export interface EvaluationTemplateResponseDto {
  templateId: number;
  templateName: string;
  description?: string;
  criteriaCount: number;
  isActive: boolean;
  createdDate: string;
  createdBy?: number;
  createdByName?: string;
}

export interface EvaluationTemplateListDto {
  templateId: number;
  templateName: string;
  isActive: boolean;
  criteriaCount: number;
}

interface IEvaluationTemplateState {
  templates: EvaluationTemplateListDto[];
  selectedTemplate: EvaluationTemplateResponseDto | null;
  loading: boolean;
  error: any | null;
}

const initialState: IEvaluationTemplateState = {
  templates: [],
  selectedTemplate: null,
  loading: false,
  error: null,
};

export const fetchAllTemplates = createAsyncThunk(
  "evaluationTemplate/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationtemplate",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchActiveTemplates = createAsyncThunk(
  "evaluationTemplate/fetchActive",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationtemplate/active",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const fetchTemplateById = createAsyncThunk(
  "evaluationTemplate/fetchById",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${id}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const createTemplate = createAsyncThunk(
  "evaluationTemplate/create",
  async (dto: CreateEvaluationTemplateDto, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: "/evaluationtemplate",
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

export const updateTemplate = createAsyncThunk(
  "evaluationTemplate/update",
  async ({ id, dto }: { id: number; dto: UpdateEvaluationTemplateDto }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${id}`,
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

export const deactivateTemplate = createAsyncThunk(
  "evaluationTemplate/deactivate",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${id}/deactivate`,
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      return { id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const activateTemplate = createAsyncThunk(
  "evaluationTemplate/activate",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/evaluationtemplate/${id}/activate`,
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      return { id, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const evaluationTemplateSlice = createSlice({
  name: "evaluationTemplate",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedTemplate(state) {
      state.selectedTemplate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchAllTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchActiveTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchActiveTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTemplateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTemplate = action.payload;
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates.push({
          templateId: action.payload.templateId,
          templateName: action.payload.templateName,
          isActive: action.payload.isActive,
          criteriaCount: action.payload.criteriaCount
        });
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.templates.findIndex(t => t.templateId === action.payload.templateId);
        if (index !== -1) {
          state.templates[index] = {
            templateId: action.payload.templateId,
            templateName: action.payload.templateName,
            isActive: action.payload.isActive,
            criteriaCount: action.payload.criteriaCount
          };
        }
        if (state.selectedTemplate?.templateId === action.payload.templateId) {
          state.selectedTemplate = action.payload;
        }
      })
      .addCase(deactivateTemplate.fulfilled, (state, action) => {
        const id = action.payload.id;
        const index = state.templates.findIndex(t => t.templateId === id);
        if (index !== -1) {
          state.templates[index].isActive = false;
        }
        if (state.selectedTemplate && state.selectedTemplate.templateId === id) {
          state.selectedTemplate.isActive = false;
        }
      })
      .addCase(activateTemplate.fulfilled, (state, action) => {
        const id = action.payload.id;
        const index = state.templates.findIndex(t => t.templateId === id);
        if (index !== -1) {
          state.templates[index].isActive = true;
        }
        if (state.selectedTemplate && state.selectedTemplate.templateId === id) {
          state.selectedTemplate.isActive = true;
        }
      });
  },
});

export const { clearError, clearSelectedTemplate } = evaluationTemplateSlice.actions;

export const selectTemplates = (state: RootState) => state.evaluationTemplate.templates;
export const selectSelectedTemplate = (state: RootState) => state.evaluationTemplate.selectedTemplate;
export const selectTemplateLoading = (state: RootState) => state.evaluationTemplate.loading;
export const selectTemplateError = (state: RootState) => state.evaluationTemplate.error;

export default evaluationTemplateSlice.reducer;
