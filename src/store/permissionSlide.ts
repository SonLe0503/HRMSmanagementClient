// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { request } from "../utils/request";
// import type { RootState } from "./index";

// export interface IPermission {
//     permissionId: number;
//     permissionCode: string;
//     permissionName: string;
//     module: string;
//     description?: string;
// }

// interface IPermissionState {
//     permissions: IPermission[];
//     loading: boolean;
//     error: string | null;
// }

// const initialState: IPermissionState = {
//     permissions: [],
//     loading: false,
//     error: null,
// };

// // GET: /api/Permission
// export const fetchAllPermissions = createAsyncThunk(
//     "permission/fetchAllPermissions",
//     async (_, { rejectWithValue, getState }) => {
//         try {
//             const state: any = getState();
//             const token = state.auth.infoLogin?.accessToken;
//             const response = await request({
//                 url: "/Permission",
//                 method: "GET",
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             return response.data;
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data || "Something went wrong");
//         }
//     }
// );

// // POST: /api/Permission
// export const createPermission = createAsyncThunk(
//     "permission/createPermission",
//     async (data: { permissionCode: string; permissionName: string; module: string; description?: string }, { rejectWithValue, getState }) => {
//         try {
//             const state: any = getState();
//             const token = state.auth.infoLogin?.accessToken;
//             const response = await request({
//                 url: "/Permission",
//                 method: "POST",
//                 data,
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             return response.data;
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data || "Something went wrong");
//         }
//     }
// );

// // PUT: /api/Permission/{id}
// export const updatePermission = createAsyncThunk(
//     "permission/updatePermission",
//     async ({ id, data }: { id: number; data: { permissionName: string; module: string; description?: string } }, { rejectWithValue, getState }) => {
//         try {
//             const state: any = getState();
//             const token = state.auth.infoLogin?.accessToken;
//             const response = await request({
//                 url: `/Permission/${id}`,
//                 method: "PUT",
//                 data,
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             return response.data;
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data || "Something went wrong");
//         }
//     }
// );

// // DELETE: /api/Permission/{id}
// export const deletePermission = createAsyncThunk(
//     "permission/deletePermission",
//     async (id: number, { rejectWithValue, getState }) => {
//         try {
//             const state: any = getState();
//             const token = state.auth.infoLogin?.accessToken;
//             const response = await request({
//                 url: `/Permission/${id}`,
//                 method: "DELETE",
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             return { id, message: response.data };
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data || "Something went wrong");
//         }
//     }
// );

// const permissionSlice = createSlice({
//     name: "permission",
//     initialState,
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             // Fetch All
//             .addCase(fetchAllPermissions.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchAllPermissions.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.permissions = action.payload;
//             })
//             .addCase(fetchAllPermissions.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//             })
//             // Create
//             .addCase(createPermission.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(createPermission.fulfilled, (state) => {
//                 state.loading = false;
//             })
//             .addCase(createPermission.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//             })
//             // Update
//             .addCase(updatePermission.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(updatePermission.fulfilled, (state) => {
//                 state.loading = false;
//             })
//             .addCase(updatePermission.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//             })
//             // Delete
//             .addCase(deletePermission.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(deletePermission.fulfilled, (state) => {
//                 state.loading = false;
//             })
//             .addCase(deletePermission.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload as string;
//             });
//     },
// });

// export const selectPermissions = (state: RootState) => state.permission.permissions;
// export const selectPermissionLoading = (state: RootState) => state.permission.loading;
// export const selectPermissionError = (state: RootState) => state.permission.error;

// export default permissionSlice.reducer;
