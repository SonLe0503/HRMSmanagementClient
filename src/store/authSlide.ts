import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { EUserRole, type DynamicKeyObject } from "../interface/app";
import { request } from "../utils/request";
import { jwtDecode } from "jwt-decode";
import type { RootState } from "./index";

interface IInfoLogin {
  accessToken: string;
  role: EUserRole;
  userId: string;
  employeeId?: number;
  userName: string;
  expiresTime: number;
  isTopLevel: boolean;
  positionName: string;
}

type IInitialState = {
  infoLogin: IInfoLogin | null;
  isLogin: boolean;
}

const initialState: IInitialState = {
  infoLogin: {
    accessToken: "",
    role: EUserRole.EMPLOYEE,
    userId: "",
    employeeId: undefined,
    userName: "",
    expiresTime: 0,
    isTopLevel: false,
    positionName: "",
  },
  isLogin: false,
}

export const actionLogin = createAsyncThunk(
  "auth/actionLogin",
  async (data: DynamicKeyObject, { rejectWithValue }) => {
    try {
      return await request({
        url: `/Auth/login`,
        method: "POST",
        data,
      });
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: any, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      const response = await request({
        url: `/Auth/change-password`,
        method: "POST",
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to change password");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: { emailOrUsername: string }, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/Auth/forgot-password`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to send OTP");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `/Auth/reset-password`,
        method: "POST",
        data,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to reset password");
    }
  }
);

export const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.infoLogin = initialState.infoLogin;
      state.isLogin = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(actionLogin.fulfilled, (state, action) => {
      const token = action.payload?.data?.token ?? "";
      if (token) {
        const decodedToken: any = jwtDecode(token);
        state.infoLogin = {
          ...state.infoLogin,
          accessToken: token,
          role: decodedToken["role"] as EUserRole,
          userId: decodedToken["nameid"],
          employeeId: decodedToken["employeeId"]
            ? Number(decodedToken["employeeId"])
            : decodedToken["EmployeeID"]
              ? Number(decodedToken["EmployeeID"])
              : undefined,
          userName: decodedToken["unique_name"],
          expiresTime: decodedToken["exp"],
          isTopLevel: decodedToken["IsTopLevel"] === "true",
          positionName: decodedToken["PositionName"] || "",
        };
        state.isLogin = true;
      }
    })
      .addCase(actionLogin.rejected, (state) => {
        state.infoLogin = initialState.infoLogin;
        state.isLogin = false;
      });
  }
})

export const { logout } = slice.actions;
export const selectIsLogin = (state: RootState) => state.auth.isLogin;
export const selectInfoLogin = (state: RootState) => state.auth.infoLogin;
export default slice.reducer;
