import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Empty,
  Spin,
  message,
  Avatar,
  List,
  Drawer
} from 'antd';
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  FileDoneOutlined,
  FormOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} from '../../store/slices/courseSlice';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CoursesManagerPage = () => {
  const dispatch = useDispatch();
  const { courses, currentCourse, isLoading } = useSelector((state) => state.courses);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isRosterDrawerOpen, setIsRosterDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsCourseModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setIsCourseModalOpen(true);
  };

  const handleViewRoster = (courseId) => {
    dispatch(fetchCourseById(courseId));
    setIsRosterDrawerOpen(true);
  };

  const handleSaveCourse = async (values) => {
    setActionLoading(true);
    if (editingCourse) {
      const resultAction = await dispatch(updateCourse({ id: editingCourse.id, data: values }));
      if (updateCourse.fulfilled.match(resultAction)) {
        message.success('Course updated successfully.');
        setIsCourseModalOpen(false);
        dispatch(fetchCourses());
      }
    } else {
      const resultAction = await dispatch(createCourse(values));
      if (createCourse.fulfilled.match(resultAction)) {
        message.success('Course created successfully.');
        setIsCourseModalOpen(false);
        dispatch(fetchCourses());
      } else {
        message.error(resultAction.payload || 'Failed to create course.');
      }
    }
    setActionLoading(false);
  };

  const handleDeleteCourse = async (id) => {
    const resultAction = await dispatch(deleteCourse(id));
    if (deleteCourse.fulfilled.match(resultAction)) {
      message.success('Course deleted.');
      dispatch(fetchCourses());
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
            📚 Courses & Cohorts Management
          </Title>
          <Text type="secondary" style={{ fontSize: '13.5px' }}>
            Group your assessments, homework assignments, and students into structured academic subjects.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700 }}
        >
          Create New Course
        </Button>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Loading courses..." />
        </div>
      ) : courses.length === 0 ? (
        <Card style={{ borderRadius: '14px', textAlign: 'center', padding: '40px' }}>
          <Empty description="No courses created yet." />
          <Button type="primary" onClick={handleOpenCreateModal} style={{ marginTop: '16px' }}>
            Create Your First Course
          </Button>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {courses.map((course) => (
            <Col xs={24} md={12} lg={8} key={course.id}>
              <Card
                style={{
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <Tag color="purple" style={{ fontWeight: 800, fontSize: '12px', padding: '2px 8px' }}>
                      {course.code}
                    </Tag>
                    <Tag color="blue">{course.category}</Tag>
                  </div>

                  <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#0f172a' }}>
                    {course.title}
                  </Title>

                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                    {course.description || 'No description provided.'}
                  </Paragraph>

                  <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: '10px', fontWeight: 700 }}>STUDENTS</Text>
                      <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '16px' }}>
                        {course.enrolled_count || 0}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '10px', fontWeight: 700 }}>TESTS</Text>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '16px' }}>
                        {course.tests_count || 0}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '10px', fontWeight: 700 }}>ASSIGNMENTS</Text>
                      <div style={{ fontWeight: 800, color: '#d97706', fontSize: '16px' }}>
                        {course.assignments_count || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                  <Button size="small" icon={<TeamOutlined />} onClick={() => handleViewRoster(course.id)}>
                    Student Roster
                  </Button>

                  <Space size="small">
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEditModal(course)} />
                    <Popconfirm title="Delete this course?" onConfirm={() => handleDeleteCourse(course.id)} okButtonProps={{ danger: true }}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Course Modal */}
      <Modal
        title={<span style={{ fontWeight: 800 }}>{editingCourse ? 'Edit Course' : 'Create New Course'}</span>}
        open={isCourseModalOpen}
        onCancel={() => setIsCourseModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={actionLoading}
        okText={editingCourse ? 'Save Changes' : 'Create Course'}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveCourse} initialValues={{ category: 'Computer Science' }}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="code" label="Course Code" rules={[{ required: true, message: 'Code required' }]}>
                <Input placeholder="e.g. CS101" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="title" label="Course Title" rules={[{ required: true, message: 'Title required' }]}>
                <Input placeholder="e.g. Intro to Operating Systems" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="category" label="Subject Category">
            <Select
              options={[
                { label: 'Computer Science', value: 'Computer Science' },
                { label: 'Web Development', value: 'Web Development' },
                { label: 'Databases', value: 'Databases' },
                { label: 'Mathematics', value: 'Mathematics' },
                { label: 'General', value: 'General' }
              ]}
            />
          </Form.Item>

          <Form.Item name="description" label="Course Syllabus / Overview">
            <TextArea rows={3} placeholder="Describe the topics and goals of this subject..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Student Roster Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 800 }}>Course Roster: {currentCourse?.title}</span>}
        open={isRosterDrawerOpen}
        onClose={() => setIsRosterDrawerOpen(false)}
        width={480}
      >
        {currentCourse && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="purple">{currentCourse.code}</Tag>
              <Text strong style={{ color: '#4f46e5' }}>
                {(currentCourse.enrollments || []).length} Enrolled Student(s)
              </Text>
            </div>

            <List
              dataSource={currentCourse.enrollments || []}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar size={36} icon={<UserOutlined />} style={{ backgroundColor: '#4f46e5' }} />}
                    title={<span style={{ fontWeight: 700 }}>{item.student?.name || 'Student'}</span>}
                    description={<span style={{ fontSize: '12px', color: '#64748b' }}>{item.student?.email}</span>}
                  />
                  <Tag color="success">ACTIVE</Tag>
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CoursesManagerPage;
