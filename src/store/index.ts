import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";


import authSlide from "./authSlide";
import roleSlide from "./roleSlide";
import userSlide from "./userSlide";

import taskSlide from "./taskSlide";
import employeeSlide from "./employeeSlide";
import employeeDocumentSlide from "./employeeDocumentSlide";
import departmentSlide from "./departmentSlide";
import positionSlide from "./positionSlide";
import attendanceSlide from "./attendanceSlide";
import hrProcedureSlide from "./hrProcedureSlide";
import shiftSlide from "./shiftSlide";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["infoLogin", "isLogin"],
};

const reducers = {
  auth: persistReducer(persistConfig, authSlide),
  role: roleSlide,
  user: userSlide,
  task: taskSlide,
  employee: employeeSlide,
  employeeDocument: employeeDocumentSlide,
  department: departmentSlide,
  position: positionSlide,
  attendance: attendanceSlide,
  hrProcedure: hrProcedureSlide,
  shift: shiftSlide,
}
const rootReducer = combineReducers(reducers);
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;