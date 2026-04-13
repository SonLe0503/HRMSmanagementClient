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
import shiftAssignmentSlide from "./shiftAssignmentSlide";
import leaveRequestSlide from "./leaveRequestSlide";
import leaveTypeSlide from "./leaveTypeSlide";
import leaveBalanceSlide from "./leaveBalanceSlide";
import overtimeSlide from "./overtimeSlide";
import exportSlide from "./exportSlide";
import workforceAnalyticsSlide from "./workforceAnalyticsSlide";
import competencySlide from "./competencySlide";
import evaluationCycleSlide from "./evaluationCycleSlide";
import evaluationTemplateSlide from "./evaluationTemplateSlide";
import evaluationCriteriaSlide from "./evaluationCriteriaSlide";
import evaluationSlide from "./evaluationSlide";
import submitEvaluationSlide from "./submitEvaluationSlide";
import evaluationResultSlide from "./evaluationResultSlide";
import systemSettingSlide from "./systemSettingSlide";
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
  shiftAssignment: shiftAssignmentSlide,
  leaveRequest: leaveRequestSlide,
  leaveType: leaveTypeSlide,
  leaveBalance: leaveBalanceSlide,
  overtime: overtimeSlide,
  export: exportSlide,
  workforceAnalytics: workforceAnalyticsSlide,
  competency: competencySlide,
  evaluationCycle: evaluationCycleSlide,
  evaluationTemplate: evaluationTemplateSlide,
  evaluationCriteria: evaluationCriteriaSlide,
  evaluation: evaluationSlide,
  submitEvaluation: submitEvaluationSlide,
  evaluationResult: evaluationResultSlide,
  systemSetting: systemSettingSlide,
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