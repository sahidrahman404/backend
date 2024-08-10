import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";
import { resend } from "@/resend/resendServices";

export const VerificationLinkEmail = ({
  verificationLink,
}: {
  verificationLink: string;
}) => (
  <Html>
    <Head />
    <Preview>Email Verification</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify your email address</Heading>
        <Text
          style={{
            ...text,
            color: "#1C1917",
            marginTop: "14px",
            marginBottom: "16px",
          }}
        >
          Thanks for starting the new account creation process. We want to make
          sure it's really you. Please click the following verification link. If
          you don&apos;t want to create an account, you can ignore this message.
        </Text>
        <Link
          href={verificationLink}
          target="_blank"
          style={{
            ...link,
            display: "block",
            marginBottom: "16px",
          }}
        >
          Click here to verify your email
        </Link>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
};

const container = {
  paddingLeft: "12px",
  paddingRight: "12px",
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

export async function sendVerificationCode(
  email: string,
  verificationLink: string,
) {
  await resend.emails.send({
    from: "you@example.com",
    to: "user@gmail.com",
    subject: "Email Verification",
    react: <VerificationLinkEmail verificationLink={verificationLink} />,
  });
}
