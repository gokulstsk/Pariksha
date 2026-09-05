import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Fetch tests (teacher sees own, student sees published)
export const fetchTests = createAsyncThunk(
  'test/fetchTests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/tests');
      return response.data.tests;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load tests.');
    }
  }
);

// Fetch single test with questions
export const fetchTestById = createAsyncThunk(
  'test/fetchTestById',
  async (arg, { rejectWithValue }) => {
    try {
      const testId = typeof arg === 'object' ? arg.id : arg;
      const pwd = typeof arg === 'object' ? arg.password : '';
      const response = await axiosClient.get(`/tests/${testId}${pwd ? `?password=${encodeURIComponent(pwd)}` : ''}`);
      return response.data.test;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load test details.');
    }
  }
);

// Create test (Teacher)
export const createTest = createAsyncThunk(
  'test/createTest',
  async (testData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/tests', testData);
      return response.data.test;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create test.');
    }
  }
);

// Update test (Teacher)
export const updateTest = createAsyncThunk(
  'test/updateTest',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/tests/${id}`, data);
      return response.data.test;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update test.');
    }
  }
);

// Toggle publish (Teacher)
export const togglePublishTest = createAsyncThunk(
  'test/togglePublishTest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/tests/${id}/toggle-publish`);
      return { id, is_published: response.data.is_published };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle publish status.');
    }
  }
);

// Delete test (Teacher)
export const deleteTest = createAsyncThunk(
  'test/deleteTest',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/tests/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete test.');
    }
  }
);

// Add Question (Teacher)
export const addQuestion = createAsyncThunk(
  'test/addQuestion',
  async ({ testId, questionData }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/questions/test/${testId}`, questionData);
      return response.data.question;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add question.');
    }
  }
);

// Update Question (Teacher)
export const updateQuestion = createAsyncThunk(
  'test/updateQuestion',
  async ({ id, questionData }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/questions/${id}`, questionData);
      return response.data.question;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update question.');
    }
  }
);

// Delete Question (Teacher)
export const deleteQuestion = createAsyncThunk(
  'test/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/questions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete question.');
    }
  }
);

// Bulk Import Questions (Teacher)
export const bulkImportQuestions = createAsyncThunk(
  'test/bulkImportQuestions',
  async ({ testId, questions }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/questions/test/${testId}/bulk`, { questions });
      return response.data.questions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to import questions.');
    }
  }
);

// Fetch Teacher Dashboard Stats
export const fetchTeacherStats = createAsyncThunk(
  'test/fetchTeacherStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/analytics/teacher-dashboard');
      return response.data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics.');
    }
  }
);

const testSlice = createSlice({
  name: 'test',
  initialState: {
    tests: [],
    currentTest: null,
    stats: null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearCurrentTest: (state) => {
      state.currentTest = null;
    },
    clearTestError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTests
      .addCase(fetchTests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // fetchTestById
      .addCase(fetchTestById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTest = action.payload;
      })
      .addCase(fetchTestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // createTest
      .addCase(createTest.fulfilled, (state, action) => {
        state.tests.unshift(action.payload);
      })
      // updateTest
      .addCase(updateTest.fulfilled, (state, action) => {
        const index = state.tests.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tests[index] = { ...state.tests[index], ...action.payload };
        }
        if (state.currentTest && state.currentTest.id === action.payload.id) {
          state.currentTest = { ...state.currentTest, ...action.payload };
        }
      })
      // togglePublishTest
      .addCase(togglePublishTest.fulfilled, (state, action) => {
        const { id, is_published } = action.payload;
        const index = state.tests.findIndex((t) => t.id === id);
        if (index !== -1) {
          state.tests[index].is_published = is_published;
        }
        if (state.currentTest && state.currentTest.id === id) {
          state.currentTest.is_published = is_published;
        }
      })
      // deleteTest
      .addCase(deleteTest.fulfilled, (state, action) => {
        state.tests = state.tests.filter((t) => t.id !== action.payload);
        if (state.currentTest && state.currentTest.id === action.payload) {
          state.currentTest = null;
        }
      })
      // addQuestion
      .addCase(addQuestion.fulfilled, (state, action) => {
        if (state.currentTest) {
          if (!state.currentTest.questions) state.currentTest.questions = [];
          state.currentTest.questions.push(action.payload);
        }
      })
      // updateQuestion
      .addCase(updateQuestion.fulfilled, (state, action) => {
        if (state.currentTest && state.currentTest.questions) {
          const idx = state.currentTest.questions.findIndex((q) => q.id === action.payload.id);
          if (idx !== -1) {
            state.currentTest.questions[idx] = action.payload;
          }
        }
      })
      // deleteQuestion
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        if (state.currentTest && state.currentTest.questions) {
          state.currentTest.questions = state.currentTest.questions.filter((q) => q.id !== action.payload);
        }
      })
      // bulkImportQuestions
      .addCase(bulkImportQuestions.fulfilled, (state, action) => {
        if (state.currentTest) {
          state.currentTest.questions = action.payload;
        }
      })
      // fetchTeacherStats
      .addCase(fetchTeacherStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearCurrentTest, clearTestError } = testSlice.actions;
export default testSlice.reducer;
