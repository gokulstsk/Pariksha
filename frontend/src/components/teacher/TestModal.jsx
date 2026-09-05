import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select, Row, Col, Space, Divider } from 'antd';
import { useSelector } from 'react-redux';

const { TextArea } = Input;

const TestModal = ({ open, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();
  const { courses } = useSelector((state) => state.courses);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          course_id: initialValues.course_id || null,
          title: initialValues.title,
          category: initialValues.category || 'General',
          duration_minutes: initialValues.duration_minutes || 30,
          pass_percentage: initialValues.pass_percentage || 50,
          description: initialValues.description || '',
          instructions: initialValues.instructions || '',
          shuffle_questions: initialValues.shuffle_questions || false,
          allow_review: initialValues.allow_review !== false,
          is_published: initialValues.is_published || false,
          max_attempts: initialValues.max_attempts !== undefined ? initialValues.max_attempts : 1,
          grading_method: initialValues.grading_method || 'highest',
          access_password: initialValues.access_password || '',
          enable_proctoring: initialValues.enable_proctoring !== false
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          category: 'Web Development',
          duration_minutes: 30,
          pass_percentage: 50,
          shuffle_questions: false,
          allow_review: true,
          is_published: false,
          max_attempts: 1,
          grading_method: 'highest',
          enable_proctoring: true
        });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  return (
    <Modal
      title={<span style={{ fontWeight: 800, fontSize: '18px' }}>{initialValues ? 'Edit Assessment Settings' : 'Create New Assessment'}</span>}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText={initialValues ? 'Save Changes' : 'Create Assessment'}
      width={740}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: '14px' }}>
        <Row gutter={14}>
          <Col span={14}>
            <Form.Item
              name="title"
              label={<span style={{ fontWeight: 600 }}>Test Title</span>}
              rules={[{ required: true, message: 'Please enter a test title' }]}
            >
              <Input placeholder="e.g. Full-Stack JavaScript Midterm Exam" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="course_id" label={<span style={{ fontWeight: 600 }}>Linked Course (Subject)</span>}>
              <Select
                placeholder="Assign to Course"
                allowClear
                options={courses.map((c) => ({ label: `${c.code}: ${c.title}`, value: c.id }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={14}>
          <Col span={8}>
            <Form.Item
              name="duration_minutes"
              label={<span style={{ fontWeight: 600 }}>Duration Limit</span>}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={300} style={{ width: '100%' }} addonAfter="mins" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="pass_percentage"
              label={<span style={{ fontWeight: 600 }}>Passing Criteria</span>}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="category" label={<span style={{ fontWeight: 600 }}>Category Tag</span>}>
              <Select
                options={[
                  { value: 'Web Development', label: 'Web Development' },
                  { value: 'Computer Science', label: 'Computer Science' },
                  { value: 'Databases', label: 'Databases & SQL' },
                  { value: 'Algorithms', label: 'Algorithms' },
                  { value: 'General', label: 'General Knowledge' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Moodle Advanced Quiz Controls */}
        <Row gutter={14}>
          <Col span={8}>
            <Form.Item name="max_attempts" label={<span style={{ fontWeight: 600 }}>Max Allowed Attempts</span>}>
              <Select
                options={[
                  { value: 1, label: '1 Attempt Only' },
                  { value: 2, label: '2 Attempts' },
                  { value: 3, label: '3 Attempts' },
                  { value: 0, label: 'Unlimited Attempts' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="grading_method" label={<span style={{ fontWeight: 600 }}>Multi-Attempt Grading</span>}>
              <Select
                options={[
                  { value: 'highest', label: 'Highest Grade' },
                  { value: 'average', label: 'Average Score' },
                  { value: 'latest', label: 'Last Attempt' },
                  { value: 'first', label: 'First Attempt' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="access_password" label={<span style={{ fontWeight: 600 }}>Access Passcode (Optional)</span>}>
              <Input placeholder="e.g. EXAM2026" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={<span style={{ fontWeight: 600 }}>Description (Optional)</span>}
        >
          <TextArea rows={2} placeholder="Brief summary of topics covered in this exam..." />
        </Form.Item>

        <Form.Item
          name="instructions"
          label={<span style={{ fontWeight: 600 }}>Student Exam Instructions</span>}
        >
          <TextArea rows={2} placeholder="e.g. Tab switching is monitored. Review all questions before submission." />
        </Form.Item>

        <Divider style={{ margin: '14px 0' }} />

        <Row gutter={14}>
          <Col span={6}>
            <Form.Item name="enable_proctoring" valuePropName="checked" label={<span style={{ fontWeight: 600 }}>Focus Loss Proctor</span>}>
              <Switch checkedChildren="Active" unCheckedChildren="Off" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="shuffle_questions" valuePropName="checked" label={<span style={{ fontWeight: 600 }}>Shuffle Order</span>}>
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="allow_review" valuePropName="checked" label={<span style={{ fontWeight: 600 }}>Solution Review</span>}>
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="is_published" valuePropName="checked" label={<span style={{ fontWeight: 600 }}>Publish Status</span>}>
              <Switch checkedChildren="Published" unCheckedChildren="Draft" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TestModal;
