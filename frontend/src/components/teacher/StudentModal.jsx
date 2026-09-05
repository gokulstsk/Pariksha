import React, { useEffect } from "react";
import { Modal, Form, Input, Alert } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, InfoCircleOutlined } from "@ant-design/icons";

const StudentModal = ({ open, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();
  const isEditing = Boolean(initialValues);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name || "",
          email: initialValues.email || "",
          password: "",
        });
      } else {
        form.resetFields();
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
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserOutlined style={{ color: "#4f46e5", fontSize: "18px" }} />
          <span style={{ fontWeight: 700, fontSize: "17px", color: "#1e293b" }}>{isEditing ? "Edit Student Details" : "Enroll New Student"}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText={isEditing ? "Save Changes" : "Enroll Student"}
      cancelText="Cancel"
      width={520}
      destroyOnClose
      okButtonProps={{
        style: {
          background: "#4f46e5",
          borderColor: "#4f46e5",
          fontWeight: 600,
          borderRadius: "6px",
        },
      }}
    >
      <div style={{ marginTop: "12px", marginBottom: "16px" }}>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>{isEditing ? "Update the student profile information or reset their password." : "Register a new student to give them access to published assessments and test taking."}</p>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={<span style={{ fontWeight: 600, fontSize: "13px", color: "#334155" }}>Full Name</span>}
          rules={[
            { required: true, message: "Please enter the student full name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input prefix={<UserOutlined style={{ color: "#94a3b8" }} />} placeholder="e.g. Emma Watson" size="large" style={{ borderRadius: "8px" }} />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600, fontSize: "13px", color: "#334155" }}>Email Address</span>}
          rules={[
            { required: true, message: "Please enter student email address" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input prefix={<MailOutlined style={{ color: "#94a3b8" }} />} placeholder="e.g. emma@school.edu" size="large" style={{ borderRadius: "8px" }} />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600, fontSize: "13px", color: "#334155" }}>{isEditing ? "New Password (Optional)" : "Initial Password (Optional)"}</span>}
          rules={[
            {
              validator: (_, value) => {
                if (value && value.trim().length > 0 && value.trim().length < 6) {
                  return Promise.reject(new Error("Password must be at least 6 characters"));
                }
                return Promise.resolve();
              },
            },
          ]}
          extra={<span style={{ fontSize: "12px", color: "#64748b" }}>{isEditing ? "Leave blank to keep their current password." : 'Default password is "student123" if left blank.'}</span>}
        >
          <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} placeholder={isEditing ? "Enter new password or leave blank" : "student123 (Default)"} size="large" style={{ borderRadius: "8px" }} />
        </Form.Item>

        {!isEditing && <Alert message="Quick Access" description="The newly enrolled student can immediately log in using their email and default credentials (student123) to access published assessments." type="info" showIcon icon={<InfoCircleOutlined style={{ color: "#3b82f6" }} />} style={{ borderRadius: "8px", fontSize: "12px", marginTop: "8px" }} />}
      </Form>
    </Modal>
  );
};

export default StudentModal;
