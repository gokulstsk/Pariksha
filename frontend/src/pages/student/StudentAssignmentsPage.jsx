import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Tabs,
  Modal,
  Form,
  Input,
  Drawer,
  Empty,
  Spin,
  message,
  Divider,
  Badge
} from 'antd';
import {
  FileDoneOutlined,
  UploadOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, submitAssignment } from '../../store/slices/assignmentSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const StudentAssignmentsPage = () => {
  const dispatch = useDispatch();
  const { assignments, isLoading } = useSelector((state) => state.assignments);

  const [activeTab, setActiveTab] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  const handleOpenSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    form.resetFields();
    if (assignment.my_submission) {
      form.setFieldsValue({
        submission_text: assignment.my_submission.submission_text
      });
    }
    setIsSubmitModalOpen(true);
  };

  const handleOpenReview = (assignment) => {
    setSelectedAssignment(assignment);
    setIsReviewDrawerOpen(true);
  };

  const handleSubmitWork = async (values) => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    const resultAction = await dispatch(
      submitAssignment({ id: selectedAssignment.id, data: values })
    );
    setSubmitting(false);

    if (submitAssignment.fulfilled.match(resultAction)) {
      message.success('Assignment submitted successfully!');
      setIsSubmitModalOpen(false);
      dispatch(fetchAssignments());
    } else {
      message.error(resultAction.payload || 'Failed to submit assignment.');
    }
  };

  const pendingList = assignments.filter((a) => !a.has_submitted);
  const submittedList = assignments.filter((a) => a.has_submitted && a.my_submission?.status !== 'graded');
  const gradedList = assignments.filter((a) => a.my_submission?.status === 'graded');

  const displayedList =
    activeTab === 'pending'
      ? pendingList
      : activeTab === 'submitted'
      ? submittedList
      : activeTab === 'graded'
      ? gradedList
      : assignments;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
          📑 Homework & Lab Assignments
        </Title>
        <Text type="secondary" style={{ fontSize: '13.5px' }}>
          Submit project deliverables, review rubric standards, and inspect instructor feedback.
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k)}
        items={[
          { key: 'all', label: `All Tasks (${assignments.length})` },
          { key: 'pending', label: `Pending Submission (${pendingList.length})` },
          { key: 'submitted', label: `Under Review (${submittedList.length})` },
          { key: 'graded', label: `Graded & Feedback (${gradedList.length})` }
        ]}
      />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Loading assignments..." />
        </div>
      ) : displayedList.length === 0 ? (
        <Card style={{ borderRadius: '14px', textAlign: 'center', padding: '40px', marginTop: '16px' }}>
          <Empty description="No assignments found in this category." />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {displayedList.map((assignment) => {
            const sub = assignment.my_submission;
            const isGraded = sub?.status === 'graded';
            const isSubmitted = !!sub;

            return (
              <Card
                key={assignment.id}
                style={{
                  borderRadius: '14px',
                  border: isGraded ? '1px solid #86efac' : isSubmitted ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                }}
                bodyStyle={{ padding: '20px 24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {assignment.course && (
                        <Tag color="purple" style={{ fontWeight: 800 }}>
                          {assignment.course.code}
                        </Tag>
                      )}
                      <Tag color="gold" style={{ fontWeight: 700 }}>
                        Max {assignment.max_points} Points
                      </Tag>
                      <Tag color={isGraded ? 'success' : isSubmitted ? 'processing' : 'default'}>
                        {isGraded ? 'GRADED' : isSubmitted ? 'SUBMITTED' : 'NOT SUBMITTED'}
                      </Tag>
                    </div>

                    <Title level={4} style={{ margin: '4px 0 8px 0', fontWeight: 800, color: '#0f172a' }}>
                      {assignment.title}
                    </Title>

                    <Paragraph style={{ color: '#475569', fontSize: '13.5px', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                      {assignment.instructions || assignment.description || 'Complete required project tasks.'}
                    </Paragraph>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                      <span>
                        <ClockCircleOutlined /> Due: {assignment.due_date ? dayjs(assignment.due_date).format('MMM D, YYYY · h:mm A') : 'No deadline'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {isGraded ? (
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
                          {sub.score_obtained} / {assignment.max_points}
                        </div>
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleOpenReview(assignment)}
                          style={{ marginTop: '8px', background: '#10b981', borderColor: '#10b981', fontWeight: 600 }}
                        >
                          View Feedback & Rubric
                        </Button>
                      </div>
                    ) : isSubmitted ? (
                      <div>
                        <Tag color="blue" icon={<CheckCircleFilled />}>Submitted</Tag>
                        <div style={{ marginTop: '8px' }}>
                          <Button size="small" onClick={() => handleOpenSubmit(assignment)}>
                            Update Submission
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => handleOpenSubmit(assignment)}
                        style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700 }}
                      >
                        Submit Assignment
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>Submit Deliverable: {selectedAssignment?.title}</span>}
        open={isSubmitModalOpen}
        onCancel={() => setIsSubmitModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Confirm Submission"
        width={680}
      >
        {selectedAssignment && (
          <Form form={form} layout="vertical" onFinish={handleSubmitWork}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
              <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                Instructions:
              </Text>
              <Paragraph style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                {selectedAssignment.instructions || 'Provide detailed solution writeup and link to your code/artifacts.'}
              </Paragraph>
            </div>

            <Form.Item
              name="submission_text"
              label={<span style={{ fontWeight: 600 }}>Solution Writeup / GitHub Repo Link / Answer Notes</span>}
              rules={[{ required: true, message: 'Please enter your submission text or link.' }]}
            >
              <TextArea
                rows={6}
                placeholder="Paste your GitHub repository link, architectural summary, and solution notes here..."
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Review Feedback & Rubric Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800 }}>Graded Submission & Rubric Review</span>}
        open={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
        width={560}
      >
        {selectedAssignment && selectedAssignment.my_submission && (
          <div>
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #86efac', marginBottom: '20px', textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 700 }}>FINAL GRADE AWARDED</Text>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#166534' }}>
                {selectedAssignment.my_submission.score_obtained} / {selectedAssignment.max_points} Marks
              </div>
              <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                Graded by Instructor on {dayjs(selectedAssignment.my_submission.graded_at).format('MMMM D, YYYY')}
              </div>
            </div>

            {selectedAssignment.my_submission.teacher_feedback && (
              <div style={{ background: '#eef2ff', padding: '14px 16px', borderRadius: '10px', borderLeft: '4px solid #6366f1', marginBottom: '20px' }}>
                <strong style={{ color: '#4338ca', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Instructor Feedback:</strong>
                <span style={{ color: '#3730a3', fontSize: '13.5px', lineHeight: 1.5 }}>
                  {selectedAssignment.my_submission.teacher_feedback}
                </span>
              </div>
            )}

            <Title level={5} style={{ fontWeight: 800, marginBottom: '12px' }}>
              Rubric Criteria Score Breakdown
            </Title>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {(selectedAssignment.rubric_criteria || []).map((crit, idx) => {
                const awarded = selectedAssignment.my_submission.rubric_scores?.[crit.title] !== undefined
                  ? selectedAssignment.my_submission.rubric_scores[crit.title]
                  : '—';

                return (
                  <Card key={idx} size="small" bodyStyle={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>{crit.title}</strong>
                        {crit.description && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{crit.description}</div>
                        )}
                      </div>
                      <Tag color="green" style={{ fontSize: '13px', fontWeight: 700 }}>
                        {awarded} / {crit.max_points} pts
                      </Tag>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div>
              <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>Your Submitted Work:</Text>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-line', fontSize: '13px', color: '#334155' }}>
                {selectedAssignment.my_submission.submission_text}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StudentAssignmentsPage;
