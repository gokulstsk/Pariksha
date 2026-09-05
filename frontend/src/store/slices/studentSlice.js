import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Fetch all enrolled students
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/users/students');
      return response.data.students;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load students.');
    }
  }
);

// Create / Enroll a new student
export const createStudent = createAsyncThunk(
  'students/createStudent',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/users/students', { name, email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to enroll student.');
    }
  }
);

// Update student details
export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ id, name, email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/users/students/${id}`, { name, email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update student.');
    }
  }
);

// Delete student
export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(`/users/students/${id}`);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete student.');
    }
  }
);

const studentSlice = createSlice({
  name: 'students',
  initialState: {
    students: [],
    isLoading: false,
    error: null,
    actionLoading: false,
    actionError: null
  },
  reducers: {
    clearStudentErrors: (state) => {
      state.error = null;
      state.actionError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchStudents
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // createStudent
      .addCase(createStudent.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload.student) {
          state.students.unshift(action.payload.student);
        }
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // updateStudent
      .addCase(updateStudent.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload.student;
        if (updated) {
          const index = state.students.findIndex((s) => s.id === updated.id);
          if (index !== -1) {
            state.students[index] = { ...state.students[index], ...updated };
          }
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // deleteStudent
      .addCase(deleteStudent.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.students = state.students.filter((s) => s.id !== action.payload.id);
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  }
});

export const { clearStudentErrors } = studentSlice.actions;
export default studentSlice.reducer;
