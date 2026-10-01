import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface ICompany {
  companyId: number;
  companyCode: string;
  companyName: string;
  taxCode: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdDate: string;
  employeeCount: number;
  userCount: number;
  admins: ICompanyAdmin[];
}

export interface ICompanyAdmin {
  userId: number;
  username: string;
  email: string;
  isActive: boolean;
}

export interface ICompanyWrite {
  companyCode: string;
  companyName: string;
  taxCode?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface ICreateCompany extends ICompanyWrite {
  admin: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  };
}

export interface ICreateCompanyResult {
  companyId: number;
  adminUsername: string;
  temporaryPassword: string;
}

export interface IResetAdminPasswordResult {
  username: string;
  temporaryPassword: string;
}

interface ICompanyState {
  list: ICompany[];
  loading: boolean;
}

const initialState: ICompanyState = {
  list: [],
  loading: false,
};

const authHeader = (getState: () => unknown) => {
  const state: any = getState();
  return { Authorization: `Bearer ${state.auth.infoLogin?.accessToken}` };
};

const errorOf = (error: any, fallback: string) =>
  error.response?.data?.message || error.response?.data?.title || fallback;

// GET /api/Company
export const fetchCompanies = createAsyncThunk("company/fetchAll", async (_, { rejectWithValue, getState }) => {
  try {
    const response = await request({ url: "/Company", method: "GET", headers: authHeader(getState) });
    return response.data as ICompany[];
  } catch (error: any) {
    return rejectWithValue(errorOf(error, "Không tải được danh sách công ty"));
  }
});

// POST /api/Company
export const createCompany = createAsyncThunk(
  "company/create",
  async (data: ICreateCompany, { rejectWithValue, getState }) => {
    try {
      const response = await request({ url: "/Company", method: "POST", data, headers: authHeader(getState) });
      return response.data as ICreateCompanyResult;
    } catch (error: any) {
      return rejectWithValue(errorOf(error, "Tạo công ty thất bại"));
    }
  }
);

// PUT /api/Company/{id}
export const updateCompany = createAsyncThunk(
  "company/update",
  async ({ companyId, data }: { companyId: number; data: ICompanyWrite }, { rejectWithValue, getState }) => {
    try {
      const response = await request({ url: `/Company/${companyId}`, method: "PUT", data, headers: authHeader(getState) });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(errorOf(error, "Cập nhật công ty thất bại"));
    }
  }
);

// PATCH /api/Company/{id}/status
export const setCompanyStatus = createAsyncThunk(
  "company/setStatus",
  async ({ companyId, isActive }: { companyId: number; isActive: boolean }, { rejectWithValue, getState }) => {
    try {
      const response = await request({
        url: `/Company/${companyId}/status`,
        method: "PATCH",
        data: { isActive },
        headers: authHeader(getState),
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(errorOf(error, "Đổi trạng thái công ty thất bại"));
    }
  }
);

// POST /api/Company/{id}/admins/{userId}/reset-password
export const resetCompanyAdminPassword = createAsyncThunk(
  "company/resetAdminPassword",
  async ({ companyId, userId }: { companyId: number; userId: number }, { rejectWithValue, getState }) => {
    try {
      const response = await request({
        url: `/Company/${companyId}/admins/${userId}/reset-password`,
        method: "POST",
        headers: authHeader(getState),
      });
      return response.data as IResetAdminPasswordResult;
    } catch (error: any) {
      return rejectWithValue(errorOf(error, "Đặt lại mật khẩu thất bại"));
    }
  }
);

export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const selectCompanies = (state: RootState) => state.company.list;
export const selectCompaniesLoading = (state: RootState) => state.company.loading;

export default companySlice.reducer;
