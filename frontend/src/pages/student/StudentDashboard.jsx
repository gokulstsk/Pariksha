import React, { useEffect, useState, useMemo } from "react";
import { Typography, Card, Row, Col, Tag, Button, Space, Badge, Empty, Spin, Divider, Input, Tabs, Modal, Alert, Tooltip } from "antd";
import { PlayCircleFilled, ClockCircleOutlined, CheckCircleFilled, CloseCircleFilled, TrophyOutlined, HistoryOutlined, SearchOutlined, CompassOutlined, FileDoneOutlined, SafetyCertificateOutlined, ThunderboltOutlined, EyeOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchTests } from "../../store/slices/testSlice";
import { fetchMySubmissions } from "../../store/slices/submissionSlice";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tests, isLoading } = useSelector((state) => state.test);
  const { mySubmissions } = useSelector((state) => state.submission);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTestForInstructions, setSelectedTestForInstructions] = useState(null);

  useEffect(() => {
    dispatch(fetchTests());
    dispatch(fetchMySubmissions());
  }, [dispatch]);

  const categories = useMemo(() => {
    const cats = new Set(tests.map((t) => t.category || "General"));
    return ["all", ...Array.from(cats)];
  }, [tests]);

  const totalTests = tests.length;
  const attemptedTests = tests.filter((t) => t.has_attempted);
  const passedTests = tests.filter((t) => t.has_attempted && t.latest_submission?.is_passed);
  const unattemptedTests = tests.filter((t) => !t.has_attempted);

  const passRate = attemptedTests.length > 0 ? Math.round((passedTests.length / attemptedTests.length) * 100) : 0;

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase())) || (test.category && test.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || test.category === selectedCategory;

      let matchesTab = true;
      if (activeTab === "unattempted") {
        matchesTab = !test.has_attempted;
      } else if (activeTab === "passed") {
        matchesTab = test.has_attempted && test.latest_submission?.is_passed;
      } else if (activeTab === "retake") {
        matchesTab = test.has_attempted && !test.latest_submission?.is_passed;
      }

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [tests, searchQuery, selectedCategory, activeTab]);

  const handleStartExam = (test) => {
    setSelectedTestForInstructions(null);
    navigate(`/student/exam/${test.id}`);
  };

  return (
    <div style={{ padding: "16px 20px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Compact Hero Banner */}
      <div
        className="hero-gradient-card"
        style={{
          padding: "16px 22px",
          marginBottom: "16px",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)",
        }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 12]}>
          <Col xs={24} md={16}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Welcome, {user?.name?.split(" ")[0]} 👋</span>
              <Tag color="cyan" style={{ fontSize: "10px", fontWeight: 700, borderRadius: "4px", margin: 0, padding: "0 6px" }}>
                Student Portal
              </Tag>
            </div>
            <Paragraph style={{ color: "#e0e7ff", fontSize: "13px", margin: 0, lineHeight: 1.4, maxWidth: "640px" }}>Browse your assigned assessments below. Take quizzes with real-time timers and inspect automated results with solutions.</Paragraph>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "14px",
                background: "rgba(255, 255, 255, 0.12)",
                padding: "8px 16px",
                borderRadius: "12px",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#cbd5e1", fontSize: "10px", fontWeight: 700 }}>AVAILABLE</div>
                <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 900, lineHeight: 1.1 }}>{totalTests}</div>
              </div>
              <Divider type="vertical" style={{ height: "24px", borderColor: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#cbd5e1", fontSize: "10px", fontWeight: 700 }}>COMPLETED</div>
                <div style={{ color: "#67e8f9", fontSize: "18px", fontWeight: 900, lineHeight: 1.1 }}>{attemptedTests.length}</div>
              </div>
              <Divider type="vertical" style={{ height: "24px", borderColor: "rgba(255,255,255,0.2)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#cbd5e1", fontSize: "10px", fontWeight: 700 }}>PASS RATE</div>
                <div style={{ color: "#34d399", fontSize: "18px", fontWeight: 900, lineHeight: 1.1 }}>{passRate}%</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Filter, Search & Status Tab Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <Tabs
            size="small"
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 0 }}
            items={[
              {
                key: "all",
                label: (
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>
                    All Quizzes <Badge count={totalTests} style={{ backgroundColor: "#4f46e5", marginLeft: "4px", fontSize: "10px" }} />
                  </span>
                ),
              },
              {
                key: "unattempted",
                label: (
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>
                    Ready to Take <Badge count={unattemptedTests.length} style={{ backgroundColor: "#06b6d4", marginLeft: "4px", fontSize: "10px" }} />
                  </span>
                ),
              },
              {
                key: "passed",
                label: (
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>
                    Passed <Badge count={passedTests.length} style={{ backgroundColor: "#10b981", marginLeft: "4px", fontSize: "10px" }} />
                  </span>
                ),
              },
              {
                key: "retake",
                label: (
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>
                    Needs Retake <Badge count={attemptedTests.length - passedTests.length} style={{ backgroundColor: "#f59e0b", marginLeft: "4px", fontSize: "10px" }} />
                  </span>
                ),
              },
            ]}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Search placeholder="Search quiz..." allowClear size="middle" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: 220 }} prefix={<SearchOutlined style={{ color: "#94a3b8" }} />} />
            <Button size="middle" icon={<HistoryOutlined />} onClick={() => navigate("/student/history")} style={{ fontWeight: 600, fontSize: "13px" }}>
              Gradebook
            </Button>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Topic:</span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Tag.CheckableTag
                key={cat}
                checked={isSelected}
                onChange={() => setSelectedCategory(cat)}
                style={{
                  padding: "2px 10px",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: isSelected ? "1px solid #4f46e5" : "1px solid #e2e8f0",
                  background: isSelected ? "#4f46e5" : "#ffffff",
                  color: isSelected ? "#ffffff" : "#475569",
                }}
              >
                {cat === "all" ? "All" : cat}
              </Tag.CheckableTag>
            );
          })}
        </div>
      </div>

      {/* Assessments Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" tip="Loading Assessments..." />
        </div>
      ) : filteredTests.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "36px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <Empty
            description={
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>No matching assessments found</div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Try adjusting your filters or search keywords.
                </Text>
              </div>
            }
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTests.map((test) => {
            const hasAttempted = test.has_attempted;
            const latestSub = test.latest_submission;
            const isPassed = latestSub?.is_passed;

            return (
              <Col xs={24} sm={12} lg={8} key={test.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "14px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    border: hasAttempted ? (isPassed ? "1.5px solid #86efac" : "1.5px solid #fca5a5") : "1px solid #e2e8f0",
                    background: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.2s ease",
                  }}
                  bodyStyle={{
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Top Row: Category & Attempt Status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <Tag
                        color="cyan"
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          borderRadius: "4px",
                          padding: "1px 6px",
                          border: "none",
                          background: "#ecfeff",
                          color: "#0891b2",
                        }}
                      >
                        {test.category}
                      </Tag>

                      {hasAttempted ? (
                        <Tag
                          color={isPassed ? "success" : "error"}
                          style={{
                            fontWeight: 700,
                            borderRadius: "9999px",
                            padding: "1px 8px",
                            fontSize: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          {isPassed ? <CheckCircleFilled /> : <CloseCircleFilled />}
                          {isPassed ? `PASSED • ${latestSub.percentage}%` : `FAILED • ${latestSub.percentage}%`}
                        </Tag>
                      ) : (
                        <Tag
                          color="blue"
                          style={{
                            fontWeight: 700,
                            borderRadius: "9999px",
                            padding: "1px 8px",
                            fontSize: "10px",
                            background: "#eef2ff",
                            color: "#4f46e5",
                            border: "1px solid #c7d2fe",
                          }}
                        >
                          READY
                        </Tag>
                      )}
                    </div>

                    {/* Test Title & Description */}
                    <Title
                      level={5}
                      style={{
                        margin: "0 0 6px 0",
                        fontWeight: 750,
                        fontSize: "15px",
                        lineHeight: 1.35,
                        color: "#0f172a",
                      }}
                    >
                      {test.title}
                    </Title>

                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: "12px", marginBottom: "12px", color: "#64748b", lineHeight: 1.4 }}>
                      {test.description || "Comprehensive assessment covering fundamental and advanced concepts."}
                    </Paragraph>
                  </div>

                  <div>
                    {/* Compact Exam Metrics Row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "6px",
                        padding: "8px 10px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                        marginBottom: "14px",
                        border: "1px solid #f1f5f9",
                        fontSize: "11px",
                        color: "#475569",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <ClockCircleOutlined style={{ color: "#6366f1" }} />
                        <span>
                          <strong>{test.duration_minutes}</strong> mins
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <FileDoneOutlined style={{ color: "#06b6d4" }} />
                        <span>
                          <strong>{test.total_questions_count}</strong> Questions
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <TrophyOutlined style={{ color: "#f59e0b" }} />
                        <span>
                          <strong>{test.total_points || test.total_questions_count}</strong> Pts
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <SafetyCertificateOutlined style={{ color: "#10b981" }} />
                        <span>
                          Pass: <strong>{test.pass_percentage}%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Button
                        type="primary"
                        block
                        icon={<PlayCircleFilled />}
                        onClick={() => setSelectedTestForInstructions(test)}
                        style={{
                          height: "36px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        {hasAttempted ? "Retake" : "Start Exam"}
                      </Button>

                      {hasAttempted && latestSub && (
                        <Tooltip title="View full score report & solutions">
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/student/result/${latestSub.id}`)}
                            style={{
                              height: "36px",
                              borderRadius: "8px",
                              fontWeight: 600,
                              borderColor: "#cbd5e1",
                            }}
                          >
                            Review
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Pre-Exam Instructions & Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CompassOutlined style={{ fontSize: "15px" }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "16px" }}>{selectedTestForInstructions?.title}</span>
          </div>
        }
        open={!!selectedTestForInstructions}
        onCancel={() => setSelectedTestForInstructions(null)}
        footer={[
          <Button key="back" onClick={() => setSelectedTestForInstructions(null)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" icon={<PlayCircleFilled />} onClick={() => handleStartExam(selectedTestForInstructions)} style={{ fontWeight: 700, height: "36px", padding: "0 18px" }}>
            I Understand, Begin Exam
          </Button>,
        ]}
        width={580}
        destroyOnClose
      >
        {selectedTestForInstructions && (
          <div style={{ marginTop: "12px" }}>
            <Alert type="info" showIcon message="Assessment Rules & Timers" description="Once you click 'Begin Exam', the timer will start immediately. Answers auto-save in real-time." style={{ marginBottom: "16px", borderRadius: "8px", fontSize: "13px" }} />

            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px" }}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: "11px", fontWeight: 600 }}>
                    DURATION LIMIT
                  </Text>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{selectedTestForInstructions.duration_minutes} Minutes</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: "11px", fontWeight: 600 }}>
                    PASSING SCORE
                  </Text>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>{selectedTestForInstructions.pass_percentage}% Required</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: "11px", fontWeight: 600 }}>
                    TOTAL QUESTIONS
                  </Text>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{selectedTestForInstructions.total_questions_count} Questions</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: "11px", fontWeight: 600 }}>
                    TOTAL MARKS
                  </Text>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#4f46e5", marginTop: "2px" }}>{selectedTestForInstructions.total_points || selectedTestForInstructions.total_questions_count} Points</div>
                </Col>
              </Row>
            </div>

            {selectedTestForInstructions.instructions && (
              <div style={{ marginBottom: "12px" }}>
                <Text strong style={{ fontSize: "13px", color: "#1e293b" }}>
                  Instructor Instructions:
                </Text>
                <div style={{ marginTop: "4px", padding: "8px 12px", background: "#f1f5f9", borderRadius: "6px", fontSize: "12px", color: "#334155", fontStyle: "italic" }}>"{selectedTestForInstructions.instructions}"</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
