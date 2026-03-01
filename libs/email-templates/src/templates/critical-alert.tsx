import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface CriticalAlertEmailProps {
  reportUrl: string;
  criticalValues: string[];
}

export const CriticalAlertEmail = ({
  reportUrl,
  criticalValues,
}: CriticalAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>CRITICAL: Lab values require attention</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Critical Lab Values Detected</Heading>
        <Text style={text}>
          The following values in your latest lab report require immediate
          attention:
        </Text>
        <Section style={alertBox}>
          {criticalValues.map((value, index) => (
            <Text key={index} style={alertItem}>
              {value}
            </Text>
          ))}
        </Section>
        <Button style={button} href={reportUrl}>
          View Full Report
        </Button>
        <Text style={warning}>
          Please consult your doctor immediately regarding these results.
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
  color: "#dc2626",
  fontSize: "24px",
  fontWeight: "bold" as const,
};
const text = { color: "#4a4a4a", fontSize: "16px", lineHeight: "24px" };
const alertBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  padding: "16px",
  borderRadius: "8px",
  margin: "16px 0",
};
const alertItem = { color: "#991b1b", fontSize: "14px", margin: "4px 0" };
const button = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "16px",
  textDecoration: "none",
};
const warning = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "bold" as const,
  marginTop: "16px",
};

export default CriticalAlertEmail;
