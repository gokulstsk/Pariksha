import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchLiveSession = createAsyncThunk(
  'proctoring/fetchLiveSession',
  async (testId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/proctoring/session/${testId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch live session.');
    }
  }
);

export const logViolation = createAsyncThunk(
  'proctoring/logViolation',
  async ({ testId, violationType, details }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/proctoring/violation/${testId}`, {
        violation_type: violationType,
        details
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to log violation.');
    }
  }
);

export const grantExtraTime = createAsyncThunk(
  'proctoring/grantExtraTime',
  async ({ submissionId, extra_minutes }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/proctoring/extra-time/${submissionId}`, { extra_minutes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to grant extra time.');
    }
  }
);

export const forceSubmitSession = createAsyncThunk(
  'proctoring/forceSubmitSession',
  async ({ submissionId, disqualify }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/proctoring/force-submit/${submissionId}`, { disqualify });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to force submit.');
    }
  }
);

const proctoringSlice = createSlice({
  name: 'proctoring',
  initialState: {
    liveTest: null,
    sessions: [],
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLiveSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.liveTest = action.payload.test;
        state.sessions = action.payload.sessions;
      })
      .addCase(fetchLiveSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default proctoringSlice.reducer;
