import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchAnnouncements = createAsyncThunk(
  'communication/fetchAnnouncements',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/communication/announcements', { params });
      return response.data.announcements;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch announcements.');
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'communication/createAnnouncement',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/communication/announcements', data);
      return response.data.announcement;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create announcement.');
    }
  }
);

export const fetchForumTopics = createAsyncThunk(
  'communication/fetchForumTopics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/communication/forums', { params });
      return response.data.topics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch forum topics.');
    }
  }
);

export const fetchTopicById = createAsyncThunk(
  'communication/fetchTopicById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/communication/forums/${id}`);
      return response.data.topic;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch topic details.');
    }
  }
);

export const createTopic = createAsyncThunk(
  'communication/createTopic',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/communication/forums', data);
      return response.data.topic;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create topic.');
    }
  }
);

export const replyToTopic = createAsyncThunk(
  'communication/replyToTopic',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/communication/forums/${id}/reply`, { content });
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to post reply.');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'communication/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/communication/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications.');
    }
  }
);

export const markPostAsAccepted = createAsyncThunk(
  'communication/markPostAsAccepted',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/communication/forums/posts/${postId}/accept`);
      return response.data.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark accepted solution.');
    }
  }
);

export const markNotificationsRead = createAsyncThunk(
  'communication/markNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/communication/notifications/mark-read');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notifications read.');
    }
  }
);

const communicationSlice = createSlice({
  name: 'communication',
  initialState: {
    announcements: [],
    topics: [],
    currentTopic: null,
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
      })
      .addCase(fetchForumTopics.fulfilled, (state, action) => {
        state.topics = action.payload;
      })
      .addCase(fetchTopicById.fulfilled, (state, action) => {
        state.currentTopic = action.payload;
      })
      .addCase(replyToTopic.fulfilled, (state, action) => {
        if (state.currentTopic) {
          state.currentTopic.posts = state.currentTopic.posts || [];
          state.currentTopic.posts.push(action.payload);
        }
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications = state.notifications.map((n) => ({ ...n, is_read: true }));
      });
  }
});

export default communicationSlice.reducer;
