import React, { useEffect, useState, useCallback } from 'react';
import {
  Layout,
  Typography,
  Button,
  Row,
  Col,
  Progress,
  Modal,
  Space,
  Tag,
  Spin,
  message,
  Alert,
  Input
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  FlagFilled,
  LockOutlined,
  SafetyCertificateOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTestById } from '../../store/slices/testSlice';
import {
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
  markExamSubmitted,
  resetExam
} from '../../store/slices/examSlice';
import { submitExam } from '../../store/slices/submissionSlice';
import { logViolation } from '../../store/slices/proctoringSlice';
import QuestionViewer from '../../components/student/QuestionViewer';
import QuestionPalette from '../../components/student/QuestionPalette';
import ExamTimer from '../../components/student/ExamTimer';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const ExamPage = () => {
  const { testId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentTest, isLoading } = useSelector((state) => state.test);
  const {
    test,
    answers,
    flaggedQuestionIds,
    currentQuestionIndex,
    startedAt,
    timeRemainingSeconds,
    proctoringViolationsCount
  } = useSelector((state) => state.exam);
  const { isSubmitting } = useSelector((state) => state.submission);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isViolationWarningOpen, setIsViolationWarningOpen] = useState(false);

  // Initialize Exam with password check if needed
  const loadExam = useCallback((pwd = '') => {
    dispatch(fetchTestById({ id: testId, password: pwd })).then((action) => {
      if (fetchTestById.fulfilled.match(action)) {
        dispatch(initExam(action.payload));
        setIsPasswordModalOpen(false);
      } else if (action.payload?.requiresPassword || action.error?.message?.includes('password')) {
        setIsPasswordModalOpen(true);
      }
    });
  }, [dispatch, testId]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  // Tab switch & Focus loss proctoring integrity detector
  useEffect(() => {
    if (!test || !test.enable_proctoring) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch(recordProctoringViolation({ type: 'tab_switch', detail: 'User switched browser tab or minimized window' }));
        dispatch(logViolation({ testId, violationType: 'tab_switch', details: 'Window blur / tab changed' }));
        setIsViolationWarningOpen(true);
      }
    };

    const handleWindowBlur = () => {
      dispatch(recordProctoringViolation({ type: 'focus_loss', detail: 'Browser window lost focus' }));
      dispatch(logViolation({ testId, violationType: 'focus_loss', details: 'Window blur' }));
      setIsViolationWarningOpen(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [test, testId, dispatch]);

  if (isLoading || !test || !test.questions) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Spin size="large" tip="Preparing Exam Room..." />
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const answeredQuestionsCount = Object.keys(answers || {}).filter((qId) => {
    const ans = answers[qId];
    return (
      (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
      (ans?.textAnswer && ans.textAnswer.trim().length > 0) ||
      (ans?.matchingAnswers && Object.keys(ans.matchingAnswers).length > 0) ||
      (ans?.numericalAnswer !== undefined && ans?.numericalAnswer !== null) ||
      (ans?.clozeAnswers && Object.keys(ans.clozeAnswers).length > 0) ||
      (ans?.essayAnswer && ans.essayAnswer.trim().length > 0) ||
      (ans?.orderingAnswer && ans.orderingAnswer.length > 0)
    );
  }).length;

  const unansweredQuestionsCount = totalQuestions - answeredQuestionsCount;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  // Submit test handler
  const handleSubmitExam = async () => {
    const formattedAnswers = questions.map((q) => {
      const studentAns = answers[q.id];
      return {
        question_id: q.id,
        selected_option_ids: studentAns?.selectedOptionIds || [],
        text_answer: studentAns?.textAnswer || '',
        matching_answers: studentAns?.matchingAnswers || null,
        numerical_answer: studentAns?.numericalAnswer !== undefined ? studentAns.numericalAnswer : null,
        cloze_answers: studentAns?.clozeAnswers || null,
        essay_answer: studentAns?.essayAnswer || '',
        ordering_answer: studentAns?.orderingAnswer || null
      };
    });

    const totalSecondsSpent = (test.duration_minutes * 60) - (timeRemainingSeconds > 0 ? timeRemainingSeconds : 0);

    const resultAction = await dispatch(
      submitExam({
        testId: test.id,
        answers: formattedAnswers,
        time_taken_seconds: Math.max(1, totalSecondsSpent),
        started_at: startedAt,
        proctoring_violations_count: proctoringViolationsCount
      })
    );

    if (submitExam.fulfilled.match(resultAction)) {
      dispatch(markExamSubmitted());
      message.success('Assessment submitted and graded successfully!');
      setIsSubmitModalOpen(false);
      navigate(`/student/result/${resultAction.payload.submission.id}`, { replace: true });
    } else {
      message.error(resultAction.payload || 'Failed to submit exam.');
    }
  };

  const handleTimeExpire = () => {
    message.warning({
      content: 'Time has expired! Submitting your answers automatically...',
      duration: 3
    });
    handleSubmitExam();
  };

  return (
    <Layout className="exam-layout">
      {/* Sticky Exam Room Top Navigation */}
      <Header
        className="glass-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          height: '64px',
          lineHeight: 'normal',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setIsExitModalOpen(true)}
            style={{ color: '#64748b' }}
          >
            Exit Exam
          </Button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                {test.title}
              </span>
              {test.enable_proctoring && (
                <Tag color={proctoringViolationsCount > 0 ? 'error' : 'success'} icon={<SafetyCertificateOutlined />}>
                  {proctoringViolationsCount > 0 ? `${proctoringViolationsCount} Warning(s)` : 'Proctored Room'}
                </Tag>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Question {currentQuestionIndex + 1} of {totalQuestions} · {test.category}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Countdown Timer */}
          <ExamTimer onExpire={handleTimeExpire} />

          {/* Submit Exam Button */}
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setIsSubmitModalOpen(true)}
            style={{
              borderRadius: '10px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderColor: '#10b981',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}
          >
            Submit Exam
          </Button>
        </div>
      </Header>

      {/* Progress Bar under Header */}
      <Progress
        percent={progressPercent}
        showInfo={false}
        strokeColor="#4f46e5"
        style={{ margin: 0, lineHeight: 0 }}
        strokeLinecap="square"
      />

      <Content style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        <Row gutter={[24, 24]}>
          {/* Main Question Viewer Column */}
          <Col xs={24} lg={17}>
            <QuestionViewer
              question={currentQuestion}
              currentIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              studentAnswer={answers[currentQuestion?.id]}
              isFlagged={flaggedQuestionIds.includes(currentQuestion?.id)}
              onSelectSingle={(qId, optId) => dispatch(selectSingleOption({ questionId: qId, optionId: optId }))}
              onToggleMulti={(qId, optId) => dispatch(toggleMultiOption({ questionId: qId, optionId: optId }))}
              onSetShortAnswer={(qId, text) => dispatch(setShortAnswerText({ questionId: qId, text }))}
              onSetMatching={(qId, leftId, rightValue) => dispatch(setMatchingAnswer({ questionId: qId, leftId, rightValue }))}
              onSetNumerical={(qId, value) => dispatch(setNumericalAnswer({ questionId: qId, value }))}
              onSetCloze={(qId, blankKey, value) => dispatch(setClozeAnswer({ questionId: qId, blankKey, value }))}
              onSetEssay={(qId, text) => dispatch(setEssayAnswer({ questionId: qId, text }))}
              onSetOrdering={(qId, orderedItems) => dispatch(setOrderingAnswer({ questionId: qId, orderedItems }))}
              onClearAnswer={(qId) => dispatch(clearAnswer(qId))}
              onToggleFlag={() => dispatch(toggleFlagQuestion(currentQuestion?.id))}
              onNext={() => dispatch(nextQuestion())}
              onPrev={() => dispatch(prevQuestion())}
              onSubmitModal={() => setIsSubmitModalOpen(true)}
            />
          </Col>

          {/* Right Question Palette Sidebar */}
          <Col xs={24} lg={7}>
            <QuestionPalette
              questions={questions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              flaggedIds={flaggedQuestionIds}
              onSelectQuestion={(index) => dispatch(setCurrentIndex(index))}
            />
          </Col>
        </Row>
      </Content>

      {/* Proctoring Focus Loss Warning Modal */}
      <Modal
        title={
          <span style={{ color: '#dc2626', fontWeight: 800 }}>
            <WarningOutlined /> Proctoring Security Warning #{proctoringViolationsCount}
          </span>
        }
        open={isViolationWarningOpen}
        onOk={() => setIsViolationWarningOpen(false)}
        okText="I Understand, Return to Exam"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <Alert
          type="error"
          showIcon
          message="Focus loss / Tab switch detected"
          description="Your examination session has recorded an out-of-focus event. Please remain on the exam screen to prevent disqualification."
          style={{ margin: '14px 0' }}
        />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Total Violations on Record: <strong>{proctoringViolationsCount} / {test.max_proctoring_violations || 3} allowed</strong>
        </Text>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        title={<span style={{ fontWeight: 800, fontSize: '18px' }}>Submit Assessment Confirmation</span>}
        open={isSubmitModalOpen}
        onCancel={() => setIsSubmitModalOpen(false)}
        onOk={handleSubmitExam}
        confirmLoading={isSubmitting}
        okText="Yes, Submit Exam"
        cancelText="Return to Questions"
        okButtonProps={{
          style: { background: '#10b981', borderColor: '#10b981', fontWeight: 700 }
        }}
      >
        <div style={{ marginTop: '16px' }}>
          {unansweredQuestionsCount > 0 && (
            <Alert
              type="warning"
              showIcon
              icon={<ExclamationCircleOutlined />}
              message={`You have ${unansweredQuestionsCount} unanswered question${unansweredQuestionsCount > 1 ? 's' : ''}!`}
              description="Are you sure you want to finish and submit now? Unanswered questions will receive 0 marks."
              style={{ marginBottom: '16px' }}
            />
          )}

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: '12px' }}>ANSWERED</Text>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5' }}>
                  {answeredQuestionsCount}
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: '12px' }}>FLAGGED</Text>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>
                  {flaggedQuestionIds.length}
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: '12px' }}>UNANSWERED</Text>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>
                  {unansweredQuestionsCount}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>

      {/* Exit Exam Modal */}
      <Modal
        title="Leave Assessment?"
        open={isExitModalOpen}
        onCancel={() => setIsExitModalOpen(false)}
        onOk={() => {
          dispatch(resetExam());
          navigate('/student');
        }}
        okText="Exit to Dashboard"
        okButtonProps={{ danger: true }}
      >
        <p>If you leave now, your current answers will not be saved as a completed submission.</p>
      </Modal>

      {/* Access Password Modal */}
      <Modal
        title={<span style={{ fontWeight: 800 }}><LockOutlined /> Test Access Passcode Required</span>}
        open={isPasswordModalOpen}
        onOk={() => loadExam(enteredPassword)}
        okText="Unlock Assessment"
        closable={false}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <Paragraph>This assessment is locked with an access key. Please enter the passcode provided by your instructor:</Paragraph>
        <Input.Password
          placeholder="Enter access code"
          value={enteredPassword}
          onChange={(e) => setEnteredPassword(e.target.value)}
          size="large"
        />
      </Modal>
    </Layout>
  );
};

export default ExamPage;
