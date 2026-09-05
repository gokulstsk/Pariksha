import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Space,
  Table,
  Select,
  Input,
  Row,
  Col,
  Modal,
  Form,
  Popconfirm,
  message,
  Divider,
  Drawer,
  Empty
} from 'antd';
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderAddOutlined,
  DownloadOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchBankQuestions,
  createBankQuestion
} from '../../store/slices/questionBankSlice';
import QuestionModal from '../../components/teacher/QuestionModal';

const { Title, Text, Paragraph } = Typography;

const QuestionBankPage = () => {
  const dispatch = useDispatch();
  const { categories, questions, isLoading } = useSelector((state) => state.questionBank);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [categoryForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBankQuestions({
      category_id: selectedCategory,
      question_type: selectedType,
      difficulty: selectedDifficulty,
      search: searchKeyword
    }));
  }, [dispatch, selectedCategory, selectedType, selectedDifficulty, searchKeyword]);

  const handleCreateCategory = async (values) => {
    setActionLoading(true);
    const resultAction = await dispatch(createCategory(values));
    setActionLoading(false);

    if (createCategory.fulfilled.match(resultAction)) {
      message.success('Category created successfully.');
      setIsCategoryModalOpen(false);
      categoryForm.resetFields();
      dispatch(fetchCategories());
    } else {
      message.error(resultAction.payload || 'Failed to create category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    const resultAction = await dispatch(deleteCategory(id));
    if (deleteCategory.fulfilled.match(resultAction)) {
      message.success('Category deleted.');
      if (selectedCategory === id) setSelectedCategory(null);
      dispatch(fetchCategories());
    }
  };

  const handleSaveBankQuestion = async (values) => {
    setActionLoading(true);
    const resultAction = await dispatch(createBankQuestion(values));
    setActionLoading(false);

    if (createBankQuestion.fulfilled.match(resultAction)) {
      message.success('Question added to Question Bank.');
      setIsQuestionModalOpen(false);
      dispatch(fetchBankQuestions({
        category_id: selectedCategory,
        question_type: selectedType,
        difficulty: selectedDifficulty
      }));
    } else {
      message.error(resultAction.payload || 'Failed to create question.');
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `question_bank_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('Question Bank exported to JSON.');
  };

  const columns = [
    {
      title: 'Question Statement',
      dataIndex: 'question_text',
      key: 'text',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13.5px' }}>{text}</div>
          {record.tags && record.tags.length > 0 && (
            <div style={{ marginTop: '4px', display: 'flex', gap: '4px' }}>
              {record.tags.map((t, idx) => (
                <Tag key={idx} style={{ fontSize: '10px' }}>{t}</Tag>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Format',
      dataIndex: 'question_type',
      key: 'type',
      width: 130,
      render: (type) => (
        <Tag color="purple" style={{ fontSize: '11px', fontWeight: 600 }}>
          {type.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (cat) => cat ? <Tag color="blue">{cat.name}</Tag> : <Text type="secondary">General</Text>
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (diff) => {
        const color = diff === 'hard' ? 'error' : diff === 'easy' ? 'success' : 'warning';
        return <Tag color={color}>{diff?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      render: (pts) => <Tag color="gold">{pts} pts</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setPreviewQuestion(record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            🏛️ Question Bank & Taxonomy
          </Title>
          <Text type="secondary" style={{ fontSize: '13.5px' }}>
            Manage master repository of assessment items, categorize by subject, and reuse across tests.
          </Text>
        </div>

        <Space size="middle">
          <Button icon={<DownloadOutlined />} onClick={handleExportJSON}>
            Export JSON
          </Button>
          <Button icon={<FolderAddOutlined />} onClick={() => setIsCategoryModalOpen(true)}>
            New Category
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsQuestionModalOpen(true)}
            style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700 }}
          >
            Add to Bank
          </Button>
        </Space>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
        <Button
          type={selectedCategory === null ? 'primary' : 'default'}
          size="small"
          onClick={() => setSelectedCategory(null)}
          style={{ borderRadius: '16px', fontWeight: 600 }}
        >
          All Categories ({questions.length})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            type={selectedCategory === cat.id ? 'primary' : 'default'}
            size="small"
            onClick={() => setSelectedCategory(cat.id)}
            style={{ borderRadius: '16px', fontWeight: 600 }}
          >
            {cat.name} ({cat.question_count || 0})
          </Button>
        ))}
      </div>

      {/* Search & Filters Card */}
      <Card style={{ borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: '14px 18px' }}>
        <Row gutter={12} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Search master question statements..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={12} md={7}>
            <Select
              placeholder="Filter by Format"
              allowClear
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              style={{ width: '100%' }}
              options={[
                { value: 'single_choice', label: 'Single Choice (MCQ)' },
                { value: 'multiple_choice', label: 'Multiple Choice' },
                { value: 'true_false', label: 'True / False' },
                { value: 'short_answer', label: 'Short Answer' },
                { value: 'matching', label: 'Matching Pairs' },
                { value: 'numerical', label: 'Numerical' },
                { value: 'cloze', label: 'Fill in the Blanks' },
                { value: 'essay', label: 'Essay / Open Response' },
                { value: 'ordering', label: 'Ordering / Sequence' }
              ]}
            />
          </Col>
          <Col xs={12} md={7}>
            <Select
              placeholder="Filter by Difficulty"
              allowClear
              value={selectedDifficulty}
              onChange={(val) => setSelectedDifficulty(val)}
              style={{ width: '100%' }}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' }
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Questions Table */}
      <Card style={{ borderRadius: '14px', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: '0' }}>
        <Table
          columns={columns}
          dataSource={questions}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: <Empty description="No questions found in this category." /> }}
        />
      </Card>

      {/* Question Authoring Modal */}
      <QuestionModal
        open={isQuestionModalOpen}
        onCancel={() => setIsQuestionModalOpen(false)}
        onSubmit={handleSaveBankQuestion}
        loading={actionLoading}
        categories={categories}
      />

      {/* Category Creation Modal */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>Create Question Category</span>}
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        onOk={() => categoryForm.submit()}
        confirmLoading={actionLoading}
        okText="Create Category"
      >
        <Form form={categoryForm} layout="vertical" onFinish={handleCreateCategory}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true, message: 'Please enter category name' }]}>
            <Input placeholder="e.g. Distributed Consensus or React Hooks" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input placeholder="Topics and concepts covered in this category" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Question Preview Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800 }}>Question Preview & Solution Notes</span>}
        open={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        width={500}
      >
        {previewQuestion && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <Tag color="purple">{previewQuestion.question_type.toUpperCase()}</Tag>
              <Tag color="gold">{previewQuestion.points} Points</Tag>
              {previewQuestion.difficulty && <Tag color="blue">{previewQuestion.difficulty.toUpperCase()}</Tag>}
            </div>

            <Title level={5} style={{ marginTop: 0, fontWeight: 700 }}>
              {previewQuestion.question_text}
            </Title>

            <Divider style={{ margin: '14px 0' }} />

            {/* Options display */}
            {previewQuestion.options && previewQuestion.options.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '13px' }}>Answer Options:</Text>
                {previewQuestion.options.map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: opt.is_correct ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${opt.is_correct ? '#86efac' : '#e2e8f0'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px'
                    }}
                  >
                    <span>{opt.option_text}</span>
                    {opt.is_correct && <Tag color="green" icon={<CheckCircleFilled />}>Correct</Tag>}
                  </div>
                ))}
              </div>
            )}

            {/* Matching Pairs Display */}
            {previewQuestion.matching_pairs && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>Matching Key Pairs:</Text>
                {previewQuestion.matching_pairs.map((p, i) => (
                  <div key={i} style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', marginBottom: '4px', fontSize: '13px' }}>
                    <strong>{p.left}</strong> ↔ <span>{p.right}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Numerical Display */}
            {previewQuestion.numerical_answer !== null && previewQuestion.numerical_answer !== undefined && (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', marginBottom: '16px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>Target Answer: </Text>
                <strong style={{ color: '#166534' }}>{previewQuestion.numerical_answer} {previewQuestion.unit}</strong>
                {previewQuestion.tolerance > 0 && <span style={{ fontSize: '12px', color: '#475569' }}> (± {previewQuestion.tolerance})</span>}
              </div>
            )}

            {/* Explanation Display */}
            {previewQuestion.explanation && (
              <div style={{ padding: '12px 14px', background: '#eef2ff', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                <strong style={{ color: '#4338ca', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Solution Explanation:</strong>
                <span style={{ color: '#3730a3', fontSize: '13px', lineHeight: 1.5 }}>{previewQuestion.explanation}</span>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default QuestionBankPage;
