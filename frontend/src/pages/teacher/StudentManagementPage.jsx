import React, { useEffect, useState, useMemo } from "react";
import { Typography, Button, Table, Tag, Space, Card, Row, Col, Input, Select, Popconfirm, Avatar, Progress, message, Tooltip } from "antd";
import { UserAddOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TeamOutlined, TrophyOutlined, CheckCircleOutlined, BarChartOutlined, ClockCircleOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../../store/slices/studentSlice";
import StatCard from "../../components/common/StatCard";
import StudentModal from "../../components/teacher/StudentModal";

const { Title, Text, Paragraph } = Typography;

const avatarColors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const getInitials = (name) => {
  if (!name) return "S";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const StudentManagementPage = () => {
  const dispatch = useDispatch();
  const { students, isLoading, actionLoading } = useSelector((state) => state.student);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => (s.total_attempted || 0) > 0).length;

    let totalScoreSum = 0;
    let studentsWithScores = 0;
    let totalSubmissions = 0;

    students.forEach((s) => {
      totalSubmissions += s.total_attempted || 0;
      if ((s.total_attempted || 0) > 0) {
        totalScoreSum += s.average_score || 0;
        studentsWithScores++;
      }
    });

    const avgClassScore = studentsWithScores > 0 ? Math.round((totalScoreSum / studentsWithScores) * 10) / 10 : 0;

    return {
      totalStudents,
      activeStudents,
      avgClassScore,
      totalSubmissions,
    };
  }, [students]);

  // Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || student.email?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === "active") {
        return (student.total_attempted || 0) > 0;
      }
      if (filterStatus === "inactive") {
        return (student.total_attempted || 0) === 0;
      }
      return true;
    });
  }, [students, searchQuery, filterStatus]);

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const handleSubmitModal = async (values) => {
    if (editingStudent) {
      const payload = {
        id: editingStudent.id,
        name: values.name,
        email: values.email,
      };
      if (values.password && values.password.trim()) {
        payload.password = values.password.trim();
      }
      const result = await dispatch(updateStudent(payload));
      if (updateStudent.fulfilled.match(result)) {
        message.success("Student information updated successfully!");
        setModalOpen(false);
        setEditingStudent(null);
        dispatch(fetchStudents());
      } else {
        message.error(result.payload || "Failed to update student.");
      }
    } else {
      const result = await dispatch(createStudent(values));
      if (createStudent.fulfilled.match(result)) {
        message.success(`Student "${values.name}" enrolled successfully!`);
        setModalOpen(false);
        dispatch(fetchStudents());
      } else {
        message.error(result.payload || "Failed to enroll student.");
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    const result = await dispatch(deleteStudent(id));
    if (deleteStudent.fulfilled.match(result)) {
      message.success("Student removed successfully.");
    } else {
      message.error(result.payload || "Failed to delete student.");
    }
  };

  const columns = [
    {
      title: "Student Profile",
      key: "student",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            style={{
              backgroundColor: getAvatarColor(record.name),
              fontWeight: 700,
              fontSize: "13px",
              verticalAlign: "middle",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
            size={38}
          >
            {getInitials(record.name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>{record.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
              <MailOutlined style={{ fontSize: "11px" }} />
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Enrolled On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => <Text style={{ fontSize: "13px", color: "#475569" }}>{date ? dayjs(date).format("MMM D, YYYY") : "—"}</Text>,
    },
    {
      title: "Quizzes Taken",
      key: "total_attempted",
      render: (_, record) => {
        const count = record.total_attempted || 0;
        return (
          <div>
            <span style={{ fontWeight: 700, fontSize: "14px", color: count > 0 ? "#0f172a" : "#94a3b8" }}>{count}</span>
            <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px" }}>{count === 1 ? "quiz" : "quizzes"}</span>
          </div>
        );
      },
    },
    {
      title: "Pass Rate",
      key: "passed_ratio",
      render: (_, record) => {
        const attempted = record.total_attempted || 0;
        const passed = record.total_passed || 0;
        if (attempted === 0) {
          return <Tag style={{ borderRadius: "4px", color: "#94a3b8" }}>No attempts</Tag>;
        }
        const passPercent = Math.round((passed / attempted) * 100);
        return (
          <Space orientation="horizontal" size={6}>
            <Tag color={passPercent >= 70 ? "success" : passPercent >= 50 ? "warning" : "error"} style={{ borderRadius: "4px", fontWeight: 600, fontSize: "12px" }}>
              {passed} / {attempted} Passed ({passPercent}%)
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Avg Score",
      key: "average_score",
      render: (_, record) => {
        const attempted = record.total_attempted || 0;
        const score = record.average_score || 0;
        if (attempted === 0) {
          return (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              —
            </Text>
          );
        }
        let strokeColor = "#ef4444";
        if (score >= 70) strokeColor = "#10b981";
        else if (score >= 50) strokeColor = "#f59e0b";

        return (
          <div style={{ width: "120px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{score}%</span>
            </div>
            <Progress percent={score} showInfo={false} size="small" strokeColor={strokeColor} trailColor="#e2e8f0" />
          </div>
        );
      },
    },
    {
      title: "Last Active",
      dataIndex: "last_active_at",
      key: "last_active_at",
      render: (date) => <span style={{ fontSize: "12px", color: date ? "#475569" : "#94a3b8" }}>{date ? dayjs(date).format("MMM D, YYYY h:mm A") : "Not yet"}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Student Profile">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEditModal(record)} style={{ borderRadius: "6px" }} />
          </Tooltip>
          <Popconfirm title="Remove Student?" description={`Are you sure you want to remove ${record.name}? Their past submissions will also be affected.`} onConfirm={() => handleDeleteStudent(record.id)} okText="Yes, Remove" cancelText="Cancel" okButtonProps={{ danger: true }}>
            <Tooltip title="Remove Student">
              <Button danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: "6px" }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px 20px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Hero Banner */}
      <div className="hero-gradient-card" style={{ padding: "16px 22px", marginBottom: "16px", borderRadius: "14px" }}>
        <Row align="middle" justify="space-between" gutter={[16, 12]}>
          <Col xs={24} md={16}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Student Roster & Enrollment</span>
              <Tag color="cyan" style={{ fontSize: "10px", fontWeight: 700, borderRadius: "4px", margin: 0, padding: "0 6px" }}>
                Class Management
              </Tag>
            </div>
            <Paragraph style={{ color: "#cbd5e1", fontSize: "13px", margin: 0, maxWidth: "640px", lineHeight: 1.4 }}>Add new students to your test platform, manage credentials, and monitor individual quiz performance and participation.</Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleOpenCreateModal}
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
              Enroll New Student
            </Button>
          </Col>
        </Row>
      </div>

      {/* KPI Stats Row */}
      <Row gutter={[14, 14]} style={{ marginBottom: "16px" }}>
        <Col xs={12} sm={6}>
          <StatCard title="Total Students" value={stats.totalStudents} icon={<TeamOutlined />} color="#4f46e5" bgLight="#eef2ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Active Takers" value={stats.activeStudents} icon={<CheckCircleOutlined />} color="#10b981" bgLight="#ecfdf5" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Class Avg Score" value={`${stats.avgClassScore}%`} icon={<BarChartOutlined />} color="#06b6d4" bgLight="#ecfeff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Total Submissions" value={stats.totalSubmissions} icon={<TrophyOutlined />} color="#f59e0b" bgLight="#fffbeb" />
        </Col>
      </Row>

      {/* Student List Table Card */}
      <Card
        style={{ borderRadius: "14px", border: "1px solid #e2e8f0" }}
        bodyStyle={{ padding: "16px 20px" }}
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", fontWeight: 750, color: "#0f172a" }}>Enrolled Students</span>
              <Tag color="blue" style={{ borderRadius: "12px", fontWeight: 600, fontSize: "12px" }}>
                {filteredStudents.length} {filteredStudents.length === 1 ? "Student" : "Students"}
              </Tag>
            </div>

            {/* Search & Filter Controls */}
            <Space wrap size="small">
              <Input placeholder="Search by name or email..." prefix={<SearchOutlined style={{ color: "#94a3b8" }} />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: 230, borderRadius: "8px" }} allowClear />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
                options={[
                  { value: "all", label: "All Students" },
                  { value: "active", label: "Has Submissions" },
                  { value: "inactive", label: "No Submissions" },
                ]}
              />
              <Button type="primary" icon={<UserAddOutlined />} onClick={handleOpenCreateModal} style={{ fontWeight: 600, borderRadius: "6px" }}>
                Add Student
              </Button>
            </Space>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ["8", "16", "32"],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
          }}
          locale={{
            emptyText: searchQuery ? "No students matched your search criteria." : 'No students enrolled yet. Click "Enroll New Student" to add your first student!',
          }}
        />
      </Card>

      {/* Student Add/Edit Modal */}
      <StudentModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleSubmitModal}
        initialValues={editingStudent}
        loading={actionLoading}
      />
    </div>
  );
};

export default StudentManagementPage;
