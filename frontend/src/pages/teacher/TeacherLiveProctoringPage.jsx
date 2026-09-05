import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Select,
  Space,
  Avatar,
  Modal,
  Empty,
  Spin,
  message,
  Popconfirm,
  Badge
} from 'antd';
import {
  EyeOutlined,
  ClockCircleOutlined,
  ExclamationCircleFilled,
  PlusCircleOutlined,
  StopOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLiveSession,
  grantExtraTime,
  forceSubmitSession
} from '../../store/slices/proctoringSlice';
import { fetchTests } from '../../store/slices/testSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const TeacherLiveProctoringPage = () => {
  const dispatch = useDispatch();
  const { tests } = useSelector((state) => state.test);
  const { liveTest, sessions, isLoading } = useSelector((state) => state.proctoring);

  const [selectedTestId, setSelectedTestId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchTests()).then((action) => {
      if (fetchTests.fulfilled.match(action) && action.payload.length > 0) {
        setSelectedTestId(action.payload[0].id);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (selectedTestId) {
      dispatch(fetchLiveSession(selectedTestId));
      const interval = setInterval(() => {
        dispatch(fetchLiveSession(selectedTestId));
      }, 5000); // 5s auto-polling
      return () => clearInterval(interval);
    }
  }, [dispatch, selectedTestId]);

  const handleAddExtraTime = async (submissionId, minutes) => {
    setActionLoading(true);
    const resultAction = await dispatch(grantExtraTime({ submissionId, extra_minutes: minutes }));
    setActionLoading(false);

    if (grantExtraTime.fulfilled.match(resultAction)) {
      message.success(`Granted +${minutes} minutes extra time!`);
      if (selectedTestId) dispatch(fetchLiveSession(selectedTestId));
    }
  };

  const handleForceSubmit = async (submissionId, disqualify = false) => {
    setActionLoading(true);
    const resultAction = await dispatch(forceSubmitSession({ submissionId, disqualify }));
    setActionLoading(false);

    if (forceSubmitSession.fulfilled.match(resultAction)) {
      message.success(disqualify ? 'Exam attempt disqualified.' : 'Exam force-submitted.');
      if (selectedTestId) dispatch(fetchLiveSession(selectedTestId));
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            🛡️ Real-Time Live Exam Proctoring Monitor
          </Title>
          <Text type="secondary" style={{ fontSize: '13.5px' }}>
            Track active student attempts, inspect focus-loss tab switch warnings, grant extra time, or force submit.
          </Text>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Text strong style={{ color: '#475569' }}>Active Exam:</Text>
          <Select
            value={selectedTestId}
            onChange={(val) => setSelectedTestId(val)}
            style={{ width: '280px' }}
            options={tests.map((t) => ({ label: `${t.title} (${t.duration_minutes}m)`, value: t.id }))}
          />
        </div>
      </div>

      {/* Live Status Bar */}
      {liveTest && (
        <Card
          style={{
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff'
          }}
          bodyStyle={{ padding: '20px 24px' }}
        >
          <Row gutter={20} align="middle">
            <Col xs={24} md={12}>
              <Tag color="cyan" style={{ fontWeight: 700, marginBottom: '6px' }}>ACTIVE EXAM SESSION</Tag>
              <Title level={4} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
                {liveTest.title}
              </Title>
              <Text style={{ color: '#cbd5e1', fontSize: '12px' }}>
                Duration: {liveTest.duration_minutes} Minutes · Safe Exam Tab-Switch Monitoring: Active
              </Text>
            </Col>

            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Space size="large">
                <div>
                  <Text style={{ color: '#94a3b8', fontSize: '11px', display: 'block', fontWeight: 700 }}>STUDENT ATTEMPTS</Text>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>
                    {sessions.length}
                  </span>
                </div>
                <div>
                  <Text style={{ color: '#94a3b8', fontSize: '11px', display: 'block', fontWeight: 700 }}>VIOLATION LIMIT</Text>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#f87171' }}>
                    {liveTest.max_proctoring_violations} Max
                  </span>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Student Sessions Grid */}
      {isLoading && !sessions.length ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Connecting to Live Exam Stream..." />
        </div>
      ) : sessions.length === 0 ? (
        <Card style={{ borderRadius: '14px', textAlign: 'center', padding: '50px' }}>
          <Empty description="No students have attempted or started this assessment yet." />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {sessions.map((sub) => {
            const hasViolations = (sub.proctoring_violations_count || 0) > 0;
            const isCompleted = sub.status === 'completed';
            const isDisqualified = sub.status === 'disqualified';

            return (
              <Col xs={24} md={12} lg={8} key={sub.id}>
                <Card
                  style={{
                    borderRadius: '14px',
                    border: isDisqualified
                      ? '2px solid #ef4444'
                      : hasViolations
                      ? '2px solid #f59e0b'
                      : '1px solid #e2e8f0',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                  }}
                  bodyStyle={{ padding: '18px 20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar size={34} icon={<UserOutlined />} style={{ backgroundColor: '#4f46e5' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                          {sub.student?.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Attempt #{sub.attempt_number || 1}
                        </div>
                      </div>
                    </div>

                    <Tag color={isDisqualified ? 'error' : isCompleted ? 'success' : 'processing'}>
                      {isDisqualified ? 'DISQUALIFIED' : isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                    </Tag>
                  </div>

                  {/* Proctoring Warning Badge */}
                  <div style={{ margin: '12px 0' }}>
                    {hasViolations ? (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ExclamationCircleFilled style={{ color: '#d97706', fontSize: '16px' }} />
                        <div>
                          <strong style={{ fontSize: '12px', color: '#92400e' }}>
                            {sub.proctoring_violations_count} Tab-Switch Violation(s)
                          </strong>
                          <div style={{ fontSize: '11px', color: '#b45309' }}>Focus loss recorded by proctor engine</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircleOutlined style={{ color: '#16a34a' }} />
                        <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Integrity Normal (0 Warnings)</span>
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>Started: {dayjs(sub.started_at).format('h:mm A')}</span>
                    {sub.score_obtained !== null && <strong>Score: {sub.score_obtained}/{sub.max_score} ({sub.percentage}%)</strong>}
                  </div>

                  {/* Proctoring Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <Space size="small">
                      <Button
                        size="small"
                        icon={<PlusCircleOutlined />}
                        onClick={() => handleAddExtraTime(sub.id, 5)}
                        disabled={isCompleted || isDisqualified}
                      >
                        +5m Time
                      </Button>
                      <Button
                        size="small"
                        icon={<PlusCircleOutlined />}
                        onClick={() => handleAddExtraTime(sub.id, 10)}
                        disabled={isCompleted || isDisqualified}
                      >
                        +10m
                      </Button>
                    </Space>

                    <Popconfirm
                      title="Disqualify this attempt due to exam integrity violation?"
                      onConfirm={() => handleForceSubmit(sub.id, true)}
                      okText="Disqualify"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button size="small" danger icon={<StopOutlined />} disabled={isDisqualified}>
                        Disqualify
                      </Button>
                    </Popconfirm>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default TeacherLiveProctoringPage;
