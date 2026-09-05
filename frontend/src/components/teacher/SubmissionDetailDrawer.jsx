import React from 'react';
import { Drawer, Typography, Tag, Card, Row, Col, Divider, Space, Badge } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const SubmissionDetailDrawer = ({ open, onClose, submission }) => {
  if (!submission) return null;

  const isPassed = submission.is_passed;
  const timeMinutes = Math.floor((submission.time_taken_seconds || 0) / 60);
  const timeSecs = (submission.time_taken_seconds || 0) % 60;

  return (
    <Drawer
      title={<span style={{ fontWeight: 700, fontSize: '18px' }}>Student Submission Review</span>}
      placement="right"
      width={720}
      onClose={onClose}
      open={open}
    >
      {/* Student & Score Header Banner */}
      <Card
        style={{
          borderRadius: '16px',
          background: isPassed
            ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
            : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          borderColor: isPassed ? '#a7f3d0' : '#fecaca',
          marginBottom: '24px'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined style={{ fontSize: '18px', color: '#475569' }} />
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                {submission.student?.name || 'Student'}
              </span>
            </div>
            <Text type="secondary" style={{ fontSize: '13px' }}>{submission.student?.email}</Text>
          </div>

          <Tag
            color={isPassed ? 'success' : 'error'}
            style={{
              fontSize: '14px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontWeight: 700
            }}
          >
            {isPassed ? 'PASSED' : 'FAILED'}
          </Tag>
        </div>

        <Divider style={{ margin: '16px 0', borderColor: 'rgba(0,0,0,0.06)' }} />

        <Row gutter={16}>
          <Col span={6}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>SCORE</Text>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {submission.score_obtained} / {submission.max_score}
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>PERCENTAGE</Text>
            <div style={{ fontSize: '20px', fontWeight: 800, color: isPassed ? '#10b981' : '#ef4444' }}>
              {submission.percentage}%
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>TIME SPENT</Text>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <ClockCircleOutlined /> {timeMinutes}m {timeSecs}s
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>SUBMITTED AT</Text>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
              {dayjs(submission.submitted_at).format('MMM DD, YYYY HH:mm')}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Question by Question Answer Breakdown */}
      <Title level={5} style={{ marginBottom: '16px', fontWeight: 700 }}>
        Detailed Answer Sheet ({submission.answers?.length || 0} Questions)
      </Title>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(submission.answers || []).map((ans, idx) => {
          const q = ans.question;
          const selectedOptionIds = ans.selected_option_ids || [];

          return (
            <Card
              key={ans.id || idx}
              style={{
                borderRadius: '12px',
                borderColor: ans.is_correct ? '#86efac' : '#fca5a5'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: ans.is_correct ? '#10b981' : '#ef4444',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    Q{idx + 1}
                  </span>
                  <Tag color={ans.is_correct ? 'success' : 'error'}>
                    {ans.is_correct ? `+${ans.points_awarded} pts` : '0 pts'}
                  </Tag>
                </div>
                {ans.is_correct ? (
                  <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircleFilled /> Correct
                  </span>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CloseCircleFilled /> Incorrect
                  </span>
                )}
              </div>

              <div style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b', marginBottom: '12px' }}>
                {q?.question_text}
              </div>

              {/* Options */}
              {q?.options && q.options.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {q.options.map((opt) => {
                    const isSelectedByStudent = selectedOptionIds.includes(opt.id);
                    const isActuallyCorrect = opt.is_correct;

                    let bg = '#f8fafc';
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
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: `1.5px solid ${border}`,
                          backgroundColor: bg,
                          color: textCol,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '14px'
                        }}
                      >
                        <span style={{ fontWeight: isActuallyCorrect || isSelectedByStudent ? 600 : 400 }}>
                          {opt.option_text}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {isSelectedByStudent && (
                            <Tag color="blue" style={{ fontSize: '11px', margin: 0 }}>
                              Student's Answer
                            </Tag>
                          )}
                          {isActuallyCorrect && (
                            <Tag color="green" style={{ fontSize: '11px', margin: 0 }}>
                              Correct Option
                            </Tag>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short answer text */}
              {q?.question_type === 'short_answer' && (
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginTop: '8px' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Student Submitted: </Text>
                    <span style={{ fontWeight: 700, color: ans.is_correct ? '#16a34a' : '#dc2626' }}>
                      "{ans.text_answer || '(Empty)'}"
                    </span>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Expected Answer: </Text>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>
                      "{q.correct_answer_text}"
                    </span>
                  </div>
                </div>
              )}

              {/* Explanation */}
              {q?.explanation && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#eef2ff', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <Text strong style={{ color: '#4338ca', fontSize: '13px' }}>Explanation: </Text>
                  <span style={{ color: '#3730a3', fontSize: '13px' }}>{q.explanation}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Drawer>
  );
};

export default SubmissionDetailDrawer;
