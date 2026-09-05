import React, { useEffect } from "react";
import { Layout, Button, Space, Tag, Dropdown, Avatar, Typography, Tooltip, Badge, Popover, List, Empty } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  ReadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../store/slices/authSlice";
import { fetchNotifications, markNotificationsRead } from "../../store/slices/communicationSlice";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ showToggle = false, collapsed = false, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.communication);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleMarkAllRead = () => {
    dispatch(markNotificationsRead());
  };

  const userMenuItems = [
    {
      key: "info",
      label: (
        <div style={{ padding: "6px 10px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{user?.name || "User"}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {user?.email}
          </Text>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      danger: true,
      label: "Sign Out",
      onClick: handleLogout,
    },
  ];

  const isTeacher = user?.role === "teacher";

  const notificationContent = (
    <div style={{ width: "320px", maxHeight: "400px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>Notifications</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0, fontSize: "12px" }}>
            Mark all read
          </Button>
        )}
      </div>

      <div style={{ overflowY: "auto", maxHeight: "300px" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "20px" }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No new notifications" />
          </div>
        ) : (
          <List
            size="small"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "10px 12px",
                  background: item.is_read ? "#ffffff" : "#f8fafc",
                  borderBottom: "1px solid #f8fafc",
                  cursor: item.link_url ? "pointer" : "default"
                }}
                onClick={() => item.link_url && navigate(item.link_url)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={28}
                      style={{
                        backgroundColor: item.type === "grade" ? "#10b981" : item.type === "badge" ? "#f59e0b" : "#6366f1"
                      }}
                      icon={item.type === "grade" ? <CheckCircleOutlined /> : <BellOutlined />}
                    />
                  }
                  title={<span style={{ fontSize: "13px", fontWeight: item.is_read ? 500 : 700 }}>{item.title}</span>}
                  description={<span style={{ fontSize: "12px", color: "#64748b" }}>{item.message}</span>}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Header
      className="glass-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        height: "64px",
        lineHeight: "normal",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Left Section: Logo & Branding & Collapse Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {showToggle && (
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="bottom">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined style={{ fontSize: "18px", color: "#4f46e5" }} /> : <MenuFoldOutlined style={{ fontSize: "18px", color: "#64748b" }} />}
              onClick={() => onToggleCollapse && onToggleCollapse(!collapsed)}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                background: collapsed ? "#eef2ff" : "transparent",
                transition: "all 0.2s ease",
              }}
            />
          </Tooltip>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => navigate(isTeacher ? "/teacher" : "/student")}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 3px 8px rgba(79, 70, 229, 0.25)",
              flexShrink: 0,
            }}
          >
            <BookOutlined style={{ fontSize: "19px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontWeight: 800, fontSize: "19px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              <span style={{ color: "#0f172a" }}>Parik</span>
              <span style={{ color: "#4f46e5" }}>sha</span>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>
              Assessment Platform
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Notification Bell, User Status Tag & Profile Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Notification Bell */}
        <Popover content={notificationContent} trigger="click" placement="bottomRight">
          <Badge count={unreadCount} size="small" offset={[-2, 4]}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: "18px", color: "#64748b" }} />}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            />
          </Badge>
        </Popover>

        <Tag
          icon={isTeacher ? <SafetyCertificateOutlined /> : <ReadOutlined />}
          color={isTeacher ? "purple" : "blue"}
          style={{
            margin: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 12px",
            borderRadius: "9999px",
            fontWeight: 600,
            fontSize: "13px",
            lineHeight: "18px",
            textTransform: "capitalize",
          }}
        >
          {user?.role} Portal
        </Tag>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px 4px 6px",
              borderRadius: "9999px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Avatar
              size={28}
              style={{
                backgroundColor: isTeacher ? "#6366f1" : "#0ea5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
              icon={<UserOutlined />}
            />
            <span style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b", lineHeight: 1 }}>
              {user?.name?.split(" ")[0] || "Account"}
            </span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
