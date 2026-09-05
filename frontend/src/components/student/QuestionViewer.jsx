import React from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Input,
  InputNumber,
  Space,
  Radio,
  Checkbox,
  Select,
  Divider,
  Row,
  Col
} from 'antd';
import {
  FlagOutlined,
  FlagFilled,
  LeftOutlined,
  RightOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const QuestionViewer = ({
  question,
  currentIndex,
  totalQuestions,
  studentAnswer,
  isFlagged,
  onSelectSingle,
  onToggleMulti,
  onSetShortAnswer,
  onSetMatching,
  onSetNumerical,
  onSetCloze,
  onSetEssay,
  onSetOrdering,
  onClearAnswer,
  onToggleFlag,
  onNext,
  onPrev,
  onSubmitModal
}) => {
  if (!question) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const selectedOptionIds = studentAnswer?.selectedOptionIds || [];
  const textAnswer = studentAnswer?.textAnswer || '';
  const matchingAnswers = studentAnswer?.matchingAnswers || {};
  const numericalAnswer = studentAnswer?.numericalAnswer;
  const clozeAnswers = studentAnswer?.clozeAnswers || {};
  const essayAnswer = studentAnswer?.essayAnswer || '';
  const orderingAnswer = studentAnswer?.orderingAnswer || question.order_items || [];

  const typeLabels = {
    single_choice: 'Single Choice',
    multiple_choice: 'Multiple Choice',
    true_false: 'True / False',
    short_answer: 'Short Answer',
    matching: 'Matching Pairs',
    numerical: 'Numerical Input',
    cloze: 'Fill in the Blanks',
    essay: 'Essay / Open Response',
    ordering: 'Sequence Ordering'
  };

  const wordCount = essayAnswer.trim() ? essayAnswer.trim().split(/\s+/).length : 0;

  // Render Cloze passage with inline inputs
  const renderClozePassage = () => {
    const template = question.cloze_template || '';
    const parts = template.split(/(\[blank_\d+\])/g);

    return (
      <div style={{ fontSize: '15px', lineHeight: 2.2, color: '#1e293b' }}>
        {parts.map((part, idx) => {
          const match = part.match(/\[blank_(\d+)\]/);
          if (match) {
            const blankKey = `blank_${match[1]}`;
            return (
              <Input
                key={idx}
                placeholder={`Blank (${match[1]})`}
                value={clozeAnswers[blankKey] || ''}
                onChange={(e) => onSetCloze && onSetCloze(question.id, blankKey, e.target.value)}
                style={{
                  width: '140px',
                  display: 'inline-block',
                  margin: '0 6px',
                  borderRadius: '6px'
                }}
              />
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  // Ordering shift helpers
  const handleMoveOrderItem = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= orderingAnswer.length) return;
    const updated = [...orderingAnswer];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    if (onSetOrdering) {
      onSetOrdering(question.id, updated);
    }
  };

  return (
    <Card
      style={{
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      {/* Question Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag color="purple" style={{ fontSize: '12px', padding: '2px 8px', fontWeight: 700, borderRadius: '6px' }}>
            Question {currentIndex + 1} of {totalQuestions}
          </Tag>
          <Tag color="blue" style={{ fontSize: '11px', fontWeight: 600 }}>
            {typeLabels[question.question_type] || 'Question'}
          </Tag>
          <Tag color="gold" style={{ fontSize: '11px', fontWeight: 600 }}>
            {question.points} {question.points === 1 ? 'Point' : 'Points'}
          </Tag>
        </div>

        <Button
          size="small"
          type={isFlagged ? 'primary' : 'default'}
          icon={isFlagged ? <FlagFilled /> : <FlagOutlined />}
          onClick={onToggleFlag}
          style={{
            borderColor: isFlagged ? '#f59e0b' : '#e2e8f0',
            backgroundColor: isFlagged ? '#f59e0b' : 'transparent',
            color: isFlagged ? '#ffffff' : '#64748b',
            fontSize: '12px'
          }}
        >
          {isFlagged ? 'Flagged for Review' : 'Flag'}
        </Button>
      </div>

      {/* Question Statement */}
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '16px', lineHeight: 1.5 }}>
        {question.question_text}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 1. MCQ & True/False */}
      {['single_choice', 'multiple_choice', 'true_false'].includes(question.question_type) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {(question.options || []).map((opt) => {
            const isSelected = selectedOptionIds.includes(opt.id);

            return (
              <div
                key={opt.id}
                className={`option-selection-card ${isSelected ? 'selected' : ''}`}
                style={{
                  padding: '10px 14px',
                  marginBottom: '6px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #6366f1' : '1px solid #e2e8f0',
                  background: isSelected ? '#eef2ff' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={() => {
                  if (question.question_type === 'multiple_choice') {
                    onToggleMulti(question.id, opt.id);
                  } else {
                    onSelectSingle(question.id, opt.id);
                  }
                }}
              >
                {question.question_type === 'multiple_choice' ? (
                  <Checkbox checked={isSelected} style={{ marginRight: '10px' }} />
                ) : (
                  <Radio checked={isSelected} style={{ marginRight: '10px' }} />
                )}
                <span style={{ fontSize: '14px', color: isSelected ? '#312e81' : '#1e293b', fontWeight: isSelected ? 600 : 400 }}>
                  {opt.option_text}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Short Answer */}
      {question.question_type === 'short_answer' && (
        <div style={{ marginBottom: '18px' }}>
          <Text strong style={{ display: 'block', marginBottom: '6px', color: '#475569', fontSize: '13px' }}>
            Type your answer below:
          </Text>
          <TextArea
            rows={2}
            value={textAnswer}
            onChange={(e) => onSetShortAnswer(question.id, e.target.value)}
            placeholder="Type keyword or phrase..."
            style={{ fontSize: '14px', borderRadius: '8px' }}
          />
        </div>
      )}

      {/* 3. Matching Pairs */}
      {question.question_type === 'matching' && (
        <div style={{ marginBottom: '18px' }}>
          <Text strong style={{ display: 'block', marginBottom: '10px', color: '#475569', fontSize: '13px' }}>
            Match each item in Column A with its corresponding option:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(question.matching_pairs || []).map((pair) => {
              const options = question.available_match_options || (question.matching_pairs || []).map((p) => p.right);

              return (
                <Row key={pair.id} gutter={14} align="middle" style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                  <Col span={12}>
                    <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>{pair.left}</strong>
                  </Col>
                  <Col span={12}>
                    <Select
                      placeholder="Select Matching Pair"
                      style={{ width: '100%' }}
                      value={matchingAnswers[pair.id]}
                      onChange={(val) => onSetMatching && onSetMatching(question.id, pair.id, val)}
                      options={options.map((opt) => ({ label: opt, value: opt }))}
                    />
                  </Col>
                </Row>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Numerical Input */}
      {question.question_type === 'numerical' && (
        <div style={{ marginBottom: '18px' }}>
          <Text strong style={{ display: 'block', marginBottom: '6px', color: '#475569', fontSize: '13px' }}>
            Enter numerical response {question.unit ? `(${question.unit})` : ''}:
          </Text>
          <InputNumber
            size="large"
            step="any"
            value={numericalAnswer}
            onChange={(val) => onSetNumerical && onSetNumerical(question.id, val)}
            placeholder="e.g. 15 or 3.14"
            addonAfter={question.unit || 'Value'}
            style={{ width: '240px' }}
          />
        </div>
      )}

      {/* 5. Cloze / Fill in the Blanks */}
      {question.question_type === 'cloze' && (
        <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <Text strong style={{ display: 'block', marginBottom: '10px', color: '#475569', fontSize: '13px' }}>
            Complete the text passage:
          </Text>
          {renderClozePassage()}
        </div>
      )}

      {/* 6. Ordering / Sequence */}
      {question.question_type === 'ordering' && (
        <div style={{ marginBottom: '18px' }}>
          <Text strong style={{ display: 'block', marginBottom: '10px', color: '#475569', fontSize: '13px' }}>
            Arrange the items in correct sequential order using the Move Up/Down arrows:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orderingAnswer.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Tag color="purple" style={{ fontWeight: 800 }}>{idx + 1}</Tag>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>{item}</span>
                </div>

                <Space size="small">
                  <Button
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={idx === 0}
                    onClick={() => handleMoveOrderItem(idx, -1)}
                  />
                  <Button
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={idx === orderingAnswer.length - 1}
                    onClick={() => handleMoveOrderItem(idx, 1)}
                  />
                </Space>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Essay / Open Response */}
      {question.question_type === 'essay' && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <Text strong style={{ color: '#475569', fontSize: '13px' }}>
              Your Detailed Answer / Essay:
            </Text>
            <Tag color={wordCount > 50 ? 'success' : 'default'} style={{ fontSize: '11px' }}>
              {wordCount} Words
            </Tag>
          </div>
          <TextArea
            rows={6}
            value={essayAnswer}
            onChange={(e) => onSetEssay && onSetEssay(question.id, e.target.value)}
            placeholder="Write your answer with comprehensive reasoning and technical explanations..."
            style={{ fontSize: '14px', borderRadius: '8px' }}
          />

          {question.rubric_criteria && question.rubric_criteria.length > 0 && (
            <div style={{ marginTop: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
              <Text strong style={{ fontSize: '12px', color: '#64748b' }}>Grading Criteria:</Text>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {question.rubric_criteria.map((c, i) => (
                  <Tag key={i} color="blue">{c.title} ({c.max_points} pts)</Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Divider style={{ margin: '14px 0' }} />

      {/* Navigation & Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          size="middle"
          icon={<ClearOutlined />}
          onClick={() => onClearAnswer(question.id)}
          style={{ fontSize: '13px' }}
        >
          Clear
        </Button>

        <Space size="small">
          <Button
            size="middle"
            icon={<LeftOutlined />}
            onClick={onPrev}
            disabled={isFirst}
            style={{ fontSize: '13px' }}
          >
            Previous
          </Button>

          {!isLast ? (
            <Button
              size="middle"
              type="primary"
              onClick={onNext}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', background: '#4f46e5', borderColor: '#4f46e5' }}
            >
              Next <RightOutlined />
            </Button>
          ) : (
            <Button
              size="middle"
              type="primary"
              onClick={onSubmitModal}
              style={{ background: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
            >
              <CheckCircleOutlined /> Finish & Submit
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default QuestionViewer;
