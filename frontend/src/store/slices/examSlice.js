import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  test: null, // Full test metadata and questions
  startedAt: null,
  answers: {}, // { [questionId]: { selectedOptionIds, textAnswer, matchingAnswers, numericalAnswer, clozeAnswers, essayAnswer, orderingAnswer } }
  flaggedQuestionIds: [], // array of questionIds marked for review
  currentQuestionIndex: 0,
  timeRemainingSeconds: 0,
  isTimerRunning: false,
  isSubmitted: false,
  proctoringViolationsCount: 0,
  proctoringLogs: [],
  requiresPasswordModal: false
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    initExam: (state, action) => {
      const test = action.payload;
      state.test = test;
      state.startedAt = new Date().toISOString();
      state.answers = {};
      state.flaggedQuestionIds = [];
      state.currentQuestionIndex = 0;
      state.timeRemainingSeconds = (test.duration_minutes || 30) * 60;
      state.isTimerRunning = true;
      state.isSubmitted = false;
      state.proctoringViolationsCount = 0;
      state.proctoringLogs = [];
      state.requiresPasswordModal = false;
    },
    selectSingleOption: (state, action) => {
      const { questionId, optionId } = action.payload;
      state.answers[questionId] = {
        ...(state.answers[questionId] || {}),
        selectedOptionIds: [optionId]
      };
    },
    toggleMultiOption: (state, action) => {
      const { questionId, optionId } = action.payload;
      const current = state.answers[questionId]?.selectedOptionIds || [];
      const exists = current.includes(optionId);
      const nextIds = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      state.answers[questionId] = {
        ...(state.answers[questionId] || {}),
        selectedOptionIds: nextIds
      };
    },
    setShortAnswerText: (state, action) => {
      const { questionId, text } = action.payload;
      state.answers[questionId] = {
        ...(state.answers[questionId] || {}),
        textAnswer: text
      };
    },
    setMatchingAnswer: (state, action) => {
      const { questionId, leftId, rightValue } = action.payload;
      const currentMatches = state.answers[questionId]?.matchingAnswers || {};
      state.answers[questionId] = {
        ...(state.answers[questionId] || {}),
        matchingAnswers: {
          ...currentMatches,
          [leftId]: rightValue
        }
      };
    },
    setNumericalAnswer: (state, action) => {
      const { questionId, value } = action.payload;
      state.answers[questionId] = {
        ...(state.answers[questionId] || {}),
        numericalAnswer: value
      };
    },
    setClozeAnswer: (state, action) => {
      const { questionId, blankKey, value } = action.payload;
      const currentCloze = state.answers[questionId]?.clozeAnswers || {};
      state.answers[questionId] = {
        ...(state.answers[questionId] || {}),
        clozeAnswers: {
          ...currentCloze,
          [blankKey]: value
        }
      };
    },
    setEssayAnswer: (state, action) => {
      const { questionId, text } = action.payload;
      state.answers[questionId] = {
        ...(state.answers[questionId] || {}),
        essayAnswer: text
      };
    },
    setOrderingAnswer: (state, action) => {
      const { questionId, orderedItems } = action.payload;
      state.answers[questionId] = {
        ...(state.answers[questionId] || {}),
        orderingAnswer: orderedItems
      };
    },
    clearAnswer: (state, action) => {
      const questionId = action.payload;
      delete state.answers[questionId];
    },
    toggleFlagQuestion: (state, action) => {
      const questionId = action.payload;
      if (state.flaggedQuestionIds.includes(questionId)) {
        state.flaggedQuestionIds = state.flaggedQuestionIds.filter((id) => id !== questionId);
      } else {
        state.flaggedQuestionIds.push(questionId);
      }
    },
    setCurrentIndex: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    nextQuestion: (state) => {
      if (state.test && state.currentQuestionIndex < state.test.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    prevQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    recordProctoringViolation: (state, action) => {
      const violation = action.payload;
      state.proctoringViolationsCount += 1;
      state.proctoringLogs.push({
        timestamp: new Date().toISOString(),
        ...violation
      });
    },
    decrementTime: (state) => {
      if (state.timeRemainingSeconds > 0) {
        state.timeRemainingSeconds -= 1;
      } else {
        state.isTimerRunning = false;
      }
    },
    addExtraSeconds: (state, action) => {
      state.timeRemainingSeconds += action.payload;
    },
    markExamSubmitted: (state) => {
      state.isTimerRunning = false;
      state.isSubmitted = true;
    },
    setRequiresPasswordModal: (state, action) => {
      state.requiresPasswordModal = action.payload;
    },
    resetExam: () => initialState
  }
});

export const {
  initExam,
  selectSingleOption,
  toggleMultiOption,
  setShortAnswerText,
  setMatchingAnswer,
  setNumericalAnswer,
  setClozeAnswer,
  setEssayAnswer,
  setOrderingAnswer,
  clearAnswer,
  toggleFlagQuestion,
  setCurrentIndex,
  nextQuestion,
  prevQuestion,
  recordProctoringViolation,
  decrementTime,
  addExtraSeconds,
  markExamSubmitted,
  setRequiresPasswordModal,
  resetExam
} = examSlice.actions;

export default examSlice.reducer;
