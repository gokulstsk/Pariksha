import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Card,
  Space,
  Tag,
  Row,
  Col,
  Divider,
  Popconfirm,
  Empty,
  Spin,
  message,
  Switch,
  Breadcrumb
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  CheckCircleFilled,
  LeftOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchTestById,
  updateTest,
  togglePublishTest,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions
} from '../../store/slices/testSlice';
import { fetchCategories } from '../../store/slices/questionBankSlice';
import QuestionModal from '../../components/teacher/QuestionModal';
import BulkImportModal from '../../components/teacher/BulkImportModal';
import TestModal from '../../components/teacher/TestModal';
import AddFromBankModal from '../../components/teacher/AddFromBankModal';

const { Title, Text, Paragraph } = Typography;

const TestEditorPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTest, isLoading } = useSelector((state) => state.test);
  const { categories } = useSelector((state) => state.questionBank);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBankImportModalOpen, setIsBankImportModalOpen] = useState(false);
  const [isTestSettingsModalOpen, setIsTestSettingsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchTestById(id));
    dispatch(fetchCategories());
  }, [dispatch, id]);

  const handleTogglePublish = async () => {
    const resultAction = await dispatch(togglePublishTest(id));
    if (togglePublishTest.fulfilled.match(resultAction)) {
      message.success(`Test is now ${resultAction.payload.is_published ? 'Published' : 'Draft'}`);
    }
  };

  const handleUpdateTestSettings = async (values) => {
    setActionLoading(true);
    const resultAction = await dispatch(updateTest({ id, data: values }));
    setActionLoading(false);
    if (updateTest.fulfilled.match(resultAction)) {
      message.success('Assessment settings updated.');
      setIsTestSettingsModalOpen(false);
      dispatch(fetchTestById(id));
    }
  };

  const handleSaveQuestion = async (values) => {
    setActionLoading(true);
    if (editingQuestion) {
      const resultAction = await dispatch(updateQuestion({ id: editingQuestion.id, questionData: values }));
      if (updateQuestion.fulfilled.match(resultAction)) {
        message.success('Question updated.');
        setIsQuestionModalOpen(false);
        setEditingQuestion(null);
        dispatch(fetchTestById(id));
      }
    } else {
      const resultAction = await dispatch(addQuestion({ testId: id, questionData: values }));
      if (addQuestion.fulfilled.match(resultAction)) {
        message.success('Question added successfully.');
        setIsQuestionModalOpen(false);
        dispatch(fetchTestById(id));
      }
    }
    setActionLoading(false);
  };

  const handleDeleteQuestion = async (questionId) => {
    const resultAction = await dispatch(deleteQuestion(questionId));
    if (deleteQuestion.fulfilled.match(resultAction)) {
      message.success('Question deleted.');
      dispatch(fetchTestById(id));
    }
  };

  const handleBulkImport = async (questionsArray) => {
    setActionLoading(true);
    const resultAction = await dispatch(bulkImportQuestions({ testId: id, questions: questionsArray }));
    setActionLoading(false);
    if (bulkImportQuestions.fulfilled.match(resultAction)) {
      message.success('Questions imported successfully.');
      setIsBulkModalOpen(false);
      dispatch(fetchTestById(id));
    } else {
      message.error(resultAction.payload || 'Failed to import questions.');
    }
  };

  if (isLoading && !currentTest) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="Loading Assessment..." />
      </div>
    );
  }

  if (!currentTest) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Empty description="Assessment not found." />
        <Button type="primary" onClick={() => navigate('/teacher')} style={{ marginTop: '16px' }}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const questions = currentTest.questions || [];
  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumb style={{ marginBottom: '12px' }} items={[{ title: <Link to="/teacher">Assessments</Link> }, { title: currentTest.title }]} />

      {/* Header Info Card */}
      <Card
        style={{
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Tag color="cyan" style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px' }}>
                {currentTest.category}
              </Tag>
              {currentTest.course && (
                <Tag color="purple" style={{ fontSize: '11px', fontWeight: 700 }}>
                  {currentTest.course.code}
                </Tag>
              )}
              {currentTest.access_password && (
                <Tag color="orange" icon={<LockOutlined />}>Passcode Protected</Tag>
              )}
              <Tag color={currentTest.is_published ? 'success' : 'default'} style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px' }}>
                {currentTest.is_published ? 'PUBLISHED' : 'DRAFT'}
              </Tag>
            </div>
            <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>
              {currentTest.title}
            </Title>
            <Paragraph type="secondary" style={{ margin: 0, maxWidth: '700px', fontSize: '13px' }}>
              {currentTest.description || 'No description provided.'}
            </Paragraph>
          </div>

          <Space wrap size="small">
            <Button size="small" icon={<SettingOutlined />} onClick={() => setIsTestSettingsModalOpen(true)}>
              Settings
            </Button>
            <Button size="small" icon={<UsergroupAddOutlined />} onClick={() => navigate(`/teacher/test/${id}/submissions`)}>
              Submissions
            </Button>
            <Switch size="small" checked={currentTest.is_published} checkedChildren="Published" unCheckedChildren="Draft" onChange={handleTogglePublish} />
          </Space>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <Row gutter={12}>
          <Col span={6}>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600 }}>
              DURATION
            </Text>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
              <ClockCircleOutlined /> {currentTest.duration_minutes} Mins
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600 }}>
              PASSING CRITERIA
            </Text>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '1px' }}>{currentTest.pass_percentage}% to Pass</div>
          </Col>
          <Col span={6}>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600 }}>
              MAX ATTEMPTS
            </Text>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '1px' }}>
              {currentTest.max_attempts === 0 ? 'Unlimited' : `${currentTest.max_attempts} Attempt(s)`}
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600 }}>
              TOTAL MARKS
            </Text>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#4f46e5', marginTop: '1px' }}>{totalPoints} Total Marks ({questions.length} Qs)</div>
          </Col>
        </Row>
      </Card>

      {/* Questions Manager Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>
            Assessment Questions ({questions.length})
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Author diverse formats including MCQs, Matching pairs, Numerical, Cloze, Essays, and Sequencing.
          </Text>
        </div>

        <Space size="small">
          <Button size="middle" icon={<DatabaseOutlined />} onClick={() => setIsBankImportModalOpen(true)}>
            Import from Bank
          </Button>
          <Button size="middle" icon={<CloudUploadOutlined />} onClick={() => setIsBulkModalOpen(true)}>
            Bulk JSON
          </Button>
          <Button
            type="primary"
            size="middle"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingQuestion(null);
              setIsQuestionModalOpen(true);
            }}
            style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
          >
            Add Question
          </Button>
        </Space>
      </div>

      {questions.length === 0 ? (
        <Card style={{ borderRadius: '14px', textAlign: 'center', padding: '30px' }}>
          <Empty description="No questions added to this assessment yet." />
          <Space style={{ marginTop: '12px' }}>
            <Button icon={<DatabaseOutlined />} onClick={() => setIsBankImportModalOpen(true)}>
              Import from Question Bank
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingQuestion(null);
                setIsQuestionModalOpen(true);
              }}
            >
              Add First Question
            </Button>
          </Space>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q, idx) => (
            <Card
              key={q.id}
              style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              bodyStyle={{ padding: '14px 16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '12px',
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Tag color="purple" style={{ fontSize: '10px', fontWeight: 600 }}>
                        {q.question_type.replace('_', ' ').toUpperCase()}
                      </Tag>
                      <Tag color="gold" style={{ fontSize: '10px', fontWeight: 600 }}>
                        {q.points} {q.points === 1 ? 'Point' : 'Points'}
                      </Tag>
                      {q.difficulty && (
                        <Tag color={q.difficulty === 'hard' ? 'error' : q.difficulty === 'easy' ? 'success' : 'blue'} style={{ fontSize: '10px' }}>
                          {q.difficulty.toUpperCase()}
                        </Tag>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>{q.question_text}</div>
                  </div>
                </div>

                <Space size="small">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsQuestionModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Popconfirm title="Delete this question?" onConfirm={() => handleDeleteQuestion(q.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>

              {/* Options display */}
              {q.options && q.options.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '34px' }}>
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={opt.id || optIdx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: opt.is_correct ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${opt.is_correct ? '#86efac' : '#e2e8f0'}`,
                        color: opt.is_correct ? '#166534' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px'
                      }}
                    >
                      <span style={{ fontWeight: opt.is_correct ? 600 : 400 }}>{opt.option_text}</span>
                      {opt.is_correct && (
                        <Tag color="green" icon={<CheckCircleFilled />} style={{ margin: 0 }}>
                          Correct Answer
                        </Tag>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Matching display */}
              {q.matching_pairs && (
                <div style={{ marginTop: '10px', marginLeft: '34px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <Text strong style={{ fontSize: '12px' }}>Matching Pairs:</Text>
                  {q.matching_pairs.map((p, pIdx) => (
                    <div key={pIdx} style={{ fontSize: '13px', marginTop: '4px' }}>
                      <strong>{p.left}</strong> ↔ <span style={{ color: '#4f46e5' }}>{p.right}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Numerical display */}
              {q.numerical_answer !== null && q.numerical_answer !== undefined && (
                <div style={{ marginTop: '10px', marginLeft: '34px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', fontSize: '13px' }}>
                  Target Value: <strong style={{ color: '#166534' }}>{q.numerical_answer} {q.unit}</strong> (± {q.tolerance || 0})
                </div>
              )}

              {/* Cloze display */}
              {q.cloze_template && (
                <div style={{ marginTop: '10px', marginLeft: '34px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px' }}>
                  <div>Template: <em>{q.cloze_template}</em></div>
                </div>
              )}

              {/* Explanation display */}
              {q.explanation && (
                <div style={{ marginTop: '10px', marginLeft: '34px', padding: '8px 12px', background: '#eef2ff', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <Text strong style={{ color: '#4338ca', fontSize: '12px' }}>
                    Explanation:{' '}
                  </Text>
                  <span style={{ color: '#3730a3', fontSize: '13px' }}>{q.explanation}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Question Authoring Modal */}
      <QuestionModal
        open={isQuestionModalOpen}
        onCancel={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={handleSaveQuestion}
        initialValues={editingQuestion}
        loading={actionLoading}
        categories={categories}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal open={isBulkModalOpen} onCancel={() => setIsBulkModalOpen(false)} onImport={handleBulkImport} loading={actionLoading} />

      {/* Import from Question Bank Modal */}
      <AddFromBankModal
        open={isBankImportModalOpen}
        onCancel={() => setIsBankImportModalOpen(false)}
        testId={id}
        onImportSuccess={() => dispatch(fetchTestById(id))}
      />

      {/* Test Settings Modal */}
      <TestModal open={isTestSettingsModalOpen} onCancel={() => setIsTestSettingsModalOpen(false)} onSubmit={handleUpdateTestSettings} initialValues={currentTest} loading={actionLoading} />
    </div>
  );
};

export default TestEditorPage;
