import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Radio,
  Checkbox,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  message,
  Tag
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  ApartmentOutlined,
  CalculatorOutlined,
  EditOutlined,
  OrderedListOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const QuestionModal = ({ open, onCancel, onSubmit, initialValues, loading, categories = [] }) => {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState('single_choice');
  
  // MCQ Options
  const [options, setOptions] = useState([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false }
  ]);
  const [selectedSingleIndex, setSelectedSingleIndex] = useState(0);

  // Matching Pairs
  const [matchingPairs, setMatchingPairs] = useState([
    { id: '1', left: '', right: '' },
    { id: '2', left: '', right: '' }
  ]);

  // Cloze Blanks
  const [clozeAnswers, setClozeAnswers] = useState({ blank_1: '', blank_2: '' });

  // Ordering Items
  const [orderItems, setOrderItems] = useState(['', '', '']);

  // Rubric Criteria for Essay
  const [rubricCriteria, setRubricCriteria] = useState([
    { title: 'Content Accuracy', max_points: 3, description: 'Core technical concepts correct' },
    { title: 'Clarity & Depth', max_points: 2, description: 'Well-structured explanation' }
  ]);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        const qType = initialValues.question_type || 'single_choice';
        setQuestionType(qType);
        form.setFieldsValue({
          question_text: initialValues.question_text,
          question_type: qType,
          points: initialValues.points || 1,
          category_id: initialValues.category_id || null,
          difficulty: initialValues.difficulty || 'medium',
          explanation: initialValues.explanation || '',
          correct_answer_text: initialValues.correct_answer_text || '',
          numerical_answer: initialValues.numerical_answer || null,
          tolerance: initialValues.tolerance || 0,
          unit: initialValues.unit || '',
          cloze_template: initialValues.cloze_template || ''
        });

        if (initialValues.options && initialValues.options.length > 0) {
          const loadedOptions = initialValues.options.map((opt) => ({
            option_text: opt.option_text,
            is_correct: !!opt.is_correct
          }));
          setOptions(loadedOptions);
          const correctIdx = loadedOptions.findIndex((o) => o.is_correct);
          setSelectedSingleIndex(correctIdx !== -1 ? correctIdx : 0);
        }

        if (initialValues.matching_pairs && Array.isArray(initialValues.matching_pairs)) {
          setMatchingPairs(initialValues.matching_pairs);
        }

        if (initialValues.cloze_answers) {
          setClozeAnswers(initialValues.cloze_answers);
        }

        if (initialValues.order_items && Array.isArray(initialValues.order_items)) {
          setOrderItems(initialValues.order_items);
        }

        if (initialValues.rubric_criteria && Array.isArray(initialValues.rubric_criteria)) {
          setRubricCriteria(initialValues.rubric_criteria);
        }
      } else {
        form.resetFields();
        setQuestionType('single_choice');
        setOptions([
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ]);
        setSelectedSingleIndex(0);
        setMatchingPairs([
          { id: '1', left: '', right: '' },
          { id: '2', left: '', right: '' }
        ]);
        setClozeAnswers({ blank_1: '', blank_2: '' });
        setOrderItems(['', '', '']);
        setRubricCriteria([
          { title: 'Content Accuracy', max_points: 3, description: 'Core technical concepts correct' },
          { title: 'Clarity & Depth', max_points: 2, description: 'Well-structured explanation' }
        ]);
        form.setFieldsValue({
          question_type: 'single_choice',
          points: 1,
          difficulty: 'medium'
        });
      }
    }
  }, [open, initialValues, form]);

  const handleTypeChange = (value) => {
    setQuestionType(value);
    if (value === 'true_false') {
      setOptions([
        { option_text: 'True', is_correct: true },
        { option_text: 'False', is_correct: false }
      ]);
      setSelectedSingleIndex(0);
    } else if (value === 'single_choice') {
      const updated = options.map((opt, i) => ({ ...opt, is_correct: i === selectedSingleIndex }));
      setOptions(updated);
    }
  };

  const handleOptionTextChange = (index, text) => {
    const updated = [...options];
    updated[index].option_text = text;
    setOptions(updated);
  };

  const handleSingleCorrectChange = (index) => {
    setSelectedSingleIndex(index);
    const updated = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index
    }));
    setOptions(updated);
  };

  const handleMultiCorrectToggle = (index, checked) => {
    const updated = [...options];
    updated[index].is_correct = checked;
    setOptions(updated);
  };

  const addOptionField = () => {
    if (options.length >= 8) {
      message.warning('Maximum 8 options allowed per question.');
      return;
    }
    setOptions([...options, { option_text: '', is_correct: false }]);
  };

  const removeOptionField = (index) => {
    if (options.length <= 2) {
      message.warning('At least 2 options are required.');
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    if (selectedSingleIndex >= updated.length) {
      setSelectedSingleIndex(0);
    }
  };

  // Matching helpers
  const handleMatchingChange = (idx, field, val) => {
    const updated = [...matchingPairs];
    updated[idx][field] = val;
    setMatchingPairs(updated);
  };

  const addMatchingPair = () => {
    setMatchingPairs([...matchingPairs, { id: String(Date.now()), left: '', right: '' }]);
  };

  const removeMatchingPair = (idx) => {
    if (matchingPairs.length <= 2) return;
    setMatchingPairs(matchingPairs.filter((_, i) => i !== idx));
  };

  // Ordering helpers
  const handleOrderChange = (idx, val) => {
    const updated = [...orderItems];
    updated[idx] = val;
    setOrderItems(updated);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, '']);
  };

  const removeOrderItem = (idx) => {
    if (orderItems.length <= 2) return;
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  // Rubric helpers
  const handleRubricChange = (idx, field, val) => {
    const updated = [...rubricCriteria];
    updated[idx][field] = val;
    setRubricCriteria(updated);
  };

  const addRubricCriterion = () => {
    setRubricCriteria([...rubricCriteria, { title: '', max_points: 2, description: '' }]);
  };

  const removeRubricCriterion = (idx) => {
    if (rubricCriteria.length <= 1) return;
    setRubricCriteria(rubricCriteria.filter((_, i) => i !== idx));
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Validate per question type
      if (questionType === 'single_choice' || questionType === 'multiple_choice' || questionType === 'true_false') {
        const emptyOptions = options.some((o) => !o.option_text.trim());
        if (emptyOptions) {
          message.error('Please fill in all option choices.');
          return;
        }
        const hasCorrect = options.some((o) => o.is_correct);
        if (!hasCorrect) {
          message.error('Please mark at least one option as the correct answer.');
          return;
        }
      } else if (questionType === 'short_answer') {
        if (!values.correct_answer_text?.trim()) {
          message.error('Please enter the expected keyword answer.');
          return;
        }
      } else if (questionType === 'matching') {
        const invalid = matchingPairs.some((p) => !p.left.trim() || !p.right.trim());
        if (invalid) {
          message.error('Please fill in both Column A and Column B for all matching pairs.');
          return;
        }
      } else if (questionType === 'numerical') {
        if (values.numerical_answer === undefined || values.numerical_answer === null) {
          message.error('Please specify the numerical target answer.');
          return;
        }
      } else if (questionType === 'ordering') {
        const empty = orderItems.some((item) => !item.trim());
        if (empty) {
          message.error('Please fill in all ordering sequence items.');
          return;
        }
      }

      onSubmit({
        ...values,
        options: ['single_choice', 'multiple_choice', 'true_false'].includes(questionType) ? options : [],
        matching_pairs: questionType === 'matching' ? matchingPairs : null,
        numerical_answer: questionType === 'numerical' ? values.numerical_answer : null,
        tolerance: questionType === 'numerical' ? values.tolerance || 0 : 0,
        unit: questionType === 'numerical' ? values.unit || null : null,
        cloze_template: questionType === 'cloze' ? values.cloze_template : null,
        cloze_answers: questionType === 'cloze' ? clozeAnswers : null,
        rubric_criteria: questionType === 'essay' ? rubricCriteria : null,
        order_items: questionType === 'ordering' ? orderItems : null
      });
    });
  };

  return (
    <Modal
      title={<span style={{ fontWeight: 800, fontSize: '18px' }}>{initialValues ? 'Edit Assessment Question' : 'Author New Assessment Question'}</span>}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText={initialValues ? 'Update Question' : 'Save Question'}
      width={780}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: '14px' }}>
        <Row gutter={14}>
          <Col span={10}>
            <Form.Item
              name="question_type"
              label={<span style={{ fontWeight: 600 }}>Question Format</span>}
              rules={[{ required: true }]}
            >
              <Select
                size="middle"
                onChange={handleTypeChange}
                options={[
                  { value: 'single_choice', label: '🔘 Single Choice (MCQ)' },
                  { value: 'multiple_choice', label: '☑️ Multiple Choice (Multi-Select)' },
                  { value: 'true_false', label: '⚖️ True / False Statement' },
                  { value: 'short_answer', label: '🔤 Short Answer / Keyword' },
                  { value: 'matching', label: '🔗 Matching Pairs (Column A ↔ B)' },
                  { value: 'numerical', label: '🔢 Numerical with Tolerance Margin' },
                  { value: 'cloze', label: '📝 Fill in the Blanks (Cloze)' },
                  { value: 'essay', label: '📄 Essay / Open Response (Rubric)' },
                  { value: 'ordering', label: '↕️ Ordering / Sequence' }
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={7}>
            <Form.Item name="category_id" label={<span style={{ fontWeight: 600 }}>Category Taxon</span>}>
              <Select
                placeholder="Select Category"
                allowClear
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item name="difficulty" label={<span style={{ fontWeight: 600 }}>Difficulty</span>}>
              <Select
                options={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' }
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              name="points"
              label={<span style={{ fontWeight: 600 }}>Points</span>}
              rules={[{ required: true, message: 'Points' }]}
            >
              <InputNumber min={0.5} max={50} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="question_text"
          label={<span style={{ fontWeight: 600 }}>Question Statement / Prompt</span>}
          rules={[{ required: true, message: 'Question statement is required.' }]}
        >
          <TextArea rows={3} placeholder="Type question statement, instructions, or code snippet..." style={{ fontSize: '14px' }} />
        </Form.Item>

        <Divider style={{ margin: '14px 0' }} />

        {/* 1. MCQ & True/False Section */}
        {['single_choice', 'multiple_choice', 'true_false'].includes(questionType) && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <Text strong style={{ fontSize: '14px' }}>Answer Choices</Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {questionType === 'multiple_choice'
                    ? 'Check all options that are correct.'
                    : 'Select the radio button next to the correct option.'}
                </div>
              </div>
              {questionType !== 'true_false' && (
                <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addOptionField}>
                  Add Option
                </Button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map((opt, idx) => (
                <Card
                  key={idx}
                  size="small"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: opt.is_correct ? '#f0fdf4' : '#ffffff',
                    borderColor: opt.is_correct ? '#86efac' : '#e2e8f0',
                    transition: 'all 0.2s ease'
                  }}
                  bodyStyle={{ padding: '8px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {questionType === 'multiple_choice' ? (
                      <Checkbox
                        checked={opt.is_correct}
                        onChange={(e) => handleMultiCorrectToggle(idx, e.target.checked)}
                      />
                    ) : (
                      <Radio
                        checked={questionType === 'single_choice' || questionType === 'true_false' ? idx === selectedSingleIndex : opt.is_correct}
                        onChange={() => handleSingleCorrectChange(idx)}
                      />
                    )}

                    <Input
                      value={opt.option_text}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      disabled={questionType === 'true_false'}
                      style={{
                        flex: 1,
                        fontWeight: opt.is_correct ? 600 : 400
                      }}
                    />

                    {opt.is_correct && (
                      <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircleFilled /> Correct
                      </span>
                    )}

                    {questionType !== 'true_false' && options.length > 2 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeOptionField(idx)}
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 2. Short Answer Section */}
        {questionType === 'short_answer' && (
          <Form.Item
            name="correct_answer_text"
            label={<span style={{ fontWeight: 600 }}>Exact Expected Answer Keyword</span>}
            rules={[{ required: true, message: 'Please enter the expected keyword.' }]}
            extra="The student answer will be matched case-insensitively against this target."
          >
            <Input placeholder="e.g. hasMany or useState" />
          </Form.Item>
        )}

        {/* 3. Matching Pairs Section */}
        {questionType === 'matching' && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <Text strong style={{ fontSize: '14px' }}>Matching Pairs Setup</Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Define items in Column A and their correct matching pair in Column B.</div>
              </div>
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addMatchingPair}>
                Add Pair
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {matchingPairs.map((pair, idx) => (
                <Row key={pair.id || idx} gutter={10} align="middle">
                  <Col span={11}>
                    <Input
                      placeholder={`Column A #${idx + 1} (Question item)`}
                      value={pair.left}
                      onChange={(e) => handleMatchingChange(idx, 'left', e.target.value)}
                    />
                  </Col>
                  <Col span={1} style={{ textAlign: 'center', fontWeight: 700, color: '#4f46e5' }}>
                    ↔
                  </Col>
                  <Col span={10}>
                    <Input
                      placeholder={`Column B #${idx + 1} (Matching Target)`}
                      value={pair.right}
                      onChange={(e) => handleMatchingChange(idx, 'right', e.target.value)}
                    />
                  </Col>
                  <Col span={2}>
                    {matchingPairs.length > 2 && (
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeMatchingPair(idx)} />
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          </div>
        )}

        {/* 4. Numerical with Tolerance Section */}
        {questionType === 'numerical' && (
          <Row gutter={16} style={{ marginBottom: '14px' }}>
            <Col span={10}>
              <Form.Item
                name="numerical_answer"
                label={<span style={{ fontWeight: 600 }}>Target Value (Number)</span>}
                rules={[{ required: true, message: 'Target number required' }]}
              >
                <InputNumber style={{ width: '100%' }} step="any" placeholder="e.g. 15 or 3.14" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="tolerance"
                label={<span style={{ fontWeight: 600 }}>Acceptable Error Margin (± Delta)</span>}
              >
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="e.g. 0.05" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unit" label={<span style={{ fontWeight: 600 }}>Unit / Label</span>}>
                <Input placeholder="e.g. ms, MB, %" />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* 5. Fill in the Blanks (Cloze) Section */}
        {questionType === 'cloze' && (
          <div style={{ marginBottom: '18px' }}>
            <Form.Item
              name="cloze_template"
              label={<span style={{ fontWeight: 600 }}>Passage with [blank_1], [blank_2] Placeholders</span>}
              rules={[{ required: true, message: 'Please enter passage with blank tags' }]}
              extra="Use [blank_1], [blank_2], etc. inside the text where input boxes should appear."
            >
              <TextArea
                rows={3}
                placeholder="In React, components render [blank_1] and store state with [blank_2]."
              />
            </Form.Item>

            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
              Expected Blank Answers:
            </Text>
            <Row gutter={12}>
              <Col span={12}>
                <Input
                  addonBefore="[blank_1]"
                  placeholder="Expected answer for blank 1"
                  value={clozeAnswers.blank_1 || ''}
                  onChange={(e) => setClozeAnswers({ ...clozeAnswers, blank_1: e.target.value })}
                />
              </Col>
              <Col span={12}>
                <Input
                  addonBefore="[blank_2]"
                  placeholder="Expected answer for blank 2"
                  value={clozeAnswers.blank_2 || ''}
                  onChange={(e) => setClozeAnswers({ ...clozeAnswers, blank_2: e.target.value })}
                />
              </Col>
            </Row>
          </div>
        )}

        {/* 6. Ordering / Sequence Section */}
        {questionType === 'ordering' && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <Text strong style={{ fontSize: '14px' }}>Chronological Items Sequence</Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Enter the items in their EXACT CORRECT sequential order.</div>
              </div>
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addOrderItem}>
                Add Item
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orderItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Tag color="purple" style={{ width: '28px', textAlign: 'center', fontWeight: 800 }}>
                    {idx + 1}
                  </Tag>
                  <Input
                    placeholder={`Step #${idx + 1} description`}
                    value={item}
                    onChange={(e) => handleOrderChange(idx, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  {orderItems.length > 2 && (
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeOrderItem(idx)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Essay / Open Response with Rubric Section */}
        {questionType === 'essay' && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <Text strong style={{ fontSize: '14px' }}>Teacher Grading Rubric Criteria</Text>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Define criteria for manual evaluation.</div>
              </div>
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addRubricCriterion}>
                Add Criterion
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rubricCriteria.map((crit, idx) => (
                <Card key={idx} size="small" bodyStyle={{ padding: '8px 12px' }}>
                  <Row gutter={10} align="middle">
                    <Col span={10}>
                      <Input
                        placeholder="Criterion Title"
                        value={crit.title}
                        onChange={(e) => handleRubricChange(idx, 'title', e.target.value)}
                      />
                    </Col>
                    <Col span={4}>
                      <InputNumber
                        min={1}
                        max={30}
                        addonAfter="pts"
                        value={crit.max_points}
                        onChange={(val) => handleRubricChange(idx, 'max_points', val)}
                      />
                    </Col>
                    <Col span={8}>
                      <Input
                        placeholder="Evaluation guideline description"
                        value={crit.description}
                        onChange={(e) => handleRubricChange(idx, 'description', e.target.value)}
                      />
                    </Col>
                    <Col span={2}>
                      {rubricCriteria.length > 1 && (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeRubricCriterion(idx)} />
                      )}
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Solution Explanation */}
        <Form.Item
          name="explanation"
          label={<span style={{ fontWeight: 600 }}>Solution Notes / Answer Key Explanation (Optional)</span>}
          extra="Displayed to students in post-exam solution review."
        >
          <TextArea rows={2} placeholder="Explain the concepts behind the solution..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuestionModal;
