import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  List,
  Avatar,
  Empty,
  Spin,
  message,
  Divider
} from 'antd';
import {
  NotificationOutlined,
  PlusOutlined,
  PushpinFilled,
  PushpinOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
  UserOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnnouncements, createAnnouncement } from '../../store/slices/communicationSlice';
import { fetchCourses } from '../../store/slices/courseSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AnnouncementsPage = () => {
  const dispatch = useDispatch();
  const { announcements, isLoading } = useSelector((state) => state.communication);
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const isTeacher = user?.role === 'teacher';

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAnnouncements(selectedCourseFilter ? { course_id: selectedCourseFilter } : {}));
    dispatch(fetchCourses());
  }, [dispatch, selectedCourseFilter]);

  const handleCreateAnnouncement = async (values) => {
    setSubmitting(true);
    const resultAction = await dispatch(createAnnouncement(values));
    setSubmitting(false);

    if (createAnnouncement.fulfilled.match(resultAction)) {
      message.success('Announcement published successfully!');
      setIsCreateModalOpen(false);
      form.resetFields();
      dispatch(fetchAnnouncements(selectedCourseFilter ? { course_id: selectedCourseFilter } : {}));
    } else {
      message.error(resultAction.payload || 'Failed to post announcement.');
    }
  };

  const priorityConfig = {
    urgent: { color: 'error', icon: <ExclamationCircleFilled />, label: 'URGENT' },
    normal: { color: 'blue', icon: <NotificationOutlined />, label: 'NOTICE' },
    info: { color: 'cyan', icon: <InfoCircleFilled />, label: 'INFO' }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            📢 Announcements & Notices
          </Title>
          <Text type="secondary" style={{ fontSize: '13.5px' }}>
            Important updates, exam schedules, and course notifications.
          </Text>
        </div>

        <Space size="middle">
          <Select
            placeholder="Filter by Course"
            allowClear
            value={selectedCourseFilter}
            onChange={(val) => setSelectedCourseFilter(val)}
            style={{ width: '220px' }}
            options={[
              { label: 'All Announcements', value: null },
              ...courses.map((c) => ({ label: `${c.code}: ${c.title}`, value: c.id }))
            ]}
          />

          {isTeacher && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                borderRadius: '8px',
                fontWeight: 700,
                background: '#4f46e5',
                borderColor: '#4f46e5'
              }}
            >
              Post Notice
            </Button>
          )}
        </Space>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Loading notices..." />
        </div>
      ) : announcements.length === 0 ? (
        <Card style={{ borderRadius: '14px', textAlign: 'center', padding: '40px' }}>
          <Empty description="No announcements posted yet." />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((item) => {
            const p = priorityConfig[item.priority] || priorityConfig.normal;

            return (
              <Card
                key={item.id}
                style={{
                  borderRadius: '12px',
                  border: item.is_pinned ? '2px solid #818cf8' : '1px solid #e2e8f0',
                  boxShadow: item.is_pinned ? '0 4px 12px rgba(99, 102, 241, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                  background: item.is_pinned ? '#fafbff' : '#ffffff'
                }}
                bodyStyle={{ padding: '20px 24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {item.is_pinned && (
                      <Tag color="purple" icon={<PushpinFilled />} style={{ fontWeight: 700, fontSize: '11px' }}>
                        PINNED
                      </Tag>
                    )}
                    <Tag color={p.color} icon={p.icon} style={{ fontWeight: 700, fontSize: '11px' }}>
                      {p.label}
                    </Tag>
                    {item.course && (
                      <Tag color="cyan" style={{ fontWeight: 600, fontSize: '11px' }}>
                        {item.course.code}
                      </Tag>
                    )}
                  </div>

                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(item.createdAt).format('MMM D, YYYY · h:mm A')}
                  </Text>
                </div>

                <Title level={4} style={{ margin: '8px 0', fontWeight: 800, color: '#1e1b4b' }}>
                  {item.title}
                </Title>

                <Paragraph style={{ color: '#334155', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line', margin: '12px 0' }}>
                  {item.content}
                </Paragraph>

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar size={24} icon={<UserOutlined />} style={{ backgroundColor: '#4f46e5' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    Posted by {item.author?.name || 'Instructor'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Teacher Create Announcement Modal */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>Publish New Announcement</span>}
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Publish Notice"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateAnnouncement} initialValues={{ priority: 'normal', is_pinned: false }}>
          <Form.Item name="title" label="Announcement Headline" rules={[{ required: true, message: 'Please enter title' }]}>
            <Input placeholder="e.g. Midterm Exam Guidelines Released" />
          </Form.Item>

          <Form.Item name="course_id" label="Target Course (Optional / Global)">
            <Select
              placeholder="Select course or leave empty for platform-wide notice"
              allowClear
              options={courses.map((c) => ({ label: `${c.code}: ${c.title}`, value: c.id }))}
            />
          </Form.Item>

          <Form.Item name="priority" label="Priority Level">
            <Select
              options={[
                { label: 'Normal Notice', value: 'normal' },
                { label: 'Urgent / Exam Action Required', value: 'urgent' },
                { label: 'General Info', value: 'info' }
              ]}
            />
          </Form.Item>

          <Form.Item name="content" label="Content Message" rules={[{ required: true, message: 'Please enter content' }]}>
            <TextArea rows={4} placeholder="Type announcement details..." />
          </Form.Item>

          <Form.Item name="is_pinned" label="Pin to Top" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
