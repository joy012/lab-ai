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

interface VerificationEmailProps {
  verifyUrl: string;
}

export const VerificationEmail = ({ verifyUrl }: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Verify your email</Heading>
        <Text style={text}>
          Click the button below to verify your email address:
        </Text>
        <Button style={button} href={verifyUrl}>
          Verify Email
        </Button>
        <Text style={subtext}>
          If the button doesn't work, copy and paste this link: {verifyUrl}
        </Text>
        <Text style={subtext}>This link expires in 24 hours.</Text>
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
  backgroundColor: "#2563eb",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "16px",
  textDecoration: "none",
};
const subtext = { color: "#9ca3af", fontSize: "13px", lineHeight: "20px" };

export default VerificationEmail;
