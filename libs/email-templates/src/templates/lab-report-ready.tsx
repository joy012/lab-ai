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

interface LabReportReadyEmailProps {
  reportUrl: string;
  reportTitle: string;
}

export const LabReportReadyEmail = ({
  reportUrl,
  reportTitle,
}: LabReportReadyEmailProps) => (
  <Html>
    <Head />
    <Preview>Your lab report is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Lab Report Ready!</Heading>
        <Text style={text}>
          Your lab report "{reportTitle}" has been analyzed by our AI system.
        </Text>
        <Button style={button} href={reportUrl}>
          View Results
        </Button>
        <Text style={subtext}>
          Your report includes extracted values, AI interpretation, risk
          assessment, and personalized recommendations.
        </Text>
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
  backgroundColor: "#16a34a",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "16px",
  textDecoration: "none",
};
const subtext = { color: "#9ca3af", fontSize: "13px", lineHeight: "20px" };

export default LabReportReadyEmail;
