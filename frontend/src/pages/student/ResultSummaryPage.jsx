import React, { useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Divider,
  Spin,
  Alert,
  Empty,
  Breadcrumb,
  Space
} from 'antd';
import {
  TrophyOutlined,
  TrophyFilled,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  FileDoneOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchSubmissionById, clearCurrentSubmission } from '../../store/slices/submissionSlice';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const ResultSummaryPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentSubmission, isLoading, error } = useSelector((state) => state.submission);
  const { user } = useSelector((state) => state.auth);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    dispatch(clearCurrentSubmission());
    if (id) {
      dispatch(fetchSubmissionById(id)).then((action) => {
        if (fetchSubmissionById.fulfilled.match(action)) {
          if (action.payload.is_passed) {
            // Trigger celebration confetti
            try {
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
              });
            } catch (e) {
              // ignore
            }
          }
        }
      });
    }
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Spin size="large" />
        <div style={{ fontWeight: 600, color: '#475569', fontSize: '15px' }}>Loading Assessment Score Report...</div>
      </div>
    );
  }

  if (error || !currentSubmission) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <Card style={{ borderRadius: '16px', padding: '32px' }}>
          <Empty
            description={
              <div>
                <Title level={4} style={{ color: '#0f172a', margin: '0 0 8px 0' }}>
                  Score Report Unavailable
                </Title>
                <Text type="secondary">
                  {error || "Could not retrieve the requested assessment submission."}
                </Text>
              </div>
            }
          />
          <Button
            type="primary"
            onClick={() => navigate(isTeacher ? '/teacher' : '/student')}
            style={{ marginTop: '20px', borderRadius: '8px', fontWeight: 600 }}
          >
            Return to {isTeacher ? 'Teacher Dashboard' : 'My Assessments'}
          </Button>
        </Card>
      </div>
    );
  }

  const isPassed = currentSubmission.is_passed;
  const timeMinutes = Math.floor((currentSubmission.time_taken_seconds || 0) / 60);
  const timeSecs = (currentSubmission.time_taken_seconds || 0) % 60;
  const test = currentSubmission.test;
  const answers = currentSubmission.answers || [];
  const allowReview = test ? test.allow_review !== false : true;

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        style={{ marginBottom: '14px' }}
        items={[
          { title: <Link to={isTeacher ? '/teacher' : '/student'}>{isTeacher ? 'Instructor Portal' : 'Assessments'}</Link> },
          { title: isTeacher ? <Link to={`/teacher/test/${currentSubmission.test_id}/submissions`}>Submissions</Link> : <Link to="/student/history">Gradebook</Link> },
          { title: 'Score Report' }
        ]}
      />

      {/* Result Hero Banner */}
      <Card
        style={{
          borderRadius: '16px',
          background: isPassed
            ? 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)'
            : 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: isPassed
            ? '0 8px 16px -4px rgba(5, 150, 105, 0.2)'
            : '0 8px 16px -4px rgba(225, 29, 72, 0.2)',
          marginBottom: '18px',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '16px', marginBottom: '8px' }}>
              {isPassed ? <TrophyFilled style={{ color: '#fef08a', fontSize: '12px' }} /> : <InfoCircleOutlined style={{ color: '#ffffff', fontSize: '12px' }} />}
              <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {isPassed ? 'Assessment Passed' : 'Assessment Completed'}
              </span>
            </div>
            <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>
              {isPassed ? 'Congratulations! You Passed 🎉' : 'Needs Practice / Retake'}
            </div>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', margin: 0, fontWeight: 500 }}>
              {test?.title || 'Assessment'} • Passing Mark: {test?.pass_percentage || 50}%
            </Paragraph>
          </div>

          {/* Final Score Stat Box */}
          <div
            style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '10px 20px',
              borderRadius: '14px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              minWidth: '130px'
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
              Final Score
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1.1, color: '#ffffff', margin: '2px 0' }}>
              {currentSubmission.percentage}%
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
              {currentSubmission.score_obtained} / {currentSubmission.max_score} Marks
            </div>
          </div>
        </div>

        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '14px 0' }} />

        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>ACCURACY</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginTop: '1px' }}>
              {currentSubmission.correct_answers_count} / {currentSubmission.total_questions} Questions
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>TIME TAKEN</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ClockCircleOutlined /> {timeMinutes}m {timeSecs}s
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>STUDENT</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {currentSubmission.student?.name || user?.name || 'Student'}
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>SUBMITTED ON</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
              {dayjs(currentSubmission.submitted_at).format('MMM DD, YYYY HH:mm')}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Action Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <Button
          size="middle"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(isTeacher ? `/teacher/test/${currentSubmission.test_id}/submissions` : '/student')}
          style={{ borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
        >
          Back to {isTeacher ? 'Test Submissions' : 'Available Tests'}
        </Button>

        <Space size="small">
          {!isTeacher && (
            <Button
              size="middle"
              icon={<HistoryOutlined />}
              onClick={() => navigate('/student/history')}
              style={{ borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
            >
              Gradebook
            </Button>
          )}

          {!isPassed && !isTeacher && (
            <Button
              size="middle"
              type="primary"
              onClick={() => navigate(`/student/exam/${currentSubmission.test_id}`)}
              style={{ borderRadius: '8px', fontWeight: 700, background: '#4f46e5', fontSize: '13px' }}
            >
              Retake Assessment
            </Button>
          )}
        </Space>
      </div>

      {/* Question Review Section */}
      {!allowReview && !isTeacher ? (
        <Alert
          type="info"
          showIcon
          message="Detailed Review Disabled"
          description="The instructor has disabled question-by-question review for this quiz. Your final marks and completion status are recorded above."
          style={{ borderRadius: '12px' }}
        />
      ) : (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
              Question-by-Question Solution Review ({answers.length})
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Green highlights indicate correct answers. Explanations provided by the instructor are displayed below each question.
            </Text>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {answers.map((ans, idx) => {
              const q = ans.question;
              const selectedOptionIds = (ans.selected_option_ids || []).map(Number);

              return (
                <Card
                  key={ans.id || idx}
                  style={{
                    borderRadius: '16px',
                    border: `1.5px solid ${ans.is_correct ? '#86efac' : '#fca5a5'}`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                  }}
                  bodyStyle={{ padding: '22px' }}
                >
                  {/* Header: Question Number + Correctness Tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: ans.is_correct ? '#10b981' : '#ef4444',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 800
                        }}
                      >
                        Q{idx + 1}
                      </span>
                      <Tag
                        color={ans.is_correct ? 'success' : 'error'}
                        style={{ fontWeight: 700, borderRadius: '6px', fontSize: '12px' }}
                      >
                        {ans.is_correct ? `+${ans.points_awarded} pts` : `0 / ${q?.points || 1} pts`}
                      </Tag>
                    </div>

                    {ans.is_correct ? (
                      <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                        <CheckCircleFilled style={{ fontSize: '16px' }} /> Correct Answer
                      </span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                        <CloseCircleFilled style={{ fontSize: '16px' }} /> Incorrect Choice
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px', lineHeight: 1.5 }}>
                    {q?.question_text}
                  </div>

                  {/* Options List */}
                  {q?.options && q.options.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {q.options.map((opt) => {
                        const isSelectedByStudent = selectedOptionIds.includes(Number(opt.id));
                        const isActuallyCorrect = !!opt.is_correct;

                        let bg = '#ffffff';
                        let border = '#e2e8f0';
                        let textCol = '#334155';

                        if (isActuallyCorrect) {
                          bg = '#ecfdf5';
                          border = '#10b981';
                          textCol = '#065f46';
                        } else if (isSelectedByStudent && !isActuallyCorrect) {
                          bg = '#fef2f2';
                          border = '#ef4444';
                          textCol = '#991b1b';
                        }

                        return (
                          <div
                            key={opt.id}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: `1.5px solid ${border}`,
                              backgroundColor: bg,
                              color: textCol,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '14px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontWeight: isActuallyCorrect || isSelectedByStudent ? 700 : 400 }}>
                              {opt.option_text}
                            </span>

                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {isSelectedByStudent && (
                                <Tag color="blue" style={{ fontSize: '11px', margin: 0, borderRadius: '4px', fontWeight: 700 }}>
                                  Your Choice
                                </Tag>
                              )}
                              {isActuallyCorrect && (
                                <Tag color="green" style={{ fontSize: '11px', margin: 0, borderRadius: '4px', fontWeight: 700 }}>
                                  ✓ Correct Option
                                </Tag>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Answer text */}
                  {q?.question_type === 'short_answer' && (
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600 }}>Your submitted text: </Text>
                        <span style={{ fontWeight: 800, color: ans.is_correct ? '#16a34a' : '#dc2626' }}>
                          "{ans.text_answer || '(Empty)'}"
                        </span>
                      </div>
                      <div style={{ marginTop: '6px' }}>
                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 600 }}>Expected answer: </Text>
                        <span style={{ fontWeight: 800, color: '#16a34a' }}>
                          "{q.correct_answer_text}"
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Explanation Section */}
                  {q?.explanation && (
                    <div style={{ padding: '12px 16px', background: '#eef2ff', borderRadius: '10px', borderLeft: '3px solid #6366f1' }}>
                      <Text strong style={{ color: '#4338ca', fontSize: '13px' }}>Instructor Explanation: </Text>
                      <span style={{ color: '#3730a3', fontSize: '13px' }}>{q.explanation}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultSummaryPage;
