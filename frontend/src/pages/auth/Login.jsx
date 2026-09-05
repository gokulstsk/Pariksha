import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Space, Divider, Alert, Tag, Row, Col } from "antd";
import { UserOutlined, LockOutlined, BookOutlined, SafetyCertificateOutlined, ReadOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, clearAuthError } from "../../store/slices/authSlice";

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    const resultAction = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(resultAction)) {
      const user = resultAction.payload.user;
      navigate(user.role === "teacher" ? "/teacher" : "/student");
    }
  };

  const handleQuickLogin = (email, password, expectedRole) => {
    form.setFieldsValue({ email, password });
    dispatch(loginUser({ email, password })).then((resultAction) => {
      if (loginUser.fulfilled.match(resultAction)) {
        navigate(expectedRole === "teacher" ? "/teacher" : "/student");
      }
    });
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
          maxWidth: "480px",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
        bodyStyle={{ padding: "36px" }}
      >
        {/* Brand Logo & Title */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 10px 20px rgba(79, 70, 229, 0.4)",
              marginBottom: "14px",
            }}
          >
            <BookOutlined style={{ fontSize: "28px" }} />
          </div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#0f172a" }}>Parik</span>
            <span style={{ color: "#4f46e5" }}>sha</span>
          </Title>
          <Text type="secondary" style={{ fontSize: "14px", marginTop: "4px", display: "block" }}>
            Sign in to access your assessment portal
          </Text>
        </div>

        {error && <Alert message={error} type="error" showIcon closable onClose={() => dispatch(clearAuthError())} style={{ marginBottom: "20px", borderRadius: "10px" }} />}

        <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: "#94a3b8" }} />} placeholder="Email address" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please enter your password" }]}>
            <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} placeholder="Password" size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={isLoading} style={{ height: "48px", fontSize: "16px", marginTop: "6px" }}>
            Sign In to Platform <ArrowRightOutlined />
          </Button>
        </Form>

        <Divider style={{ margin: "24px 0", fontSize: "12px", color: "#94a3b8" }}>DEMO QUICK LOGIN</Divider>

        {/* 1-Click Quick Demo Login Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Button
            block
            icon={<SafetyCertificateOutlined style={{ color: "#7c3aed" }} />}
            onClick={() => handleQuickLogin("teacher@test.com", "password123", "teacher")}
            style={{
              height: "42px",
              borderRadius: "10px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#faf5ff",
              borderColor: "#e9d5ff",
            }}
          >
            <span>Login as Teacher (Prof. Turing)</span>
            <Tag color="purple">Teacher</Tag>
          </Button>

          <Button
            block
            icon={<ReadOutlined style={{ color: "#0284c7" }} />}
            onClick={() => handleQuickLogin("student@test.com", "password123", "student")}
            style={{
              height: "42px",
              borderRadius: "10px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#f0f9ff",
              borderColor: "#bae6fd",
            }}
          >
            <span>Login as Student (Alex Rivera)</span>
            <Tag color="blue">Student</Tag>
          </Button>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: 700, color: "#4f46e5" }}>
              Create Account
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
