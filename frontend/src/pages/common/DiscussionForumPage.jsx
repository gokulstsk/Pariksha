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
  List,
  Avatar,
  Empty,
  Spin,
  message,
  Divider,
  Drawer
} from 'antd';
import {
  CommentOutlined,
  PlusOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  UserOutlined,
  SendOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchForumTopics,
  fetchTopicById,
  createTopic,
  replyToTopic,
  markPostAsAccepted
} from '../../store/slices/communicationSlice';
import { fetchCourses } from '../../store/slices/courseSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DiscussionForumPage = () => {
  const dispatch = useDispatch();
  const { topics, currentTopic, isLoading } = useSelector((state) => state.communication);
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const isTeacher = user?.role === 'teacher';

  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [isThreadDrawerOpen, setIsThreadDrawerOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [courseFilter, setCourseFilter] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [form] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchForumTopics(courseFilter ? { course_id: courseFilter } : {}));
    dispatch(fetchCourses());
  }, [dispatch, courseFilter]);

  const handleOpenThread = (topicId) => {
    setSelectedTopicId(topicId);
    dispatch(fetchTopicById(topicId));
    setIsThreadDrawerOpen(true);
  };

  const handleCreateTopic = async (values) => {
    setActionLoading(true);
    const resultAction = await dispatch(createTopic(values));
    setActionLoading(false);

    if (createTopic.fulfilled.match(resultAction)) {
      message.success('Discussion thread created!');
      setIsNewTopicModalOpen(false);
      form.resetFields();
      dispatch(fetchForumTopics(courseFilter ? { course_id: courseFilter } : {}));
    } else {
      message.error(resultAction.payload || 'Failed to create topic.');
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    setActionLoading(true);
    const resultAction = await dispatch(replyToTopic({ id: selectedTopicId, content: replyContent }));
    setActionLoading(false);

    if (replyToTopic.fulfilled.match(resultAction)) {
      message.success('Reply submitted.');
      setReplyContent('');
      dispatch(fetchTopicById(selectedTopicId));
      dispatch(fetchForumTopics(courseFilter ? { course_id: courseFilter } : {}));
    }
  };

  const handleAcceptPost = async (postId) => {
    const resultAction = await dispatch(markPostAsAccepted(postId));
    if (markPostAsAccepted.fulfilled.match(resultAction)) {
      message.success('Marked as verified solution!');
      dispatch(fetchTopicById(selectedTopicId));
      dispatch(fetchForumTopics(courseFilter ? { course_id: courseFilter } : {}));
    }
  };

  const filteredTopics = topics.filter((t) => {
    if (!searchKeyword) return true;
    return (
      t.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (t.category_tag && t.category_tag.toLowerCase().includes(searchKeyword.toLowerCase()))
    );
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            💬 Academic Discussion Forums
          </Title>
          <Text type="secondary" style={{ fontSize: '13.5px' }}>
            Collaborate on assessment concepts, ask questions, and share verified solutions.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsNewTopicModalOpen(true)}
          style={{ borderRadius: '8px', fontWeight: 700, background: '#4f46e5', borderColor: '#4f46e5' }}
        >
          Ask a Question
        </Button>
      </div>

      {/* Filter Bar */}
      <Card style={{ borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }} bodyStyle={{ padding: '14px 18px' }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search questions by topic or keywords..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: '320px', borderRadius: '8px' }}
            allowClear
          />

          <Select
            placeholder="Filter by Course"
            allowClear
            value={courseFilter}
            onChange={(val) => setCourseFilter(val)}
            style={{ width: '240px' }}
            options={[
              { label: 'All Courses', value: null },
              ...courses.map((c) => ({ label: `${c.code}: ${c.title}`, value: c.id }))
            ]}
          />
        </Space>
      </Card>

      {/* Topics List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Loading discussions..." />
        </div>
      ) : filteredTopics.length === 0 ? (
        <Card style={{ borderRadius: '14px', textAlign: 'center', padding: '40px' }}>
          <Empty description="No discussion threads found matching your filters." />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              hoverable
              onClick={() => handleOpenThread(topic.id)}
              style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              bodyStyle={{ padding: '18px 22px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {topic.is_solved && (
                      <Tag color="success" icon={<CheckCircleFilled />} style={{ fontWeight: 700, fontSize: '11px' }}>
                        SOLVED
                      </Tag>
                    )}
                    <Tag color="purple" style={{ fontWeight: 600, fontSize: '11px' }}>
                      {topic.category_tag}
                    </Tag>
                    {topic.course && (
                      <Tag color="cyan" style={{ fontWeight: 600, fontSize: '11px' }}>
                        {topic.course.code}
                      </Tag>
                    )}
                  </div>

                  <Title level={5} style={{ margin: '4px 0 6px 0', fontWeight: 700, color: '#1e293b' }}>
                    {topic.title}
                  </Title>

                  <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ margin: 0, fontSize: '13px' }}>
                    {topic.content}
                  </Paragraph>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Tag icon={<CommentOutlined />} color="blue" style={{ fontSize: '12px', padding: '4px 10px', fontWeight: 600 }}>
                    {topic.posts_count || 0} {(topic.posts_count || 0) === 1 ? 'Reply' : 'Replies'}
                  </Tag>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                    {dayjs(topic.createdAt).format('MMM D')}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: topic.author?.role === 'teacher' ? '#6366f1' : '#0ea5e9' }} />
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Asked by <strong style={{ color: '#334155' }}>{topic.author?.name}</strong>
                  {topic.author?.role === 'teacher' && <Tag color="purple" style={{ marginLeft: '4px', fontSize: '10px' }}>INSTRUCTOR</Tag>}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Discussion Thread Detail Drawer */}
      <Drawer
        title={
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentTopic?.is_solved && <Tag color="success" icon={<CheckCircleFilled />}>SOLVED</Tag>}
              <Tag color="purple">{currentTopic?.category_tag}</Tag>
            </div>
            <div style={{ fontWeight: 800, fontSize: '17px', color: '#0f172a', marginTop: '6px' }}>
              {currentTopic?.title}
            </div>
          </div>
        }
        open={isThreadDrawerOpen}
        onClose={() => setIsThreadDrawerOpen(false)}
        width={680}
      >
        {currentTopic && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div style={{ overflowY: 'auto', paddingRight: '8px' }}>
              {/* Question Statement Card */}
              <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Avatar size={26} icon={<UserOutlined />} style={{ backgroundColor: '#4f46e5' }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>{currentTopic.author?.name}</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
                      {dayjs(currentTopic.createdAt).format('MMM D, YYYY · h:mm A')}
                    </span>
                  </div>
                </div>
                <Paragraph style={{ fontSize: '14px', lineHeight: 1.6, color: '#334155', margin: 0 }}>
                  {currentTopic.content}
                </Paragraph>
              </div>

              {/* Replies Section */}
              <Title level={5} style={{ fontWeight: 800, marginBottom: '14px' }}>
                Replies ({currentTopic.posts?.length || 0})
              </Title>

              {(!currentTopic.posts || currentTopic.posts.length === 0) ? (
                <Empty description="No answers submitted yet. Be the first to answer!" style={{ margin: '30px 0' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {currentTopic.posts.map((post) => (
                    <div
                      key={post.id}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: post.is_accepted_answer ? '2px solid #86efac' : '1px solid #e2e8f0',
                        background: post.is_accepted_answer ? '#f0fdf4' : '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar size={24} icon={<UserOutlined />} style={{ backgroundColor: post.author?.role === 'teacher' ? '#6366f1' : '#0ea5e9' }} />
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                            {post.author?.name}
                          </span>
                          {post.author?.role === 'teacher' && <Tag color="purple" style={{ fontSize: '10px' }}>INSTRUCTOR</Tag>}
                          {post.is_accepted_answer && (
                            <Tag color="success" icon={<CheckCircleFilled />} style={{ fontSize: '11px', fontWeight: 700 }}>
                              ACCEPTED SOLUTION
                            </Tag>
                          )}
                        </div>

                        {(isTeacher || currentTopic.author_id === user?.id) && !post.is_accepted_answer && (
                          <Button
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleAcceptPost(post.id)}
                            style={{ fontSize: '11px', color: '#16a34a', borderColor: '#86efac' }}
                          >
                            Mark Solution
                          </Button>
                        )}
                      </div>

                      <Paragraph style={{ color: '#334155', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>
                        {post.content}
                      </Paragraph>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Input Section */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
              <TextArea
                rows={3}
                placeholder="Write your answer or explanation..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                style={{ borderRadius: '8px', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendReply}
                  loading={actionLoading}
                  disabled={!replyContent.trim()}
                  style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700 }}
                >
                  Post Answer
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Topic Modal */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>Start a New Discussion Thread</span>}
        open={isNewTopicModalOpen}
        onCancel={() => setIsNewTopicModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={actionLoading}
        okText="Post Question"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTopic} initialValues={{ category_tag: 'General Discussion' }}>
          <Form.Item name="title" label="Question Headline" rules={[{ required: true, message: 'Please enter topic title' }]}>
            <Input placeholder="e.g. How does Little's Law apply to queue buffer saturation?" />
          </Form.Item>

          <Form.Item name="course_id" label="Related Course">
            <Select
              placeholder="Select course (optional)"
              allowClear
              options={courses.map((c) => ({ label: `${c.code}: ${c.title}`, value: c.id }))}
            />
          </Form.Item>

          <Form.Item name="category_tag" label="Topic Category Tag">
            <Select
              options={[
                { label: 'General Discussion', value: 'General Discussion' },
                { label: 'Algorithms & Complexity', value: 'Algorithms & Complexity' },
                { label: 'React & State Flow', value: 'React & State Flow' },
                { label: 'Database & SQL Queries', value: 'Database & SQL Queries' },
                { label: 'Exam Preparation', value: 'Exam Preparation' }
              ]}
            />
          </Form.Item>

          <Form.Item name="content" label="Detailed Explanation / Question" rules={[{ required: true, message: 'Please describe question' }]}>
            <TextArea rows={4} placeholder="Describe the problem you are facing or concept you want to clarify..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscussionForumPage;
