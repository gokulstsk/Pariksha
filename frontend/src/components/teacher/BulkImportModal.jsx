import React, { useState } from 'react';
import { Modal, Input, Button, Typography, Alert, message, Space } from 'antd';
import { CloudUploadOutlined, CopyOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const sampleTemplate = `[
  {
    "question_text": "What is JSX in React?",
    "question_type": "single_choice",
    "points": 2,
    "explanation": "JSX is a syntax extension for JavaScript that looks similar to HTML.",
    "options": [
      { "option_text": "JavaScript XML extension", "is_correct": true },
      { "option_text": "A CSS preprocessor", "is_correct": false },
      { "option_text": "A database engine", "is_correct": false }
    ]
  },
  {
    "question_text": "Redux Toolkit includes createSlice and configureStore.",
    "question_type": "true_false",
    "points": 1,
    "explanation": "True, RTK provides both utilities.",
    "options": [
      { "option_text": "True", "is_correct": true },
      { "option_text": "False", "is_correct": false }
    ]
  }
]`;

const BulkImportModal = ({ open, onCancel, onImport, loading }) => {
  const [jsonText, setJsonText] = useState('');

  const handleFillTemplate = () => {
    setJsonText(sampleTemplate);
  };

  const handleSubmit = () => {
    try {
      if (!jsonText.trim()) {
        message.warning('Please paste your questions JSON data.');
        return;
      }
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        message.error('Data must be a non-empty array of question objects.');
        return;
      }
      onImport(parsed);
    } catch (err) {
      message.error('Invalid JSON syntax. Please verify commas and quotation marks.');
    }
  };

  return (
    <Modal
      title={<span style={{ fontWeight: 700, fontSize: '18px' }}>Bulk Import Questions</span>}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Import Questions"
      width={700}
      destroyOnClose
    >
      <div style={{ marginTop: '12px' }}>
        <Alert
          type="info"
          showIcon
          message="Quick Bulk Import"
          description="Paste a JSON array containing questions and their options. You can click 'Load Sample Template' below to preview the expected structure."
          style={{ marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <Button size="small" type="link" onClick={handleFillTemplate}>
            Load Sample Template
          </Button>
        </div>

        <TextArea
          rows={14}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste your JSON question array here..."
          style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
        />
      </div>
    </Modal>
  );
};

export default BulkImportModal;
