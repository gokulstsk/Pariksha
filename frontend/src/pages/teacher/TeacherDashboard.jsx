import React, { useEffect, useState } from "react";
import { Typography, Button, Table, Tag, Space, Card, Row, Col, Switch, Popconfirm, Badge, message, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, UsergroupAddOutlined, ClockCircleOutlined, CheckCircleOutlined, FormOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchTests, createTest, deleteTest, togglePublishTest, fetchTeacherStats } from "../../store/slices/testSlice";
import StatCard from "../../components/common/StatCard";
import TestModal from "../../components/teacher/TestModal";

const { Title, Text, Paragraph } = Typography;

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tests, stats, isLoading } = useSelector((state) => state.test);
  const { user } = useSelector((state) => state.auth);

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchTests());
    dispatch(fetchTeacherStats());
  }, [dispatch]);

  const handleCreateTest = async (values) => {
    setModalLoading(true);
    const resultAction = await dispatch(createTest(values));
    setModalLoading(false);
    if (createTest.fulfilled.match(resultAction)) {
      message.success("Assessment created successfully!");
      setIsTestModalOpen(false);
      // Navigate straight to test editor so teacher can start adding questions
      navigate(`/teacher/test/${resultAction.payload.id}`);
    } else {
      message.error(resultAction.payload || "Failed to create assessment.");
    }
  };

  const handleTogglePublish = async (id, e) => {
    e.stopPropagation();
    const resultAction = await dispatch(togglePublishTest(id));
    if (togglePublishTest.fulfilled.match(resultAction)) {
      message.success(`Assessment is now ${resultAction.payload.is_published ? "Published to Students" : "Saved as Draft"}`);
    }
  };

  const handleDeleteTest = async (id, e) => {
    e.stopPropagation();
    const resultAction = await dispatch(deleteTest(id));
    if (deleteTest.fulfilled.match(resultAction)) {
      message.success("Assessment deleted.");
      dispatch(fetchTeacherStats());
    }
  };

  const columns = [
    {
      title: "Assessment Details",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>{text}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <Tag color="cyan" style={{ borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>
              {record.category}
            </Tag>
            <Text type="secondary" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <ClockCircleOutlined /> {record.duration_minutes} mins
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              • Pass: {record.pass_percentage}%
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Questions & Marks",
      key: "questions",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0f172a" }}>{record.total_questions_count} Questions</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Total {record.total_points} marks
          </Text>
        </div>
      ),
    },
    {
      title: "Submissions",
      dataIndex: "submissions_count",
      key: "submissions_count",
      render: (count, record) => (
        <Button type="link" style={{ padding: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }} onClick={() => navigate(`/teacher/test/${record.id}/submissions`)}>
          <UsergroupAddOutlined /> {count} Submissions
        </Button>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_published",
      key: "is_published",
      render: (isPublished, record) => (
        <Space direction="vertical" size={2}>
          <Switch checked={isPublished} checkedChildren="Published" unCheckedChildren="Draft" onChange={(_, e) => handleTogglePublish(record.id, e)} />
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="middle" icon={<FormOutlined />} onClick={() => navigate(`/teacher/test/${record.id}`)}>
            Manage Questions
          </Button>

          <Popconfirm title="Delete this assessment?" description="All questions and student submissions will be permanently removed." onConfirm={(e) => handleDeleteTest(record.id, e)} okText="Yes, Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px 20px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Welcome Hero Banner */}
      <div className="hero-gradient-card" style={{ padding: "16px 22px", marginBottom: "16px", borderRadius: "14px" }}>
        <Row align="middle" justify="space-between" gutter={[16, 12]}>
          <Col xs={24} md={16}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Welcome, {user?.name}</span>
              <Tag color="cyan" style={{ fontSize: "10px", fontWeight: 700, borderRadius: "4px", margin: 0, padding: "0 6px" }}>
                Teacher Portal
              </Tag>
            </div>
            <Paragraph style={{ color: "#cbd5e1", fontSize: "13px", margin: 0, maxWidth: "640px", lineHeight: 1.4 }}>Author questions with rich answers, manage test timers and passing thresholds, and inspect student scoring analytics.</Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsTestModalOpen(true)}
              style={{
                height: "38px",
                padding: "0 18px",
                fontSize: "13px",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#4338ca",
                fontWeight: 700,
                border: "none",
                boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
              }}
            >
              Create Assessment
            </Button>
          </Col>
        </Row>
      </div>

      {/* Stats Row */}
      <Row gutter={[14, 14]} style={{ marginBottom: "16px" }}>
        <Col xs={12} sm={6}>
          <StatCard title="Total Tests" value={stats?.totalTests || tests.length || 0} icon={<FileTextOutlined />} color="#4f46e5" bgLight="#eef2ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Published Tests" value={stats?.publishedTests || tests.filter((t) => t.is_published).length || 0} icon={<CheckCircleOutlined />} color="#10b981" bgLight="#ecfdf5" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Total Questions" value={stats?.totalQuestions || 0} icon={<FormOutlined />} color="#06b6d4" bgLight="#ecfeff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Student Submissions" value={stats?.totalSubmissions || 0} icon={<UsergroupAddOutlined />} color="#f59e0b" bgLight="#fffbeb" />
        </Col>
      </Row>

      {/* Assessments List Table */}
      <Card
        style={{ borderRadius: "14px", border: "1px solid #e2e8f0" }}
        bodyStyle={{ padding: "16px 20px" }}
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "16px", fontWeight: 750 }}>My Assessment Quizzes</span>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsTestModalOpen(true)} style={{ fontWeight: 600 }}>
              New Assessment
            </Button>
          </div>
        }
      >
        <Table columns={columns} dataSource={tests} rowKey="id" loading={isLoading} pagination={{ pageSize: 8 }} locale={{ emptyText: 'No assessments created yet. Click "Create Assessment" to get started!' }} />
      </Card>

      {/* Create Test Modal */}
      <TestModal open={isTestModalOpen} onCancel={() => setIsTestModalOpen(false)} onSubmit={handleCreateTest} loading={modalLoading} />
    </div>
  );
};

export default TeacherDashboard;
