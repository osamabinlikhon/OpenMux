import React, { useState } from "react";
import { Button, Form, Input, Card, message, Divider } from "antd";
import {
  GoogleOutlined,
  MailOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../store/authStore";

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loading,
    error,
    clearError,
  } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      message.success("Signed in with Google!");
      onSuccess?.();
    } catch (err: any) {
      message.error(err.message || "Failed to sign in with Google");
    }
  };

  const handleSubmit = async (values: {
    email: string;
    password: string;
    displayName?: string;
  }) => {
    try {
      clearError();
      if (isRegistering) {
        await signUpWithEmail(
          values.email,
          values.password,
          values.displayName,
        );
        message.success("Account created successfully!");
      } else {
        await signInWithEmail(values.email, values.password);
        message.success("Signed in successfully!");
      }
      onSuccess?.();
    } catch (err: any) {
      message.error(err.message || "Authentication failed");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card
        style={{ width: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
        title={
          <h2 style={{ textAlign: "center", margin: 0 }}>
            {isRegistering ? "Create Account" : "Sign In"}
          </h2>
        }
      >
        <Button
          type="primary"
          size="large"
          block
          icon={<GoogleOutlined />}
          onClick={handleGoogleSignIn}
          loading={loading}
          style={{ marginBottom: 16 }}
        >
          Continue with Google
        </Button>

        <Divider>or</Divider>

        <Form
          name="auth-form"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          {isRegistering && (
            <Form.Item
              name="displayName"
              label="Display Name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Your name" />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="your@email.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          {error && (
            <div style={{ color: "#ff4d4f", marginBottom: 16 }}>{error}</div>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {isRegistering ? "Create Account" : "Sign In"}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          {isRegistering ? (
            <span>
              Already have an account?{" "}
              <Button type="link" onClick={() => setIsRegistering(false)}>
                Sign In
              </Button>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <Button type="link" onClick={() => setIsRegistering(true)}>
                Create one
              </Button>
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
