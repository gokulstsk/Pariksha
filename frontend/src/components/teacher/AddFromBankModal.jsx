import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tabs,
  Table,
  Button,
  Tag,
  Select,
  InputNumber,
  Space,
  Typography,
  message,
  Card,
  Row,
  Col
} from 'antd';
import {
  DatabaseOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBankQuestions,
  fetchCategories,
  importFromBankToTest,
  addRandomPoolToTest
} from '../../store/slices/questionBankSlice';

const { Text, Title } = Typography;

const AddFromBankModal = ({ open, onCancel, testId, onImportSuccess }) => {
  const dispatch = useDispatch();
  const { questions, categories, isLoading } = useSelector((state) => state.questionBank);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [randomCount, setRandomCount] = useState(3);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchCategories());
      dispatch(fetchBankQuestions({
        category_id: selectedCategory,
        difficulty: selectedDifficulty
      }));
      setSelectedRowKeys([]);
    }
  }, [open, dispatch, selectedCategory, selectedDifficulty]);

  const handleImportSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one question to import.');
      return;
    }

    setActionLoading(true);
    const resultAction = await dispatch(
      importFromBankToTest({ testId, questionIds: selectedRowKeys })
    );
    setActionLoading(false);

    if (importFromBankToTest.fulfilled.match(resultAction)) {
      message.success(`Successfully imported ${selectedRowKeys.length} question(s)!`);
      onImportSuccess();
      onCancel();
    } else {
      message.error(resultAction.payload || 'Failed to import questions.');
    }
  };

  const handleAddRandomPool = async () => {
    setActionLoading(true);
    const resultAction = await dispatch(
      addRandomPoolToTest({
        testId,
        category_id: selectedCategory,
        difficulty: selectedDifficulty,
        count: randomCount
      })
    );
    setActionLoading(false);

    if (addRandomPoolToTest.fulfilled.match(resultAction)) {
      message.success('Random question pool added to assessment!');
      onImportSuccess();
      onCancel();
    } else {
      message.error(resultAction.payload || 'Failed to add random pool.');
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'question_type',
      key: 'type',
      width: 140,
      render: (type) => (
        <Tag color="purple" style={{ fontSize: '11px', fontWeight: 600 }}>
          {type.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Question Statement',
      dataIndex: 'question_text',
      key: 'text',
      ellipsis: true,
      render: (text) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{text}</span>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 160,
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
    }
  ];

  return (
    <Modal
      title={<span style={{ fontWeight: 800, fontSize: '18px' }}>Import Questions from Question Bank</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={860}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="select"
        items={[
          {
            key: 'select',
            label: (
              <span>
                <DatabaseOutlined /> Choose Specific Questions ({selectedRowKeys.length})
              </span>
            ),
            children: (
              <div>
                {/* Filter Header */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <Select
                    placeholder="Filter by Category"
                    allowClear
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                    style={{ width: '220px' }}
                    options={categories.map((c) => ({ label: c.name, value: c.id }))}
                  />
                  <Select
                    placeholder="Filter by Difficulty"
                    allowClear
                    value={selectedDifficulty}
                    onChange={(val) => setSelectedDifficulty(val)}
                    style={{ width: '160px' }}
                    options={[
                      { label: 'Easy', value: 'easy' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'Hard', value: 'hard' }
                    ]}
                  />
                </div>

                <Table
                  size="small"
                  rowKey="id"
                  loading={isLoading}
                  dataSource={questions}
                  columns={columns}
                  rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys)
                  }}
                  pagination={{ pageSize: 5 }}
                  style={{ marginBottom: '16px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleImportSelected}
                    loading={actionLoading}
                    disabled={selectedRowKeys.length === 0}
                    style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700 }}
                  >
                    Import {selectedRowKeys.length} Selected Question(s)
                  </Button>
                </div>
              </div>
            )
          },
          {
            key: 'random',
            label: (
              <span>
                <ThunderboltOutlined /> Add Random Question Pool
              </span>
            ),
            children: (
              <Card style={{ borderRadius: '12px', background: '#fafbff' }} bodyStyle={{ padding: '24px' }}>
                <Title level={5} style={{ marginTop: 0, fontWeight: 800 }}>
                  Randomized Question Pool
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
                  Automatically sample and clone random questions from your question bank into this test.
                </Text>

                <Row gutter={16} align="middle" style={{ marginBottom: '24px' }}>
                  <Col span={8}>
                    <Text strong style={{ display: 'block', marginBottom: '6px' }}>Category</Text>
                    <Select
                      placeholder="Any Category"
                      allowClear
                      value={selectedCategory}
                      onChange={(val) => setSelectedCategory(val)}
                      style={{ width: '100%' }}
                      options={categories.map((c) => ({ label: c.name, value: c.id }))}
                    />
                  </Col>
                  <Col span={8}>
                    <Text strong style={{ display: 'block', marginBottom: '6px' }}>Difficulty</Text>
                    <Select
                      placeholder="Any Difficulty"
                      allowClear
                      value={selectedDifficulty}
                      onChange={(val) => setSelectedDifficulty(val)}
                      style={{ width: '100%' }}
                      options={[
                        { label: 'Easy', value: 'easy' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Hard', value: 'hard' }
                      ]}
                    />
                  </Col>
                  <Col span={8}>
                    <Text strong style={{ display: 'block', marginBottom: '6px' }}>Number of Questions</Text>
                    <InputNumber min={1} max={20} value={randomCount} onChange={(v) => setRandomCount(v)} style={{ width: '100%' }} />
                  </Col>
                </Row>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={handleAddRandomPool}
                    loading={actionLoading}
                    style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 700 }}
                  >
                    Add {randomCount} Random Questions
                  </Button>
                </div>
              </Card>
            )
          }
        ]}
      />
    </Modal>
  );
};

export default AddFromBankModal;
