import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import testReducer from './slices/testSlice';
import examReducer from './slices/examSlice';
import submissionReducer from './slices/submissionSlice';
import studentReducer from './slices/studentSlice';
import questionBankReducer from './slices/questionBankSlice';
import courseReducer from './slices/courseSlice';
import assignmentReducer from './slices/assignmentSlice';
import gradebookReducer from './slices/gradebookSlice';
import gamificationReducer from './slices/gamificationSlice';
import communicationReducer from './slices/communicationSlice';
import proctoringReducer from './slices/proctoringSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    test: testReducer,
    exam: examReducer,
    submission: submissionReducer,
    student: studentReducer,
    questionBank: questionBankReducer,
    courses: courseReducer,
    assignments: assignmentReducer,
    gradebook: gradebookReducer,
    gamification: gamificationReducer,
    communication: communicationReducer,
    proctoring: proctoringReducer
  }
});

export default store;
