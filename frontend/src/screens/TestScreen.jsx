import React, { useState } from 'react';
import { Container, Button, Card, ProgressBar, Row, Col } from 'react-bootstrap';
import { testLibrary } from '../data/testData';

const TestScreen = () => {
  const [activeTest, setActiveTest] = useState(null);
  const [testFinished, setTestFinished] = useState(false);
  const [score, setScore] = useState(0);

  const startTest = (test) => {
    setActiveTest(test);
    setTestFinished(false);
    setScore(0);
  };

  const handleFinish = () => {
    // For now, we simulate a score. In a real app, you'd calculate correct answers.
    setScore(75); 
    setTestFinished(true);
  };

  // --- RESULTS VIEW COMPONENT ---
  const ResultsView = () => {
    // Static data based on the "Software Engineer" role from your CSVs
    const skills = [
      { name: 'Python', level: 80, color: 'bg-success' },
      { name: 'DSA', level: 60, color: 'bg-info' },
      { name: 'Git', level: 90, color: 'bg-primary' },
      { name: 'SQL', level: 40, color: 'bg-warning' },
    ];

    return (
      <Card className="p-4 shadow-lg border-0">
        <h2 className="text-center mb-4">Assessment Results</h2>
        <div className="text-center mb-5">
          <div className="display-4 fw-bold text-primary">{score}%</div>
          <p className="text-muted">Overall Readiness Score</p>
        </div>

        <h4>Skill Gap Visualization</h4>
        <p className="text-muted small mb-4">Comparing your performance against Industry Standards</p>

        {skills.map((skill) => (
          <div key={skill.name} className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <span className="fw-bold">{skill.name}</span>
              <span>{skill.level}%</span>
            </div>
            <ProgressBar 
              now={skill.level} 
              variant={skill.color.replace('bg-', '')} 
              style={{ height: '25px', borderRadius: '4px' }}
              animated
            />
          </div>
        ))}

        <div className="mt-4 d-flex gap-2">
          <Button variant="primary" onClick={() => setTestFinished(false) || setActiveTest(null)}>
            Back to Dashboard
          </Button>
          <Button variant="outline-secondary">Download Report</Button>
        </div>
      </Card>
    );
  };

  if (testFinished) return <Container className="mt-5"><ResultsView /></Container>;

  if (activeTest) {
    return (
      <Container className="mt-5">
        <Card className="p-4 shadow border-0">
          <h2>{activeTest.title}</h2>
          <hr />
          <p className="text-danger fw-bold">Time Tracking Active...</p>
          <div className="my-4">
            <h5>Section 1: MCQs</h5>
            {activeTest.mcqs.map((m, idx) => (
              <div key={idx} className="mb-3 p-3 bg-light rounded">
                <p className="fw-bold">{m.q}</p>
                {m.options.map(o => <div key={o}><input type="radio" name={`q${idx}`} /> {o}</div>)}
              </div>
            ))}
          </div>
          <Button variant="success" size="lg" onClick={handleFinish}>Submit and See Results</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        {testLibrary.map(test => (
          <Col md={6} key={test.id}>
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <Card.Title>{test.title}</Card.Title>
                <Button variant="primary" onClick={() => startTest(test)}>Take Test</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default TestScreen;