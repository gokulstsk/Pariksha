import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Table,
  Space,
  Select,
  Row,
  Col,
  Statistic,
  Drawer,
  InputNumber,
  Input,
  message,
  Empty,
  Spin,
  Avatar,
  Divider
} from 'antd';
import {
  TableOutlined,
  DownloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  EditOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGradebook, gradeAnswerManually } from '../../store/slices/gradebookSlice';
import { fetchCourses } from '../../store/slices/courseSlice';
import axiosClient from '../../api/axiosClient';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const GradebookPage = () => {
  const dispatch = useDispatch();
  const { tests, assignments, gradebook, isLoading } = useSelector((state) => state.gradebook);
  const { courses } = useSelector((state) => state.courses);

  const [courseFilter, setCourseFilter] = useState(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [isManualGradingDrawerOpen, setIsManualGradingDrawerOpen] = useState(false);
  const [selectedSubmissionData, setSelectedSubmissionData] = useState(null);
  const [essayScores, setEssayScores] = useState({});
  const [essayComments, setEssayComments] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchGradebook(courseFilter ? { course_id: courseFilter } : {}));
    dispatch(fetchCourses());
  }, [dispatch, courseFilter]);

  const handleExportCSV = async () => {
    try {
      const response = await axiosClient.get('/gradebook/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `moodle_gradebook_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Gradebook exported successfully as CSV.');
    } catch (error) {
      message.error('Failed to export CSV.');
    }
  };

  const handleOpenManualGrading = async (submissionId) => {
    try {
      setActionLoading(true);
      const res = await axiosClient.get(`/submissions/${submissionId}`);
      setSelectedSubmissionData(res.data.submission);
      const scores = {};
      const comments = {};
      (res.data.submission.answers || []).forEach((a) => {
        scores[a.id] = a.points_awarded;
        comments[a.id] = a.teacher_comment || '';
      });
      setEssayScores(scores);
      setEssayComments(comments);
      setIsManualGradingDrawerOpen(true);
      setActionLoading(false);
    } catch (error) {
      setActionLoading(false);
      message.error('Failed to load submission details.');
    }
  };

  const handleSaveManualAnswer = async (answerId) => {
    const pts = essayScores[answerId];
    const comm = essayComments[answerId];

    const resultAction = await dispatch(
      gradeAnswerManually({
        answerId,
        data: { points_awarded: pts, teacher_comment: comm }
      })
    );

    if (gradeAnswerManually.fulfilled.match(resultAction)) {
      message.success('Grade updated for this question!');
      if (selectedSubmissionData) {
        handleOpenManualGrading(selectedSubmissionData.id);
      }
      dispatch(fetchGradebook(courseFilter ? { course_id: courseFilter } : {}));
    }
  };

  // Build Dynamic Gradebook Table Columns
  const dynamicColumns = [
    {
      title: 'Student Roster',
      dataIndex: 'student',
      key: 'student',
      fixed: 'left',
      width: 220,
      render: (st) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={28} icon={<UserOutlined />} style={{ backgroundColor: '#4f46e5' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>{st.name}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{st.email}</div>
          </div>
        </div>
      )
    },
    ...tests.map((t) => ({
      title: (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5' }}>Test</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{t.title}</div>
        </div>
      ),
      key: `test_${t.id}`,
      width: 140,
      render: (_, record) => {
        const testObj = record.tests[t.id];
        if (!testObj) return <span style={{ color: '#cbd5e1' }}>—</span>;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag color={testObj.is_passed ? 'success' : 'error'} style={{ fontWeight: 700, margin: 0 }}>
              {testObj.percentage}%
            </Tag>
            {testObj.submissionId && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ fontSize: '11px', color: '#6366f1' }} />}
                onClick={() => handleOpenManualGrading(testObj.submissionId)}
              />
            )}
          </div>
        );
      }
    })),
    ...assignments.map((a) => ({
      title: (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>Assignment</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{a.title}</div>
        </div>
      ),
      key: `assgn_${a.id}`,
      width: 150,
      render: (_, record) => {
        const assgnObj = record.assignments[a.id];
        if (!assgnObj) return <span style={{ color: '#cbd5e1' }}>—</span>;
        return (
          <Tag color={assgnObj.status === 'graded' ? 'purple' : 'warning'} style={{ fontWeight: 700 }}>
            {assgnObj.score !== null ? `${assgnObj.score}/${a.max_points}` : 'Submitted'}
          </Tag>
        );
      }
    })),
    {
      title: 'Average %',
      dataIndex: 'averagePercentage',
      key: 'avg',
      fixed: 'right',
      width: 110,
      render: (avg) => (
        <span style={{ fontWeight: 800, fontSize: '14px', color: avg >= 60 ? '#10b981' : '#f59e0b' }}>
          {avg}%
        </span>
      )
    },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      fixed: 'right',
      width: 80,
      render: (gpa) => (
        <Tag color="gold" style={{ fontWeight: 800 }}>
          {gpa.toFixed(1)}
        </Tag>
      )
    }
  ];

  const filteredGradebook = gradebook.filter((entry) => {
    if (!searchStudent) return true;
    return (
      entry.student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      entry.student.email.toLowerCase().includes(searchStudent.toLowerCase())
    );
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            📊 Moodle Grader Report & Gradebook Hub
          </Title>
          <Text type="secondary" style={{ fontSize: '13.5px' }}>
            Comprehensive grade matrix across all tests and assignments with GPA weighting and export.
          </Text>
        </div>

        <Space size="middle">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 700 }}
          >
            Export to CSV
          </Button>
        </Space>
      </div>

      {/* Filter Bar */}
      <Card style={{ borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: '14px 18px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={12}>
            <Input
              placeholder="Search student by name or email..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              placeholder="Filter by Course"
              allowClear
              value={courseFilter}
              onChange={(val) => setCourseFilter(val)}
              style={{ width: '100%' }}
              options={[
                { label: 'All Courses & Assessments', value: null },
                ...courses.map((c) => ({ label: `${c.code}: ${c.title}`, value: c.id }))
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Gradebook Matrix Table */}
      <Card style={{ borderRadius: '14px', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 0 }}>
        <Table
          columns={dynamicColumns}
          dataSource={filteredGradebook}
          rowKey={(record) => record.student.id}
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="No student grades recorded yet." /> }}
        />
      </Card>

      {/* Manual Answer Grading Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800 }}>Manual Answer & Essay Grading</span>}
        open={isManualGradingDrawerOpen}
        onClose={() => setIsManualGradingDrawerOpen(false)}
        width={620}
      >
        {selectedSubmissionData && (
          <div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                {selectedSubmissionData.student?.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Assessment: {selectedSubmissionData.test?.title}
              </div>
              <div style={{ marginTop: '6px' }}>
                <Tag color={selectedSubmissionData.is_passed ? 'success' : 'error'} style={{ fontWeight: 700 }}>
                  Current Score: {selectedSubmissionData.score_obtained} / {selectedSubmissionData.max_score} ({selectedSubmissionData.percentage}%)
                </Tag>
              </div>
            </div>

            <Title level={5} style={{ fontWeight: 800, marginBottom: '14px' }}>
              Questions & Student Answers
            </Title>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(selectedSubmissionData.answers || []).map((ans, idx) => {
                const q = ans.question;
                const isEssay = q?.question_type === 'essay';

                return (
                  <Card
                    key={ans.id}
                    size="small"
                    style={{
                      borderRadius: '10px',
                      border: isEssay ? '2px solid #818cf8' : '1px solid #e2e8f0',
                      background: isEssay ? '#fafbff' : '#ffffff'
                    }}
                    bodyStyle={{ padding: '14px 16px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <Tag color="purple" style={{ fontWeight: 700 }}>
                        Q{idx + 1}: {q?.question_type?.toUpperCase()}
                      </Tag>
                      <Tag color="gold">Max {q?.points} pts</Tag>
                    </div>

                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13.5px', marginBottom: '10px' }}>
                      {q?.question_text}
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                      <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>STUDENT RESPONSE:</Text>
                      <div style={{ fontSize: '13px', color: '#334155', whiteSpace: 'pre-line', marginTop: '4px' }}>
                        {ans.essay_answer || ans.text_answer || (ans.matching_answers ? JSON.stringify(ans.matching_answers) : ans.numerical_answer !== null ? String(ans.numerical_answer) : 'Option selected')}
                      </div>
                    </div>

                    <Divider style={{ margin: '10px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontSize: '12px' }}>Award Points:</Text>
                        <InputNumber
                          min={0}
                          max={q?.points || 10}
                          step={0.5}
                          value={essayScores[ans.id]}
                          onChange={(val) => setEssayScores({ ...essayScores, [ans.id]: val })}
                          style={{ width: '90px' }}
                        />
                      </div>

                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleSaveManualAnswer(ans.id)}
                        style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
                      >
                        Save Grade
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default GradebookPage;
