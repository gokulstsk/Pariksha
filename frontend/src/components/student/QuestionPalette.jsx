import React from 'react';
import { Card, Typography, Space, Divider, Row, Col } from 'antd';
import { FlagFilled, CheckOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const QuestionPalette = ({
  questions,
  currentIndex,
  answers,
  flaggedIds,
  onSelectQuestion
}) => {
  const answeredCount = Object.keys(answers || {}).filter((qId) => {
    const ans = answers[qId];
    return (
      (ans?.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
      (ans?.textAnswer && ans.textAnswer.trim().length > 0)
    );
  }).length;

  const flaggedCount = (flaggedIds || []).length;
  const totalCount = questions.length;
  const unansweredCount = totalCount - answeredCount;

  return (
    <Card
      style={{
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        position: 'sticky',
        top: '76px'
      }}
      bodyStyle={{ padding: '12px 14px' }}
    >
      <Title level={5} style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: '14px' }}>
        Question Navigator
      </Title>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px', fontSize: '11px', color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4f46e5' }} />
          <span>Answered ({answeredCount})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
          <span>Flagged ({flaggedCount})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f1f5f9', border: '1px solid #cbd5e1' }} />
          <span>Unanswered ({unansweredCount})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', border: '2px solid #4f46e5' }} />
          <span>Current</span>
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Question Number Buttons Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '2px'
        }}
      >
        {questions.map((q, idx) => {
          const isCurrent = currentIndex === idx;
          const isFlagged = flaggedIds.includes(q.id);
          const studentAns = answers[q.id];
          const isAnswered =
            (studentAns?.selectedOptionIds && studentAns.selectedOptionIds.length > 0) ||
            (studentAns?.textAnswer && studentAns.textAnswer.trim().length > 0);

          let className = 'question-palette-btn ';
          if (isCurrent) className += 'palette-active ';
          if (isFlagged) className += 'palette-flagged ';
          else if (isAnswered) className += 'palette-answered ';
          else className += 'palette-unanswered ';

          return (
            <button
              key={q.id || idx}
              type="button"
              className={className}
              onClick={() => onSelectQuestion(idx)}
            >
              {isFlagged ? <FlagFilled style={{ fontSize: '9px' }} /> : idx + 1}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuestionPalette;
