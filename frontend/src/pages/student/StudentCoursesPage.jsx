import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Empty,
  Spin,
  message,
  Tabs,
  Badge,
  Avatar,
  Divider
} from 'antd';
import {
  BookOutlined,
  CheckCircleFilled,
  PlusCircleOutlined,
  UserOutlined,
  FormOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, enrollInCourse } from '../../store/slices/courseSlice';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const StudentCoursesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, isLoading } = useSelector((state) => state.courses);

  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    const resultAction = await dispatch(enrollInCourse(courseId));
    setEnrollingId(null);

    if (enrollInCourse.fulfilled.match(resultAction)) {
      message.success('Enrolled in course successfully!');
      dispatch(fetchCourses());
    } else {
      message.error(resultAction.payload || 'Failed to enroll in course.');
    }
  };

  const enrolledCourses = courses.filter((c) => c.is_enrolled);
  const availableCourses = courses.filter((c) => !c.is_enrolled);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
          🎓 Academic Courses & Subjects
        </Title>
        <Text type="secondary" style={{ fontSize: '13.5px' }}>
          Explore curriculum topics, enroll in classes, and access tests and assignments.
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k)}
        items={[
          {
            key: 'enrolled',
            label: (
              <span>
                <CheckCircleFilled /> My Enrolled Courses ({enrolledCourses.length})
              </span>
            )
          },
          {
            key: 'available',
            label: (
              <span>
                <BookOutlined /> Course Catalog ({availableCourses.length})
              </span>
            )
          }
        ]}
      />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Loading courses..." />
        </div>
      ) : (activeTab === 'enrolled' ? enrolledCourses : availableCourses).length === 0 ? (
        <Card style={{ borderRadius: '14px', textAlign: 'center', padding: '40px', marginTop: '16px' }}>
          <Empty description={activeTab === 'enrolled' ? 'You have not enrolled in any courses yet.' : 'No new courses available.'} />
        </Card>
      ) : (
        <Row gutter={[20, 20]} style={{ marginTop: '16px' }}>
          {(activeTab === 'enrolled' ? enrolledCourses : availableCourses).map((course) => (
            <Col xs={24} md={12} lg={8} key={course.id}>
              <Card
                style={{
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                }}
                bodyStyle={{ padding: '22px' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Tag color="purple" style={{ fontWeight: 800, fontSize: '12px' }}>
                      {course.code}
                    </Tag>
                    {course.is_enrolled && (
                      <Tag color="success" icon={<CheckCircleFilled />}>
                        ENROLLED
                      </Tag>
                    )}
                  </div>

                  <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#0f172a' }}>
                    {course.title}
                  </Title>

                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                    {course.description || 'Comprehensive curriculum topics and graded assessments.'}
                  </Paragraph>

                  <div style={{ display: 'flex', gap: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: '10px', fontWeight: 700 }}>TESTS</Text>
                      <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '15px' }}>
                        {course.tests_count || 0}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '10px', fontWeight: 700 }}>ASSIGNMENTS</Text>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '15px' }}>
                        {course.assignments_count || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Avatar size={22} icon={<UserOutlined />} style={{ backgroundColor: '#6366f1' }} />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {course.instructor?.name || 'Prof. Alan Turing'}
                    </span>
                  </div>

                  {course.is_enrolled ? (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => navigate('/student')}
                      style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 600 }}
                    >
                      View Tests
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusCircleOutlined />}
                      onClick={() => handleEnroll(course.id)}
                      loading={enrollingId === course.id}
                      style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 600 }}
                    >
                      Enroll Now
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default StudentCoursesPage;
