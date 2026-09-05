import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { decrementTime } from '../../store/slices/examSlice';
import { ClockCircleOutlined, AlertOutlined } from '@ant-design/icons';

const ExamTimer = ({ onExpire }) => {
  const dispatch = useDispatch();
  const { timeRemainingSeconds, isTimerRunning } = useSelector((state) => state.exam);

  useEffect(() => {
    if (!isTimerRunning) return;

    if (timeRemainingSeconds <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      dispatch(decrementTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, isTimerRunning, timeRemainingSeconds, onExpire]);

  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = timeRemainingSeconds < 120 && timeRemainingSeconds > 0; // Less than 2 mins

  return (
    <div className={`exam-timer-badge ${isLowTime ? 'exam-timer-warning' : ''}`}>
      {isLowTime ? <AlertOutlined /> : <ClockCircleOutlined />}
      <span>{formattedTime}</span>
    </div>
  );
};

export default ExamTimer;
