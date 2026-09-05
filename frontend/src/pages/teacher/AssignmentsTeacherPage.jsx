import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Space,
  Table,
  Row,
  Col,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Drawer,
  Empty,
  Spin,
  message,
  Divider,
  List,
  Avatar
} from 'antd';
import {
  FileDoneOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAssignments,
  fetchAssignmentById,
  createAssignment,
  gradeAssignmentSubmission
} from '../../store/slices/assignmentSlice';
import { fetchCourses } from '../../store/slices/courseSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AssignmentsTeacherPage = () => {
  const dispatch = useDispatch();
  const { assignments, currentAssignment, isLoading } = useSelector((state) => state.assignments);
  const { courses } = useSelector((state) => state.courses);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmissionsDrawerOpen, setIsSubmissionsDrawerOpen] = useState(false);
  const [isGradingDrawerOpen, setIsGradingDrawerOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rubricScores, setRubricScores] = useState({});
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Rubric state for new assignment creation
  const [newRubric, setNewRubric] = useState([
    { title: 'Core Functionality', max_points: 40, description: 'Meets primary requirements' },
    { title: 'Code Quality & Security', max_points: 30, description: 'Clean architecture and best practices' },
    { title: 'Documentation & Testing', max_points: 30, description: 'Clear README and test cases' }
  ]);

  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleOpenSubmissions = (assignmentId) => {
    dispatch(fetchAssignmentById(assignmentId));
    setIsSubmissionsDrawerOpen(true);
  };

  const handleOpenGrading = (sub) => {
    setSelectedSubmission(sub);
    setRubricScores(sub.rubric_scores || {});
    setTeacherFeedback(sub.teacher_feedback || '');
    setIsGradingDrawerOpen(true);
  };

  const handleAddRubricRow = () => {
    setNewRubric([...newRubric, { title: '', max_points: 20, description: '' }]);
  };

  const handleRemoveRubricRow = (idx) => {
    if (newRubric.length <= 1) return;
    setNewRubric(newRubric.filter((_, i) => i !== idx));
  };

  const handleRubricFieldChange = (idx, field, val) => {
    const updated = [...newRubric];
    updated[idx][field] = val;
    setNewRubric(updated);
  };

  const handleCreateAssignment = async (values) => {
    setActionLoading(true);
    const resultAction = await dispatch(
      createAssignment({
        ...values,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        rubric_criteria: newRubric
      })
    );
    setActionLoading(false);

    if (createAssignment.fulfilled.match(resultAction)) {
      message.success('Assignment published successfully!');
      setIsCreateModalOpen(false);
      form.resetFields();
      dispatch(fetchAssignments());
    } else {
      message.error(resultAction.payload || 'Failed to create assignment.');
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;

    // Calculate total from rubric
    const totalScore = Object.values(rubricScores).reduce((a, b) => Number(a || 0) + Number(b || 0), 0);

    setActionLoading(true);
    const resultAction = await dispatch(
      gradeAssignmentSubmission({
        submissionId: selectedSubmission.id,
        data: {
          score_obtained: totalScore,
          teacher_feedback: teacherFeedback,
          rubric_scores: rubricScores
        }
      })
    );
    setActionLoading(false);

    if (gradeAssignmentSubmission.fulfilled.match(resultAction)) {
      message.success('Assignment submission graded!');
      setIsGradingDrawerOpen(false);
      if (currentAssignment) {
        dispatch(fetchAssignmentById(currentAssignment.id));
      }
      dispatch(fetchAssignments());
    }
  };

  const columns = [
    {
      title: 'Assignment Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.course ? `${record.course.code} - ${record.course.title}` : 'General Assignment'}
          </Text>
        </div>
      )
    },
    {
      title: 'Max Points',
      dataIndex: 'max_points',
      key: 'points',
      width: 120,
      render: (pts) => <Tag color="gold" style={{ fontWeight: 700 }}>{pts} Marks</Tag>
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'dueDate',
      width: 180,
      render: (d) => d ? dayjs(d).format('MMM D, YYYY · h:mm A') : 'No deadline'
    },
    {
      title: 'Submissions',
      key: 'subs',
      width: 140,
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 700, color: '#4f46e5' }}>{record.submissions_count || 0} Submitted</span>
          <div style={{ fontSize: '11px', color: '#16a34a' }}>{record.graded_count || 0} Graded</div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<FileDoneOutlined />}
          onClick={() => handleOpenSubmissions(record.id)}
          style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
        >
          View Submissions
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            📑 Assignments & Homework Activities
          </Title>
          <Text type="secondary" style={{ fontSize: '13.5px' }}>
            Author homework tasks, establish multi-criteria rubrics, and grade student submissions.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700 }}
        >
          Create Assignment
        </Button>
      </div>

      {/* Assignments Table */}
      <Card style={{ borderRadius: '14px', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={assignments}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No assignments authored yet." /> }}
        />
      </Card>

      {/* Create Assignment Modal */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>Create New Assignment Activity</span>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={actionLoading}
        okText="Publish Assignment"
        width={780}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateAssignment} initialValues={{ max_points: 100 }}>
          <Row gutter={14}>
            <Col span={14}>
              <Form.Item name="title" label="Assignment Title" rules={[{ required: true, message: 'Please enter title' }]}>
                <Input placeholder="e.g. Lab 3: Relational Schema Normalization" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="course_id" label="Linked Course">
                <Select
                  placeholder="Select course (optional)"
                  allowClear
                  options={courses.map((c) => ({ label: `${c.code}: ${c.title}`, value: c.id }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={14}>
            <Col span={12}>
              <Form.Item name="max_points" label="Total Max Points" rules={[{ required: true }]}>
                <InputNumber min={1} max={500} style={{ width: '100%' }} addonAfter="marks" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="due_date" label="Submission Due Date">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="instructions" label="Submission Instructions & Guidelines">
            <TextArea rows={3} placeholder="Provide details on required deliverables, report formats, or repository links..." />
          </Form.Item>

          <Divider style={{ margin: '14px 0' }} />

          {/* Rubric Builder */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <Text strong style={{ fontSize: '14px' }}>Grading Rubric Criteria</Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Define point breakdown for evaluation.</div>
              </div>
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddRubricRow}>
                Add Criterion
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {newRubric.map((crit, idx) => (
                <Card key={idx} size="small" bodyStyle={{ padding: '8px 12px' }}>
                  <Row gutter={10} align="middle">
                    <Col span={10}>
                      <Input
                        placeholder="Criterion Title"
                        value={crit.title}
                        onChange={(e) => handleRubricFieldChange(idx, 'title', e.target.value)}
                      />
                    </Col>
                    <Col span={4}>
                      <InputNumber
                        min={1}
                        max={100}
                        addonAfter="pts"
                        value={crit.max_points}
                        onChange={(val) => handleRubricFieldChange(idx, 'max_points', val)}
                      />
                    </Col>
                    <Col span={8}>
                      <Input
                        placeholder="Guideline description"
                        value={crit.description}
                        onChange={(e) => handleRubricFieldChange(idx, 'description', e.target.value)}
                      />
                    </Col>
                    <Col span={2}>
                      {newRubric.length > 1 && (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveRubricRow(idx)} />
                      )}
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </div>
        </Form>
      </Modal>

      {/* Submissions List Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800 }}>Student Submissions: {currentAssignment?.title}</span>}
        open={isSubmissionsDrawerOpen}
        onClose={() => setIsSubmissionsDrawerOpen(false)}
        width={720}
      >
        {currentAssignment && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="gold" style={{ fontSize: '13px', fontWeight: 700 }}>
                Max {currentAssignment.max_points} Marks
              </Tag>
              <Text type="secondary">
                {(currentAssignment.submissions || []).length} Student(s) Submitted
              </Text>
            </div>

            {(!currentAssignment.submissions || currentAssignment.submissions.length === 0) ? (
              <Empty description="No submissions uploaded by students yet." style={{ margin: '40px 0' }} />
            ) : (
              <List
                dataSource={currentAssignment.submissions}
                renderItem={(sub) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar size={28} icon={<UserOutlined />} style={{ backgroundColor: '#4f46e5' }} />
                          <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                            {sub.student?.name}
                          </span>
                          <Tag color={sub.status === 'graded' ? 'success' : 'warning'}>
                            {sub.status.toUpperCase()}
                          </Tag>
                        </div>

                        <Button
                          type="primary"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleOpenGrading(sub)}
                          style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
                        >
                          {sub.status === 'graded' ? 'Edit Grade & Rubric' : 'Grade Submission'}
                        </Button>
                      </div>

                      <div style={{ fontSize: '13px', color: '#475569', background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', whiteSpace: 'pre-line', margin: '8px 0' }}>
                        {sub.submission_text || 'No text content provided.'}
                      </div>

                      {sub.score_obtained !== null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#16a34a' }}>
                            Awarded: {sub.score_obtained} / {currentAssignment.max_points} Marks
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Graded: {dayjs(sub.graded_at).format('MMM D, YYYY')}
                          </span>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </Drawer>

      {/* Rubric Evaluation Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800 }}>Rubric Evaluation & Scoring</span>}
        open={isGradingDrawerOpen}
        onClose={() => setIsGradingDrawerOpen(false)}
        width={560}
      >
        {selectedSubmission && currentAssignment && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div style={{ overflowY: 'auto' }}>
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', marginBottom: '18px' }}>
                <Text type="secondary" style={{ fontSize: '11px', fontWeight: 700 }}>STUDENT SUBMISSION</Text>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>
                  {selectedSubmission.student?.name}
                </div>
                <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px', whiteSpace: 'pre-line' }}>
                  {selectedSubmission.submission_text}
                </div>
              </div>

              <Title level={5} style={{ fontWeight: 800, marginBottom: '12px' }}>
                Rubric Criteria Breakdown
              </Title>

              {(currentAssignment.rubric_criteria || []).map((crit, idx) => {
                const currentVal = rubricScores[crit.title] !== undefined ? rubricScores[crit.title] : crit.max_points;

                return (
                  <Card key={idx} size="small" style={{ marginBottom: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{crit.title}</strong>
                      <InputNumber
                        min={0}
                        max={crit.max_points}
                        value={currentVal}
                        onChange={(val) => setRubricScores({ ...rubricScores, [crit.title]: val })}
                        addonAfter={`/ ${crit.max_points}`}
                        style={{ width: '130px' }}
                      />
                    </div>
                    {crit.description && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {crit.description}
                      </Text>
                    )}
                  </Card>
                );
              })}

              <div style={{ marginTop: '16px' }}>
                <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Personalized Teacher Feedback Notes:
                </Text>
                <TextArea
                  rows={3}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="Provide constructive feedback and improvement guidance for the student..."
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>TOTAL SCORE</Text>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5' }}>
                  {Object.values(rubricScores).reduce((a, b) => Number(a || 0) + Number(b || 0), 0)} / {currentAssignment.max_points}
                </span>
              </div>

              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSaveGrade}
                loading={actionLoading}
                style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 700 }}
              >
                Submit Grade & Feedback
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AssignmentsTeacherPage;
