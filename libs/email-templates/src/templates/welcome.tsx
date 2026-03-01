import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to LabAI</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Welcome to LabAI!</Heading>
        <Text style={text}>Hi {name},</Text>
        <Text style={text}>
          Thank you for joining LabAI. You can now upload your lab reports and
          get AI-powered interpretations instantly.
        </Text>
        <Section style={features}>
          <Text style={featureItem}>Upload lab report images</Text>
          <Text style={featureItem}>Get AI-powered interpretation</Text>
          <Text style={featureItem}>Track your health trends</Text>
          <Text style={featureItem}>Compare reports over time</Text>
        </Section>
        <Text style={text}>
          Start by uploading your first lab report in the app.
        </Text>
        <Text style={footer}>— The LabAI Team</Text>
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
const features = {
  backgroundColor: "#f0f7ff",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
};
const featureItem = { color: "#2563eb", fontSize: "14px", margin: "4px 0" };
const footer = { color: "#9ca3af", fontSize: "14px", marginTop: "32px" };

export default WelcomeEmail;
