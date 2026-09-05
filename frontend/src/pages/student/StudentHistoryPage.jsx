import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  Row,
  Col,
  Breadcrumb,
  Tooltip
} from 'antd';
import {
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ArrowLeftOutlined,
  TrophyOutlined,
  FileDoneOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchMySubmissions, fetchSubmissionById } from '../../store/slices/submissionSlice';
import SubmissionDetailDrawer from '../../components/teacher/SubmissionDetailDrawer';
import StatCard from '../../components/common/StatCard';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const StudentHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mySubmissions, isLoading } = useSelector((state) => state.submission);

  const [drawerSubmission, setDrawerSubmission] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMySubmissions());
  }, [dispatch]);

  const totalAttempts = mySubmissions.length;
  const passedAttempts = mySubmissions.filter((s) => s.is_passed).length;
  const avgScore = totalAttempts > 0
    ? Math.round((mySubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / totalAttempts) * 10) / 10
    : 0;

  const handleQuickPreview = async (subId) => {
    const resultAction = await dispatch(fetchSubmissionById(subId));
    if (fetchSubmissionById.fulfilled.match(resultAction)) {
      setDrawerSubmission(resultAction.payload);
      setIsDrawerOpen(true);
    }
  };

  const columns = [
    {
      title: 'Assessment',
      dataIndex: 'test',
      key: 'test',
      render: (test, record) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
            {test?.title || 'Assessment Quiz'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <Tag color="cyan" style={{ fontSize: '11px', borderRadius: '4px', fontWeight: 600 }}>
              {test?.category || 'General'}
            </Tag>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Pass required: {test?.pass_percentage}%
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Score & Percentage',
      key: 'score',
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
            {record.score_obtained} / {record.max_score}
          </span>
          <div style={{ fontSize: '13px', fontWeight: 700, color: record.is_passed ? '#10b981' : '#ef4444' }}>
            {record.percentage}%
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_passed',
      key: 'is_passed',
      render: (isPassed) => (
        <Tag
          color={isPassed ? 'success' : 'error'}
          style={{
            fontWeight: 700,
            borderRadius: '9999px',
            fontSize: '12px',
            padding: '3px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {isPassed ? <CheckCircleFilled /> : <CloseCircleFilled />}
          {isPassed ? 'PASSED' : 'FAILED'}
        </Tag>
      )
    },
    {
      title: 'Time Spent',
      dataIndex: 'time_taken_seconds',
      key: 'time_taken_seconds',
      render: (seconds) => {
        const mins = Math.floor((seconds || 0) / 60);
        const secs = (seconds || 0) % 60;
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
            <ClockCircleOutlined /> {mins}m {secs}s
          </span>
        );
      }
    },
    {
      title: 'Attempt Date',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date) => (
        <span style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CalendarOutlined /> {dayjs(date).format('MMM DD, YYYY HH:mm')}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/student/result/${record.id}`)}
            style={{ fontWeight: 600, borderRadius: '8px' }}
          >
            View Full Report
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: '12px' }}
        items={[
          { title: <Link to="/student">Assessments</Link> },
          { title: 'My Gradebook' }
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
            My Assessment Gradebook & History
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Complete record of your assessment attempts, scores, and answer reviews.
          </Text>
        </div>

        <Button
          size="middle"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/student')}
          style={{ fontWeight: 600, borderRadius: '8px', fontSize: '13px' }}
        >
          Available Assessments
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <Row gutter={[14, 14]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={8}>
          <StatCard
            title="Total Attempts"
            value={totalAttempts}
            icon={<FileDoneOutlined />}
            color="#4f46e5"
            bgLight="#eef2ff"
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard
            title="Quizzes Passed"
            value={passedAttempts}
            icon={<CheckCircleFilled />}
            color="#10b981"
            bgLight="#ecfdf5"
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard
            title="Average Score"
            value={avgScore}
            suffix="%"
            icon={<TrophyOutlined />}
            color="#06b6d4"
            bgLight="#ecfeff"
          />
        </Col>
      </Row>

      {/* History Table */}
      <Card
        style={{ borderRadius: '14px', border: '1px solid #e2e8f0' }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Table
          columns={columns}
          dataSource={mySubmissions}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <div style={{ padding: '30px 0' }}>
                <Empty description="No assessment attempts recorded yet." />
                <Button type="primary" onClick={() => navigate('/student')} style={{ marginTop: '14px' }}>
                  Browse Available Quizzes
                </Button>
              </div>
            )
          }}
        />
      </Card>

      {/* Quick Drawer Preview */}
      <SubmissionDetailDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setDrawerSubmission(null);
        }}
        submission={drawerSubmission}
      />
    </div>
  );
};

export default StudentHistoryPage;
