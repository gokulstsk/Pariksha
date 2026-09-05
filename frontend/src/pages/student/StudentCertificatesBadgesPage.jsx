import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tag,
  Row,
  Col,
  Tabs,
  Empty,
  Spin,
  Avatar,
  Divider
} from 'antd';
import {
  TrophyOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  PrinterOutlined,
  ThunderboltOutlined,
  BookOutlined,
  StarFilled
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyCertificates, fetchMyBadges } from '../../store/slices/gamificationSlice';
import CertificateModal from '../../components/student/CertificateModal';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const StudentCertificatesBadgesPage = () => {
  const dispatch = useDispatch();
  const { certificates, badges, isLoading } = useSelector((state) => state.gamification);

  const [activeTab, setActiveTab] = useState('certificates');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyCertificates());
    dispatch(fetchMyBadges());
  }, [dispatch]);

  const handleOpenCertificate = (cert) => {
    setSelectedCert(cert);
    setIsCertModalOpen(true);
  };

  const badgeIcons = {
    TrophyOutlined: <TrophyOutlined style={{ fontSize: '32px', color: '#f59e0b' }} />,
    ThunderboltOutlined: <ThunderboltOutlined style={{ fontSize: '32px', color: '#10b981' }} />,
    BookOutlined: <BookOutlined style={{ fontSize: '32px', color: '#6366f1' }} />
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
          🏆 Certificates & Achievement Badges
        </Title>
        <Text type="secondary" style={{ fontSize: '13.5px' }}>
          Your verified credentials, academic certificates of completion, and earned gamification badges.
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k)}
        items={[
          {
            key: 'certificates',
            label: (
              <span>
                <SafetyCertificateOutlined /> Official Certificates ({certificates.length})
              </span>
            )
          },
          {
            key: 'badges',
            label: (
              <span>
                <TrophyOutlined /> Digital Badges ({badges.filter((b) => b.is_earned).length}/{badges.length})
              </span>
            )
          }
        ]}
      />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Loading achievements..." />
        </div>
      ) : activeTab === 'certificates' ? (
        certificates.length === 0 ? (
          <Card style={{ borderRadius: '14px', textAlign: 'center', padding: '40px', marginTop: '16px' }}>
            <Empty description="No certificates earned yet. Pass a published assessment with passing threshold to unlock certificates!" />
          </Card>
        ) : (
          <Row gutter={[20, 20]} style={{ marginTop: '16px' }}>
            {certificates.map((cert) => (
              <Col xs={24} md={12} key={cert.id}>
                <Card
                  style={{
                    borderRadius: '14px',
                    border: '1px solid #e0e7ff',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.05)'
                  }}
                  bodyStyle={{ padding: '22px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <Tag color="gold" icon={<SafetyCertificateOutlined />} style={{ fontWeight: 700 }}>
                      VERIFIED CREDENTIAL
                    </Tag>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {dayjs(cert.issue_date).format('MMM D, YYYY')}
                    </span>
                  </div>

                  <Title level={4} style={{ margin: '8px 0', fontWeight: 800, color: '#1e1b4b' }}>
                    {cert.title}
                  </Title>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Tag color="purple" style={{ fontWeight: 700 }}>
                      Final Grade: {cert.score_percentage}%
                    </Tag>
                    <Tag color="success" icon={<CheckCircleFilled />}>
                      Verified Pass
                    </Tag>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', marginBottom: '16px' }}>
                    Verification Code: <code style={{ color: '#4f46e5', fontWeight: 700 }}>{cert.certificate_code}</code>
                  </div>

                  <Button
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={() => handleOpenCertificate(cert)}
                    style={{ width: '100%', background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700, borderRadius: '8px' }}
                  >
                    View Official Certificate
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )
      ) : (
        /* Badges Showcase */
        <Row gutter={[20, 20]} style={{ marginTop: '16px' }}>
          {badges.map((badge) => (
            <Col xs={24} sm={12} md={8} key={badge.id}>
              <Card
                style={{
                  borderRadius: '14px',
                  border: badge.is_earned ? '2px solid #fbbf24' : '1px solid #e2e8f0',
                  opacity: badge.is_earned ? 1 : 0.6,
                  textAlign: 'center',
                  background: badge.is_earned ? '#fffdfa' : '#f8fafc',
                  boxShadow: badge.is_earned ? '0 4px 12px rgba(245, 158, 11, 0.1)' : 'none'
                }}
                bodyStyle={{ padding: '24px 20px' }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: badge.is_earned ? '#fef3c7' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px auto'
                  }}
                >
                  {badgeIcons[badge.icon] || <TrophyOutlined style={{ fontSize: '30px' }} />}
                </div>

                <Title level={5} style={{ margin: '0 0 6px 0', fontWeight: 800, color: '#0f172a' }}>
                  {badge.name}
                </Title>

                <Paragraph type="secondary" style={{ fontSize: '12.5px', margin: '0 0 14px 0', minHeight: '38px' }}>
                  {badge.description}
                </Paragraph>

                {badge.is_earned ? (
                  <Tag color="gold" icon={<StarFilled />} style={{ fontWeight: 700, padding: '2px 10px' }}>
                    EARNED
                  </Tag>
                ) : (
                  <Tag color="default">LOCKED</Tag>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Certificate Viewer Modal */}
      <CertificateModal
        open={isCertModalOpen}
        onCancel={() => setIsCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};

export default StudentCertificatesBadgesPage;
