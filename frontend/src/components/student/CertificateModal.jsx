import React from 'react';
import { Modal, Button, Typography, Tag, Divider, Space } from 'antd';
import {
  PrinterOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  TrophyFilled,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const CertificateModal = ({ open, onCancel, certificate }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
        >
          Print / Save PDF
        </Button>
      ]}
      width={780}
      centered
      bodyStyle={{ padding: 0 }}
    >
      <div
        id="printable-certificate"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fbfcfe 100%)',
          padding: '40px 48px',
          border: '8px double #e0e7ff',
          borderRadius: '16px',
          position: 'relative',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Background Watermark Crest */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.03,
            fontSize: '320px',
            pointerEvents: 'none',
            color: '#4f46e5'
          }}
        >
          <TrophyFilled />
        </div>

        {/* Certificate Header */}
        <div style={{ marginBottom: '20px' }}>
          <Tag
            color="gold"
            icon={<SafetyCertificateOutlined />}
            style={{
              padding: '4px 16px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '999px',
              marginBottom: '12px'
            }}
          >
            Verified Academic Certificate
          </Tag>
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 900,
              fontFamily: 'serif',
              letterSpacing: '0.04em',
              color: '#1e1b4b',
              textTransform: 'uppercase'
            }}
          >
            Certificate of Completion
          </Title>
          <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>
            This official credential is proudly presented to
          </Text>
        </div>

        {/* Student Name */}
        <div style={{ margin: '24px 0' }}>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 800,
              fontFamily: 'serif',
              color: '#312e81',
              borderBottom: '2px solid #e2e8f0',
              display: 'inline-block',
              padding: '0 40px 8px 40px'
            }}
          >
            {certificate.student?.name || 'Alex Rivera'}
          </div>
        </div>

        {/* Course / Test Description */}
        <Paragraph
          style={{
            fontSize: '15px',
            color: '#475569',
            maxWidth: '560px',
            margin: '0 auto 20px auto',
            lineHeight: 1.6
          }}
        >
          For successfully completing the comprehensive examination and demonstrating verified competency in
        </Paragraph>

        <div
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '18px'
          }}
        >
          {certificate.title || certificate.test?.title || 'Advanced Technical Assessment'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '28px' }}>
          <Tag color="purple" style={{ fontSize: '13px', padding: '4px 12px', fontWeight: 600 }}>
            Score: {certificate.score_percentage}%
          </Tag>
          <Tag color="success" icon={<CheckCircleFilled />} style={{ fontSize: '13px', padding: '4px 12px', fontWeight: 600 }}>
            Distinction Pass
          </Tag>
        </div>

        <Divider style={{ margin: '20px 0' }} />

        {/* Bottom Signatures & Verification Code */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Issue Date
            </Text>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
              {dayjs(certificate.issue_date || certificate.createdAt).format('MMMM D, YYYY')}
            </span>
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                Code: <code style={{ color: '#4f46e5' }}>{certificate.certificate_code}</code>
              </Text>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              <SafetyCertificateOutlined style={{ fontSize: '28px' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#b45309', display: 'block', marginTop: '4px', letterSpacing: '0.06em' }}>
              OFFICIAL SEAL
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'cursive',
                fontSize: '20px',
                color: '#4338ca',
                marginBottom: '2px'
              }}
            >
              Alan Turing
            </div>
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '4px' }}>
              <Text style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b', display: 'block' }}>
                {certificate.instructor_name || 'Prof. Alan Turing'}
              </Text>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                Academic Director & Evaluator
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateModal;
