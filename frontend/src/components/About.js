import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Navbar from "./Navbar";

const About = () => {
  return (
    <>
    <Navbar />
    <Container className="my-5">
      <h1 className="mb-4 text-center">About Smart Resume Screener</h1>
      <Row className="g-4">
        <Col md={6}>
          <Card className="p-4 shadow-sm">
            <h3>Our Mission</h3>
            <p>
              To empower job seekers and recruiters with AI-powered tools that
              simplify resume screening and improve job matching efficiency.
            </p>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-4 shadow-sm">
            <h3>How It Works</h3>
            <ul>
              <li>Extracts skills from resumes and job descriptions using NLP.</li>
              <li>Calculates match scores and missing skills.</li>
              <li>Offers personalized AI resume feedback and learning suggestions.</li>
              <li>Supports individual and bulk resume uploads for companies.</li>
            </ul>
          </Card>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col>
          <Card className="p-4 shadow-sm bg-light text-center">
            <h4>Built with React, Flask, and OpenAI APIs</h4>
            <p>Contact us: support@smartrsscreener.com</p>
          </Card>
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default About;
