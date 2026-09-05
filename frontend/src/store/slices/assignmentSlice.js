import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/assignments');
      return response.data.assignments;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments.');
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  'assignments/fetchAssignmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/assignments/${id}`);
      return response.data.assignment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignment details.');
    }
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/assignments', data);
      return response.data.assignment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create assignment.');
    }
  }
);

export const submitAssignment = createAsyncThunk(
  'assignments/submitAssignment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/assignments/${id}/submit`, data);
      return { id, submission: response.data.submission };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit assignment.');
    }
  }
);

export const gradeAssignmentSubmission = createAsyncThunk(
  'assignments/gradeAssignmentSubmission',
  async ({ submissionId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/assignments/grade/${submissionId}`, data);
      return response.data.submission;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to grade submission.');
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    currentAssignment: null,
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.currentAssignment = action.payload;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.assignments.unshift(action.payload);
      });
  }
});

export default assignmentSlice.reducer;
