import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchMyCertificates = createAsyncThunk(
  'gamification/fetchMyCertificates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/gamification/my-certificates');
      return response.data.certificates;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch certificates.');
    }
  }
);

export const fetchMyBadges = createAsyncThunk(
  'gamification/fetchMyBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/gamification/my-badges');
      return response.data.badges;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch badges.');
    }
  }
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState: {
    certificates: [],
    badges: [],
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload;
      })
      .addCase(fetchMyBadges.fulfilled, (state, action) => {
        state.badges = action.payload;
      });
  }
});

export default gamificationSlice.reducer;
