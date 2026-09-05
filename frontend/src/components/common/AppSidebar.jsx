import React from "react";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  FormOutlined,
  BarChartOutlined,
  HistoryOutlined,
  TeamOutlined,
  DatabaseOutlined,
  BookOutlined,
  FileDoneOutlined,
  TableOutlined,
  EyeOutlined,
  TrophyOutlined,
  NotificationOutlined,
  CommentOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const { Sider } = Layout;

const AppSidebar = ({ collapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const isTeacher = user?.role === "teacher";

  const teacherMenuItems = [
    {
      key: "/teacher",
      icon: <AppstoreOutlined style={{ fontSize: "16px" }} />,
      label: "My Assessments",
    },
    {
      key: "/teacher/question-bank",
      icon: <DatabaseOutlined style={{ fontSize: "16px" }} />,
      label: "Question Bank",
    },
    {
      key: "/teacher/courses",
      icon: <BookOutlined style={{ fontSize: "16px" }} />,
      label: "Courses & Cohorts",
    },
    {
      key: "/teacher/assignments",
      icon: <FileDoneOutlined style={{ fontSize: "16px" }} />,
      label: "Assignments & Rubrics",
    },
    {
      key: "/teacher/gradebook",
      icon: <TableOutlined style={{ fontSize: "16px" }} />,
      label: "Grader Report",
    },
    {
      key: "/teacher/proctoring",
      icon: <EyeOutlined style={{ fontSize: "16px" }} />,
      label: "Live Proctoring",
    },
    {
      key: "/teacher/students",
      icon: <TeamOutlined style={{ fontSize: "16px" }} />,
      label: "Enrolled Students",
    },
    {
      key: "/teacher/analytics",
      icon: <BarChartOutlined style={{ fontSize: "16px" }} />,
      label: "Performance Analytics",
    },
    {
      type: "divider"
    },
    {
      key: "/announcements",
      icon: <NotificationOutlined style={{ fontSize: "16px" }} />,
      label: "Announcements",
    },
    {
      key: "/forums",
      icon: <CommentOutlined style={{ fontSize: "16px" }} />,
      label: "Discussion Forums",
    }
  ];

  const studentMenuItems = [
    {
      key: "/student",
      icon: <FormOutlined style={{ fontSize: "16px" }} />,
      label: "Available Assessments",
    },
    {
      key: "/student/courses",
      icon: <BookOutlined style={{ fontSize: "16px" }} />,
      label: "My Courses",
    },
    {
      key: "/student/assignments",
      icon: <FileDoneOutlined style={{ fontSize: "16px" }} />,
      label: "Assignments & Homework",
    },
    {
      key: "/student/history",
      icon: <HistoryOutlined style={{ fontSize: "16px" }} />,
      label: "My Gradebook",
    },
    {
      key: "/student/certificates",
      icon: <TrophyOutlined style={{ fontSize: "16px" }} />,
      label: "Certificates & Badges",
    },
    {
      type: "divider"
    },
    {
      key: "/announcements",
      icon: <NotificationOutlined style={{ fontSize: "16px" }} />,
      label: "Announcements",
    },
    {
      key: "/forums",
      icon: <CommentOutlined style={{ fontSize: "16px" }} />,
      label: "Discussion Forums",
    }
  ];

  const menuItems = isTeacher ? teacherMenuItems : studentMenuItems;

  // Selected key calculation
  const selectedKey = menuItems.find((item) => location.pathname === item.key)?.key || (isTeacher ? "/teacher" : "/student");

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => onToggleCollapse && onToggleCollapse(value)}
      trigger={null}
      width={240}
      collapsedWidth={80}
      style={{
        position: "fixed",
        left: 0,
        top: 64,
        bottom: 0,
        height: "calc(100vh - 64px)",
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)",
      }}
    >
      {/* Top Menu Section */}
      <div
        style={{
          flex: 1,
          padding: collapsed ? "16px 6px" : "16px 10px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            borderRight: 0,
            fontWeight: 550,
            fontSize: "13.5px",
          }}
        />
      </div>

      {/* Bottom Footer */}
      <div
        style={{
          borderTop: "1px solid #f1f5f9",
          padding: collapsed ? "12px 8px" : "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          background: "#fafbfc",
        }}
      >
        {!collapsed && (
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
            Pariksha Core v2.0
          </span>
        )}
      </div>
    </Sider>
  );
};

export default AppSidebar;
