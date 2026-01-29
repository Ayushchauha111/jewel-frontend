import React from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";

// Styled components (reusing some from PrivacyPolicy)
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #1a73e8;
`;

const SubHeading = styled.h2`
  font-size: 1.5rem;
  margin-top: 30px;
  margin-bottom: 15px;
  color: #444;
`;

const Paragraph = styled.p`
  margin-bottom: 15px;
`;

const Link = styled.a`
  color: #1a73e8;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const List = styled.ul`
  margin-bottom: 15px;
  padding-left: 20px;
`;

const ListItem = styled.li`
  margin-bottom: 10px;
`;

const ContactUs = () => {
  return (
    <Container>
      <Helmet>
        <title>Contact Us | Typogram</title>
        <meta
          name="description"
          content="Get in touch with Typogram for support, feedback, or business opportunities."
        />
        <meta
          name="keywords"
          content="contact typogram, typing support, business enquiries"
        />
        <link rel="canonical" href="https://typogram.in/contact-us" />
      </Helmet>
      <Heading>Contact Us</Heading>
      <Paragraph>
        We’re here to assist you with any questions, feedback, or support needs
        related to Typogram. Whether you’re stuck on a typing course, have a
        suggestion, or want to collaborate, reach out—we’d love to hear from
        you!
      </Paragraph>

      <SubHeading>Get in Touch</SubHeading>
      <Paragraph>
        Pick the best way to contact us based on your needs:
      </Paragraph>
      <List>
        <ListItem>
          <strong>General Support</strong>: Email us at{" "}
          <Link href="mailto:typogram.sup@gmail.com">
            typogram.sup@gmail.com
          </Link>{" "}
          for help with courses, accounts, or technical issues.
        </ListItem>
        <ListItem>
          <strong>Questions & Feedback</strong>: Drop us a line at{" "}
          <Link href="mailto:ask.typogram@gmail.com">
            ask.typogram@gmail.com
          </Link>{" "}
          for inquiries or suggestions.
        </ListItem>
        <ListItem>
          <strong>Business Enquiries</strong>: For partnerships or
          collaborations, contact{" "}
          <Link href="mailto:business.typogram@gmail.com">
            business.typogram@gmail.com
          </Link>
          .
        </ListItem>
      </List>

      <SubHeading>Response Time</SubHeading>
      <Paragraph>
        We aim to reply within 24-48 hours, Monday to Friday. If you don’t hear
        back, check your spam folder or try again—we’re committed to helping
        you!
      </Paragraph>

      <SubHeading>Why Contact Us?</SubHeading>
      <Paragraph>
        Typogram is all about making typing practice effective and fun. Your
        input helps us improve, so don’t hesitate to share your thoughts or ask
        for assistance.
      </Paragraph>

      <Paragraph>
        Visit us at <Link href="https://typogram.in">typogram.in</Link> to
        explore our courses and tools while you wait for a response!
      </Paragraph>
    </Container>
  );
};

export default ContactUs;
