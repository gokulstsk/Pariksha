import React from "react";
import { Card, Form, Input, Button, Typography, Select, Alert, Radio, Row, Col } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, BookOutlined, SafetyCertificateOutlined, ReadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, clearAuthError } from "../../store/slices/authSlice";

const { Title, Text } = Typography;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    const resultAction = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(resultAction)) {
      const user = resultAction.payload.user;
      navigate(user.role === "teacher" ? "/teacher" : "/student");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Card
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "520px",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
        bodyStyle={{ padding: "36px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 8px 16px rgba(79, 70, 229, 0.35)",
              marginBottom: "12px",
            }}
          >
            <BookOutlined style={{ fontSize: "26px" }} />
          </div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Create Your Account
          </Title>
          <Text type="secondary" style={{ fontSize: "14px", marginTop: "4px", display: "block" }}>
            Join the Pariksha Assessment Platform
          </Text>
        </div>

        {error && <Alert message={error} type="error" showIcon closable onClose={() => dispatch(clearAuthError())} style={{ marginBottom: "20px", borderRadius: "10px" }} />}

        <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ role: "student" }} requiredMark={false}>
          <Form.Item name="name" label={<span style={{ fontWeight: 600 }}>Full Name</span>} rules={[{ required: true, message: "Please enter your full name" }]}>
            <Input prefix={<UserOutlined style={{ color: "#94a3b8" }} />} placeholder="e.g. John Doe" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 600 }}>Email Address</span>}
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: "#94a3b8" }} />} placeholder="name@university.edu" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>Password</span>}
            rules={[
              { required: true, message: "Please create a password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} placeholder="At least 6 characters" size="large" />
          </Form.Item>

          <Form.Item name="role" label={<span style={{ fontWeight: 600 }}>I am joining as a</span>} rules={[{ required: true }]}>
            <Radio.Group style={{ width: "100%" }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Radio.Button
                    value="student"
                    style={{
                      width: "100%",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    <ReadOutlined style={{ marginRight: "8px", color: "#0284c7" }} /> Student
                  </Radio.Button>
                </Col>
                <Col span={12}>
                  <Radio.Button
                    value="teacher"
                    style={{
                      width: "100%",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    <SafetyCertificateOutlined style={{ marginRight: "8px", color: "#7c3aed" }} /> Teacher
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={isLoading} style={{ height: "48px", fontSize: "16px", marginTop: "12px" }}>
            Register Account
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: 700, color: "#4f46e5" }}>
              Sign In
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
