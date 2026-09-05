import React, { useEffect, useState } from "react";
import { Typography, Card, Table, Tag, Button, Space, Row, Col, Breadcrumb, Empty, Spin } from "antd";
import { EyeOutlined, CheckCircleFilled, CloseCircleFilled, ClockCircleOutlined, CalendarOutlined, LeftOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchTestSubmissions, fetchSubmissionById } from "../../store/slices/submissionSlice";
import SubmissionDetailDrawer from "../../components/teacher/SubmissionDetailDrawer";
import StatCard from "../../components/common/StatCard";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const TestSubmissionsPage = () => {
  const { testId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTestSubmissions, currentSubmission, isLoading } = useSelector((state) => state.submission);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTestSubmissions(testId));
  }, [dispatch, testId]);

  const handleInspect = async (subId) => {
    const resultAction = await dispatch(fetchSubmissionById(subId));
    if (fetchSubmissionById.fulfilled.match(resultAction)) {
      setSelectedSubmission(resultAction.payload);
      setIsDrawerOpen(true);
    }
  };

  const { test, submissions = [] } = currentTestSubmissions || {};

  const totalAttempts = submissions.length;
  const passedCount = submissions.filter((s) => s.is_passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
  const avgScore = totalAttempts > 0 ? Math.round((submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / totalAttempts) * 10) / 10 : 0;

  const columns = [
    {
      title: "Student Details",
      dataIndex: "student",
      key: "student",
      render: (student) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>{student?.name || "Unknown Student"}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {student?.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Score",
      key: "score",
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>
            {record.score_obtained} / {record.max_score}
          </span>
          <div style={{ fontSize: "12px", fontWeight: 600, color: record.is_passed ? "#10b981" : "#ef4444" }}>{record.percentage}%</div>
        </div>
      ),
    },
    {
      title: "Result Status",
      dataIndex: "is_passed",
      key: "is_passed",
      render: (isPassed) => (
        <Tag color={isPassed ? "success" : "error"} style={{ fontWeight: 700, borderRadius: "6px", fontSize: "12px" }}>
          {isPassed ? "PASSED" : "FAILED"}
        </Tag>
      ),
    },
    {
      title: "Time Taken",
      dataIndex: "time_taken_seconds",
      key: "time_taken_seconds",
      render: (seconds) => {
        const mins = Math.floor((seconds || 0) / 60);
        const secs = (seconds || 0) % 60;
        return (
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
            <ClockCircleOutlined /> {mins}m {secs}s
          </span>
        );
      },
    },
    {
      title: "Submitted Date",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date) => <span style={{ fontSize: "13px", color: "#475569" }}>{dayjs(date).format("MMM DD, YYYY HH:mm")}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => handleInspect(record.id)}>
          Inspect Answers
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: "16px" }} items={[{ title: <Link to="/teacher">Assessments</Link> }, { title: <Link to={`/teacher/test/${testId}`}>{test?.title || "Test"}</Link> }, { title: "Submissions & Grades" }]} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            Submissions for: {test?.title || "Assessment"}
          </Title>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Passing threshold: {test?.pass_percentage}%
          </Text>
        </div>

        <Button icon={<LeftOutlined />} onClick={() => navigate(`/teacher/test/${testId}`)}>
          Back to Test Editor
        </Button>
      </div>

      {/* Summary Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={8}>
          <StatCard title="Total Submissions" value={totalAttempts} icon={<UserOutlined />} color="#4f46e5" bgLight="#eef2ff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard title="Average Score" value={avgScore} suffix="%" icon={<ClockCircleOutlined />} color="#06b6d4" bgLight="#ecfeff" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard title="Pass Rate" value={passRate} suffix="%" icon={<CheckCircleFilled />} color="#10b981" bgLight="#ecfdf5" />
        </Col>
      </Row>

      {/* Submissions Table */}
      <Card style={{ borderRadius: "16px", border: "1px solid #e2e8f0" }} bodyStyle={{ padding: "24px" }}>
        <Table columns={columns} dataSource={submissions} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} locale={{ emptyText: "No student submissions yet for this assessment." }} />
      </Card>

      {/* Submission Answer Inspection Drawer */}
      <SubmissionDetailDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
      />
    </div>
  );
};

export default TestSubmissionsPage;
