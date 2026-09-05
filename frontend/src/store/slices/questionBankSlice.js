import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchCategories = createAsyncThunk(
  'questionBank/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/question-bank/categories');
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories.');
    }
  }
);

export const createCategory = createAsyncThunk(
  'questionBank/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/question-bank/categories', categoryData);
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category.');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'questionBank/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/question-bank/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category.');
    }
  }
);

export const fetchBankQuestions = createAsyncThunk(
  'questionBank/fetchBankQuestions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/question-bank/questions', { params });
      return response.data.questions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bank questions.');
    }
  }
);

export const createBankQuestion = createAsyncThunk(
  'questionBank/createBankQuestion',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/question-bank/questions', questionData);
      return response.data.question;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save question to bank.');
    }
  }
);

export const importFromBankToTest = createAsyncThunk(
  'questionBank/importFromBankToTest',
  async ({ testId, questionIds }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/question-bank/import-to-test', { testId, questionIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to import questions to test.');
    }
  }
);

export const addRandomPoolToTest = createAsyncThunk(
  'questionBank/addRandomPoolToTest',
  async (poolData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/question-bank/add-random-pool', poolData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add random question pool.');
    }
  }
);

const questionBankSlice = createSlice({
  name: 'questionBank',
  initialState: {
    categories: [],
    questions: [],
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      })
      .addCase(fetchBankQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBankQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload;
      })
      .addCase(fetchBankQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createBankQuestion.fulfilled, (state, action) => {
        state.questions.unshift(action.payload);
      });
  }
});

export default questionBankSlice.reducer;
