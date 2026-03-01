import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export const PasswordResetEmail = ({ resetUrl }: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Password Reset</Heading>
        <Text style={text}>
          We received a request to reset your password. Click the button below:
        </Text>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
        <Text style={subtext}>
          If you didn't request this, you can safely ignore this email.
        </Text>
        <Text style={subtext}>This link expires in 1 hour.</Text>
      </Container>
    </Body>
  </Html>
);

const main = { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" };
const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "560px",
};
const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "bold" as const,
};
const text = { color: "#4a4a4a", fontSize: "16px", lineHeight: "24px" };
const button = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "16px",
  textDecoration: "none",
};
const subtext = { color: "#9ca3af", fontSize: "13px", lineHeight: "20px" };

export default PasswordResetEmail;
