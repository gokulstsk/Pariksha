import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchGradebook = createAsyncThunk(
  'gradebook/fetchGradebook',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/gradebook/overview', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gradebook.');
    }
  }
);

export const gradeAnswerManually = createAsyncThunk(
  'gradebook/gradeAnswerManually',
  async ({ answerId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/gradebook/grade-answer/${answerId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to grade answer.');
    }
  }
);

const gradebookSlice = createSlice({
  name: 'gradebook',
  initialState: {
    tests: [],
    assignments: [],
    gradebook: [],
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGradebook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGradebook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tests = action.payload.tests;
        state.assignments = action.payload.assignments;
        state.gradebook = action.payload.gradebook;
      })
      .addCase(fetchGradebook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default gradebookSlice.reducer;
