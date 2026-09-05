import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Progress,
  Button,
  Space,
  Divider
} from 'antd';
import {
  BarChartOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherStats } from '../../store/slices/testSlice';
import { fetchSubmissionById } from '../../store/slices/submissionSlice';
import StatCard from '../../components/common/StatCard';
import SubmissionDetailDrawer from '../../components/teacher/SubmissionDetailDrawer';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const TeacherAnalyticsPage = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.test);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTeacherStats());
  }, [dispatch]);

  const handleInspect = async (subId) => {
    const resultAction = await dispatch(fetchSubmissionById(subId));
    if (fetchSubmissionById.fulfilled.match(resultAction)) {
      setSelectedSubmission(resultAction.payload);
      setIsDrawerOpen(true);
    }
  };

  const scoreBuckets = stats?.scoreDistribution || {
    '0-49%': 0,
    '50-69%': 0,
    '70-84%': 0,
    '85-100%': 0
  };

  const totalSubmissions = stats?.totalSubmissions || 0;

  const recentColumns = [
    {
      title: 'Assessment',
      dataIndex: 'testTitle',
      key: 'testTitle',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.studentName}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.studentEmail}</Text>
        </div>
      )
    },
    {
      title: 'Score',
      key: 'score',
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 700 }}>{record.scoreObtained} / {record.maxScore}</span>
          <span style={{ marginLeft: '8px', color: record.isPassed ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            ({record.percentage}%)
          </span>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isPassed',
      key: 'isPassed',
      render: (isPassed) => (
        <Tag color={isPassed ? 'success' : 'error'} style={{ fontWeight: 700 }}>
          {isPassed ? 'PASSED' : 'FAILED'}
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY HH:mm')
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleInspect(record.id)}>
          Review
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
          Performance Analytics & Insights
        </Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          Overview of student performance trends, pass rates, and grade distribution across all quizzes.
        </Text>
      </div>

      {/* Top Stat Cards */}
      <Row gutter={[14, 14]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={6}>
          <StatCard
            title="Class Average"
            value={stats?.averageScore || 0}
            suffix="%"
            icon={<TrophyOutlined />}
            color="#4f46e5"
            bgLight="#eef2ff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Overall Pass Rate"
            value={stats?.overallPassRate || 0}
            suffix="%"
            icon={<CheckCircleOutlined />}
            color="#10b981"
            bgLight="#ecfdf5"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Total Submissions"
            value={totalSubmissions}
            icon={<UsergroupAddOutlined />}
            color="#06b6d4"
            bgLight="#ecfeff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Published Tests"
            value={stats?.publishedTests || 0}
            icon={<BarChartOutlined />}
            color="#f59e0b"
            bgLight="#fffbeb"
          />
        </Col>
      </Row>

      {/* Grade Distribution */}
      <Row gutter={[14, 14]} style={{ marginBottom: '16px' }}>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ fontWeight: 700, fontSize: '15px' }}>Score Range Distribution</span>}
            style={{ borderRadius: '14px', border: '1px solid #e2e8f0', height: '100%' }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text strong>85% - 100% (Distinction)</Text>
                  <Text type="secondary">{scoreBuckets['85-100%']} students</Text>
                </div>
                <Progress
                  percent={totalSubmissions > 0 ? Math.round((scoreBuckets['85-100%'] / totalSubmissions) * 100) : 0}
                  strokeColor="#10b981"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text strong>70% - 84% (Good)</Text>
                  <Text type="secondary">{scoreBuckets['70-84%']} students</Text>
                </div>
                <Progress
                  percent={totalSubmissions > 0 ? Math.round((scoreBuckets['70-84%'] / totalSubmissions) * 100) : 0}
                  strokeColor="#4f46e5"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text strong>50% - 69% (Passing)</Text>
                  <Text type="secondary">{scoreBuckets['50-69%']} students</Text>
                </div>
                <Progress
                  percent={totalSubmissions > 0 ? Math.round((scoreBuckets['50-69%'] / totalSubmissions) * 100) : 0}
                  strokeColor="#f59e0b"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text strong>0% - 49% (Needs Improvement)</Text>
                  <Text type="secondary">{scoreBuckets['0-49%']} students</Text>
                </div>
                <Progress
                  percent={totalSubmissions > 0 ? Math.round((scoreBuckets['0-49%'] / totalSubmissions) * 100) : 0}
                  strokeColor="#ef4444"
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={<span style={{ fontWeight: 700 }}>Assessment Overview</span>}
            style={{ borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                <Text strong>Active Tests Available to Students</Text>
                <Tag color="green" style={{ fontSize: '14px', padding: '2px 10px', fontWeight: 700 }}>
                  {stats?.publishedTests || 0}
                </Tag>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                <Text strong>Draft Tests (Unpublished)</Text>
                <Tag color="orange" style={{ fontSize: '14px', padding: '2px 10px', fontWeight: 700 }}>
                  {stats?.draftTests || 0}
                </Tag>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                <Text strong>Total Author Questions Created</Text>
                <Tag color="blue" style={{ fontSize: '14px', padding: '2px 10px', fontWeight: 700 }}>
                  {stats?.totalQuestions || 0} Questions
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <Card
        title={<span style={{ fontWeight: 700 }}>Recent Student Submissions</span>}
        style={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}
        bodyStyle={{ padding: '20px' }}
      >
        <Table
          columns={recentColumns}
          dataSource={stats?.recentSubmissions || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'No submissions yet.' }}
        />
      </Card>

      <SubmissionDetailDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        submission={selectedSubmission}
      />
    </div>
  );
};

export default TeacherAnalyticsPage;
