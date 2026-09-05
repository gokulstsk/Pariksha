import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Submit Test
export const submitExam = createAsyncThunk(
  'submission/submitExam',
  async ({ testId, answers, time_taken_seconds, started_at }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/submissions/test/${testId}`, {
        answers,
        time_taken_seconds,
        started_at
      });
      return response.data.submission;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit test.');
    }
  }
);

// Fetch My Submissions (Student)
export const fetchMySubmissions = createAsyncThunk(
  'submission/fetchMySubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/submissions/my-history');
      return response.data.submissions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your history.');
    }
  }
);

// Fetch Submissions for a specific test (Teacher)
export const fetchTestSubmissions = createAsyncThunk(
  'submission/fetchTestSubmissions',
  async (testId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/submissions/test/${testId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch test submissions.');
    }
  }
);

// Fetch Single Submission Report by ID
export const fetchSubmissionById = createAsyncThunk(
  'submission/fetchSubmissionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/submissions/${id}`);
      return response.data.submission;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load submission report.');
    }
  }
);

const submissionSlice = createSlice({
  name: 'submission',
  initialState: {
    mySubmissions: [],
    currentTestSubmissions: { test: null, submissions: [] },
    currentSubmission: null,
    isSubmitting: false,
    isLoading: false,
    error: null
  },
  reducers: {
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
    clearSubmissionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // submitExam
      .addCase(submitExam.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentSubmission = action.payload;
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })
      // fetchMySubmissions
      .addCase(fetchMySubmissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySubmissions = action.payload;
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchTestSubmissions
      .addCase(fetchTestSubmissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTestSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTestSubmissions = action.payload;
      })
      .addCase(fetchTestSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchSubmissionById
      .addCase(fetchSubmissionById.pending, (state) => {
        state.isLoading = true;
        state.currentSubmission = null;
        state.error = null;
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubmission = action.payload;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentSubmission, clearSubmissionError } = submissionSlice.actions;
export default submissionSlice.reducer;
