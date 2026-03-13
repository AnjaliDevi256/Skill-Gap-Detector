import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Tab, Tabs, Row, Col, Card, Button, Form, ProgressBar, Alert, Badge, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Hero from '../components/Hero';
import { setCredentials } from '../slices/authSlice';
import TestScreen from './TestScreen';
const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // --- CORE UI STATES ---
  const [activeTab, setActiveTab] = useState('skillMatch');
  const [selectedRole, setSelectedRole] = useState('');
  const [matchPercent, setMatchPercent] = useState(0);
  const [missingSkills, setMissingSkills] = useState([]);
  const [manualSkills, setManualSkills] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [dataSource, setDataSource] = useState('');
  // --- GEMINI / JOB MAP STATES ---
  const [jobInput, setJobInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);

  // --- SALARY STATES ---
  const [salaryRole, setSalaryRole] = useState(''); 
  const [salaryResult, setSalaryResult] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const jobRequirements = {
    'MERN Developer': ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    'Data Scientist': ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas'],
    'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind']
  };

  // 🎯 LOGIC: SKILL MATCH & ROADMAP
  const runSkillAnalysis = (role) => {
    setSelectedRole(role);
    if (!role) return;

    // Priority Check: Tested Skills > Temporary Skills
    const userTested = userInfo?.testedSkills || [];
    const userTemp = userInfo?.temporarySkills || [];
    let userSkills = userTested.length > 0 ? userTested : userTemp;
    
    if (userSkills.length === 0) { 
      setMatchPercent(-1); 
      return; 
    }

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

  // 🤖 AI LOGIC: JOB DESCRIPTION ANALYSIS
  const analyzeJobWithGemini = async () => {
    if (!jobInput) return alert("Please paste a Job Description!");
    setLoading(true);
    try {
      const prompt = `Extract only the technical skills from this job description and return them as a simple comma-separated list. No prose. Job text: ${jobInput}`;
      const { data } = await axios.post('/api/gemini/analyze', { prompt });
      const extractedSkills = data.skills;

      const userSkills = userInfo?.testedSkills?.length > 0 ? userInfo.testedSkills : (userInfo?.temporarySkills || []);
      const matches = userSkills.filter(s => extractedSkills.some(e => e.toLowerCase() === s.trim().toLowerCase()));
      const score = Math.round((matches.length / extractedSkills.length) * 100);

      setGeminiResult({
        score,
        extracted: extractedSkills,
        missing: extractedSkills.filter(e => !userSkills.some(u => u.toLowerCase() === e.toLowerCase()))
      });
    } catch (err) {
      alert("Error calling Gemini API. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // 💰 AI LOGIC: SALARY ESTIMATOR
  const estimateSalary = async () => {
    if (!salaryRole) return alert("Please select a role first!");
    
    const userTested = userInfo?.testedSkills || [];
    const userTemp = userInfo?.temporarySkills || [];
    const userSkills = userTested.length > 0 ? userTested : userTemp;

    if (userSkills.length === 0) {
      alert("No skills found! Add skills in the Skill Map tab first.");
      return;
    }

    setSalaryLoading(true);
    try {
      const prompt = `Act as an Indian Tech Recruiter. Role: "${salaryRole}" | Candidate Skills: [${userSkills.join(', ')}]. Estimate salary in LPA for India in 2026. Format: Range: [X] LPA | Reasoning: [Reason]`;
      const { data } = await axios.post('/api/gemini/analyze', { prompt });
      setSalaryResult(data.skills.join(' ')); 
    } catch (err) {
      alert("Salary Estimation failed.");
    } finally {
      setSalaryLoading(false);
    }
  };

  // 💾 LOGIC: SAVE TEMPORARY SKILLS
  const handleSaveManualSkills = async () => {
    const skillsArray = manualSkills.split(',').map(s => s.trim()).filter(s => s !== "");
    try {
      const res = await axios.put('/api/users/profile/skills', { temporarySkills: skillsArray });
      dispatch(setCredentials({ ...res.data }));
      alert('Skills updated successfully!');
      if (selectedRole) runSkillAnalysis(selectedRole);
    } catch (err) { 
      alert('Update failed.'); 
    }
  };

  return (
    <>
      {userInfo ? (
        <Container className='mt-5 pb-5'>
          <Row className='justify-content-md-center'>
            <Col xs={12} md={11}>
              
              {/* HEADER */}
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h2>Career Dashboard</h2>
                <Button variant="outline-dark" onClick={() => setShowProfile(!showProfile)}>
                  {showProfile ? 'Close Profile' : '👤 View Profile & Skills'}
                </Button>
              </div>

              {/* PROFILE OVERLAY */}
              {showProfile && (
                <Card className='mb-4 p-4 border-primary shadow-sm bg-light'>
                  <Row>
                    <Col md={6}>
                      <h6>Verified Skills <Badge bg="success">Permanent</Badge></h6>
                      <div className='p-2 bg-white border rounded' style={{minHeight: '40px'}}>
                        {userInfo.testedSkills?.length > 0 ? userInfo.testedSkills.join(', ') : 'No tests taken.'}
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6>Temporary Skills <Badge bg="warning" text="dark">Editable</Badge></h6>
                      <Form.Control type="text" defaultValue={userInfo.temporarySkills?.join(', ')} onChange={(e) => setManualSkills(e.target.value)} />
                      <Button size="sm" className='mt-2' onClick={handleSaveManualSkills}>Save Changes</Button>
                    </Col>
                  </Row>
                </Card>
              )}
              
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 nav-fill shadow-sm">
                
                {/* 🎯 TAB: SKILL MAP */}
                <Tab eventKey="skillMatch" title="🎯 Skill Map">
                  <Card className='p-4 border-0 shadow-sm'>
                    <h3 className='mb-3'>Skill Gap Analysis</h3>
                    <Form.Select className='mb-4' value={selectedRole} onChange={(e) => runSkillAnalysis(e.target.value)}>
                      <option value="">-- Choose a Role --</option>
                      {Object.keys(jobRequirements).map(r => <option key={r} value={r}>{r}</option>)}
                    </Form.Select>

                    {selectedRole && (
                      matchPercent === -1 ? (
                        <Alert variant="warning" className="border-0 shadow-sm">
                          <h5>No Skills Found!</h5>
                          <Form.Control type="text" placeholder="Enter skills (e.g. React, Node.js)..." onChange={(e) => setManualSkills(e.target.value)} />
                          <div className='mt-3 d-flex gap-2'>
                            <Button variant="primary" onClick={handleSaveManualSkills}>Save & Analyze</Button>
                            <Button variant="outline-primary" onClick={() => setActiveTab('takeTest')}>Take Test</Button>
                          </div>
                        </Alert>
                      ) : (
                        <div className="animate__animated animate__fadeIn">
                          <h5>{selectedRole} Score: {matchPercent}%</h5>
                          <ProgressBar now={matchPercent} variant={matchPercent > 70 ? "success" : "warning"} animated style={{height: '25px', borderRadius: '12px'}} className='mb-4' />
                          <Row>
                            <Col md={6}>
                              <Card className='p-3 h-100 border-0 bg-light'>
                                <h6>🚩 Skills You Lack:</h6>
                                {missingSkills.length > 0 ? missingSkills.map(s => <Badge key={s} bg="danger" className='m-1 p-2'>{s}</Badge>) : <Badge bg="success">Ready!</Badge>}
                              </Card>
                            </Col>
                            <Col md={6}>
                              <Card className='p-3 h-100 border-primary'>
                                <h6>🚀 Learning Roadmap</h6>
                                <ListGroup variant="flush">
                                  {missingSkills.map((s, i) => (
                                    <ListGroup.Item key={s} className='bg-transparent border-0'><small><b>Phase {i+1}:</b> Master {s}</small></ListGroup.Item>
                                  ))}
                                </ListGroup>
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      )
                    )}
                  </Card>
                </Tab>

                {/* 📍 TAB: JOB MAP */}
                <Tab eventKey="jobMap" title="📍 Job Map (AI)">
                  <Card className='p-4 border-0 shadow-sm'>
                    <h3>AI Job Analyzer</h3>
                    <Form.Control as="textarea" rows={4} className="mb-3" placeholder="Paste Job Description..." value={jobInput} onChange={(e) => setJobInput(e.target.value)} />
                    <Button variant="primary" onClick={analyzeJobWithGemini} disabled={loading}>{loading ? <Spinner size="sm" animation="border" /> : 'Analyze with Gemini'}</Button>
                    {geminiResult && (
                      <Alert className='mt-3' variant="info">
                        <h4>Match Score: {geminiResult.score}%</h4>
                        <ProgressBar now={geminiResult.score} variant="success" className="mb-2" />
                        <small><strong>Missing Skills:</strong> {geminiResult.missing.join(', ')}</small>
                      </Alert>
                    )}
                  </Card>
                </Tab>

                {/* 💰 TAB: SALARY ESTIMATOR */}
                <Tab eventKey="salaryEstimator" title="💰 Salary">
                  <Card className='p-4 border-0 shadow-sm'>
                    <h3>AI Salary Estimator</h3>
                    <Form.Select className='mb-3' value={salaryRole} onChange={(e) => setSalaryRole(e.target.value)}>
                      <option value="">-- Choose Role --</option>
                      {Object.keys(jobRequirements).map(r => <option key={r} value={r}>{r}</option>)}
                    </Form.Select>
                    <Button variant="success" onClick={estimateSalary} disabled={salaryLoading || !salaryRole} className="w-100">{salaryLoading ? <Spinner size="sm" /> : 'Calculate My Worth'}</Button>
                    {salaryResult && (
                      <Alert variant="info" className="mt-4">
                        <div style={{fontSize: '1.2rem'}}><strong>{salaryResult.split('|')[0]}</strong></div>
                        <p className='mt-2 mb-0 small'><strong>Why:</strong> {salaryResult.split('|')[1]?.replace('Reasoning:', '')}</p>
                      </Alert>
                    )}
                  </Card>
                </Tab>

                <Tab eventKey="takeTest" title="📝 Take Test">
                  <div className="animate_animated animate_fadeIn">
                    <TestScreen />
                  </div>
                </Tab>
                <Tab eventKey="aiCoach" title="🤖 AI Coach"><Card className='p-4 bg-dark text-white'>AI Career Coach</Card></Tab>
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