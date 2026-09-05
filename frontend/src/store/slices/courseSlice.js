import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/courses');
      return response.data.courses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses.');
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/courses/${id}`);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course details.');
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/courses', courseData);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course.');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/courses/${id}`, data);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course.');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/courses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course.');
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enrollInCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/courses/${courseId}/enroll`);
      return { courseId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enroll in course.');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    currentCourse: null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.currentCourse = action.payload;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c.id !== action.payload);
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        const found = state.courses.find((c) => c.id === Number(action.payload.courseId));
        if (found) {
          found.is_enrolled = true;
        }
      });
  }
});

export const { clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
