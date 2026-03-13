import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Tab, Tabs, Row, Col, Card, Button, Form, ProgressBar, Alert, Badge, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import Hero from '../components/Hero';
import { setCredentials } from '../slices/authSlice'; 

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('skillMatch');
  const [selectedRole, setSelectedRole] = useState('');
  const [matchPercent, setMatchPercent] = useState(0);
  const [missingSkills, setMissingSkills] = useState([]);
  const [manualSkills, setManualSkills] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [dataSource, setDataSource] = useState(''); // Added to show priority source

  const jobRequirements = {
    'MERN Developer': ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas'],
    'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind']
  };

  // 🎯 CORE LOGIC: PRIORITY EXTRACTION & ANALYSIS
  const runSkillAnalysis = (role) => {
    setSelectedRole(role);
    if (!role) return;

    // 1. PRIORITY CHECK: Tested > Temporary
    const userTested = userInfo?.testedSkills || [];
    const userTemp = userInfo?.temporarySkills || [];
    
    let userSkills = [];
    if (userTested.length > 0) {
      userSkills = userTested;
      setDataSource('Verified Tested Skills');
    } else if (userTemp.length > 0) {
      userSkills = userTemp;
      setDataSource('Self-Reported Temporary Skills');
    }

    // 2. IF BOTH ARE EMPTY: Show the fallback UI
    if (userSkills.length === 0) {
      setMatchPercent(-1); 
      setMissingSkills([]);
      return;
    }

    // 3. GAP ANALYSIS & CALCULATION
    const required = jobRequirements[role] || [];
    const matched = userSkills.filter(s => 
        required.some(r => r.toLowerCase() === s.trim().toLowerCase())
    );
    const missing = required.filter(r => 
        !userSkills.some(u => u.toLowerCase() === r.toLowerCase())
    );

    setMatchPercent(Math.round((matched.length / required.length) * 100));
    setMissingSkills(missing);
  };

  // Logic to save manual input to Temporary Skills in DB
  const handleSaveManualSkills = async () => {
    const skillsArray = manualSkills.split(',').map(s => s.trim()).filter(s => s !== "");
    try {
      const res = await axios.put('/api/users/profile/skills', { temporarySkills: skillsArray });
      dispatch(setCredentials({ ...res.data }));
      alert('Skills saved successfully!');
      runSkillAnalysis(selectedRole); 
    } catch (err) {
      alert('Error updating skills. Ensure backend route /api/users/profile/skills is set up.');
    }
  };

  return (
    <>
      {userInfo ? (
        <Container className='mt-5 pb-5'>
          <Row className='justify-content-md-center'>
            <Col xs={12} md={11}>
              
              {/* TOP HEADER SECTION */}
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h2>Career Dashboard</h2>
                <Button variant="outline-dark" onClick={() => setShowProfile(!showProfile)}>
                  {showProfile ? 'Close Profile' : '👤 View Profile & Skills'}
                </Button>
              </div>

              {/* PROFILE OVERLAY SECTION */}
              {showProfile && (
                <Card className='mb-4 p-4 border-primary shadow-sm bg-light'>
                  <h4>Your Profile Skills</h4>
                  <Row>
                    <Col md={6}>
                      <h6>Verified (Tested) Skills <Badge bg="success">Permanent</Badge></h6>
                      <div className='p-2 bg-white border rounded' style={{minHeight: '40px'}}>
                        {userInfo.testedSkills?.length > 0 ? userInfo.testedSkills.join(', ') : 'No tests taken yet.'}
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6>Temporary Skills <Badge bg="warning" text="dark">Editable</Badge></h6>
                      <Form.Control 
                        type="text" 
                        defaultValue={userInfo.temporarySkills?.join(', ')} 
                        placeholder="Enter skills (comma separated)..."
                        onChange={(e) => setManualSkills(e.target.value)}
                      />
                      <Button size="sm" className='mt-2' onClick={handleSaveManualSkills}>Save Changes</Button>
                    </Col>
                  </Row>
                </Card>
              )}
              
              {/* MAIN NAVIGATION TABS */}
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 nav-fill shadow-sm">
                
                {/* 🎯 SKILL MATCH TAB FEATURE */}
                <Tab eventKey="skillMatch" title="🎯 Skill Match">
                  <Card className='p-4 border-0 shadow-sm'>
                    <h3 className='mb-3'>Skill Gap Analysis</h3>
                    
                    <Form.Group className='mb-4'>
                      <Form.Label><strong>Select Target Job Role:</strong></Form.Label>
                      <Form.Select value={selectedRole} onChange={(e) => runSkillAnalysis(e.target.value)}>
                        <option value="">-- Choose a Role --</option>
                        {Object.keys(jobRequirements).map(r => <option key={r} value={r}>{r}</option>)}
                      </Form.Select>
                    </Form.Group>

                    {selectedRole && (
                      <>
                        {/* FALLBACK UI: NO DATA IN DB */}
                        {matchPercent === -1 ? (
                          <Alert variant="warning" className='border-0 shadow-sm'>
                            <h5>No Skills Found on Profile</h5>
                            <p>We checked your Tested and Temporary records but found nothing. Proceed with one of these:</p>
                            <Form.Control 
                              className='mb-2' 
                              placeholder="1. Enter skills manually (e.g. React, Python)" 
                              onChange={(e) => setManualSkills(e.target.value)}
                            />
                            <div className='d-flex gap-2 mt-3'>
                              <Button variant="primary" onClick={handleSaveManualSkills}>Save & Analyze</Button>
                              <Button variant="outline-primary" onClick={() => setActiveTab('takeTest')}>2. Take Skill Test</Button>
                            </div>
                          </Alert>
                        ) : (
                          /* RESULTS UI: VISUALIZATION & GAP ANALYSIS */
                          <div className="mt-2 animate__animated animate__fadeIn">
                            <div className='d-flex justify-content-between mb-2'>
                              <h5>{selectedRole} Readiness Score</h5>
                              <span className='fw-bold text-primary'>{matchPercent}%</span>
                            </div>
                            
                            {/* HORIZONTAL BAR VISUALIZATION */}
                            <ProgressBar 
                              now={matchPercent} 
                              variant={matchPercent > 75 ? "success" : matchPercent > 40 ? "warning" : "danger"} 
                              style={{height: '35px', borderRadius: '15px'}}
                              label={`${matchPercent}%`}
                              animated 
                            />
                            <small className='text-muted mt-2 d-block'>Source: {dataSource}</small>

                            <Row className='mt-4'>
                              {/* MISSING SKILLS LIST */}
                              <Col md={6}>
                                <Card className='p-3 h-100 border-0 bg-light shadow-sm'>
                                  <h6>🚩 Missing Skills</h6>
                                  <div className='d-flex flex-wrap gap-2 mt-2'>
                                    {missingSkills.length > 0 ? (
                                      missingSkills.map(s => <Badge key={s} bg="danger" className='p-2'>{s}</Badge>)
                                    ) : (
                                      <Badge bg="success" className='p-2'>No Gaps Found!</Badge>
                                    )}
                                  </div>
                                </Card>
                              </Col>

                              {/* AUTOMATIC ROADMAP */}
                              <Col md={6}>
                                <Card className='p-3 h-100 border-primary shadow-sm'>
                                  <h6>🚀 Learning Roadmap</h6>
                                  <ListGroup variant="flush" className='mt-2'>
                                    {missingSkills.length > 0 ? (
                                      missingSkills.map((skill, i) => (
                                        <ListGroup.Item key={skill} className='p-1 border-0 bg-transparent'>
                                          <small><b>Phase {i+1}:</b> Master {skill}</small>
                                        </ListGroup.Item>
                                      ))
                                    ) : (
                                      <ListGroup.Item className='border-0 bg-transparent text-success'>Ready for Interviews!</ListGroup.Item>
                                    )}
                                  </ListGroup>
                                </Card>
                              </Col>
                            </Row>
                          </div>
                        )}
                      </>
                    )}
                  </Card>
                </Tab>

                <Tab eventKey="takeTest" title="📝 Take Test">
                  <Card className='p-4 border-0 shadow-sm'><h3>Testing Center</h3><p>Verify your skills here to move them to permanent status.</p></Card>
                </Tab>
                <Tab eventKey="jobMap" title="📍 Job Map">
                  <Card className='p-4 border-0 shadow-sm'><h3>Job Map Visualization</h3><p>Finding opportunities in Visakhapatnam...</p></Card>
                </Tab>
                <Tab eventKey="salaryEstimator" title="💰 Salary">
                  <Card className='p-4 border-0 shadow-sm'><h3>Estimator</h3></Card>
                </Tab>
                <Tab eventKey="aiCoach" title="🤖 AI Coach">
                  <Card className='p-4 border-0 shadow-sm bg-dark text-white'><h3>AI Coach</h3></Card>
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
      ) : (
        <Hero />
      )}
    </>
  );
};

export default HomeScreen;