import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { BoxArrowInRight } from 'react-bootstrap-icons';
import '../styles/LoginPage.css';

function LoginPage() {
  const [userAccount, setUserAccount] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Placeholder for login API call
      console.log('Logging in with:', { userAccount, userPassword });
      alert('Login successful! Redirecting to home page...');
      // In a real app, you would redirect here after successful login
      // For example, using useNavigate() from react-router-dom
      // navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center align-items-center vh-100">
          <Col md={6} lg={4}>
            <Card className="login-card">
              <Card.Body>
                <div className="text-center mb-4">
                  <div className="login-icon mb-3">
                    <BoxArrowInRight size={48} />
                  </div>
                  <h1 className="login-title">数据平台登录</h1>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formUserAccount">
                    <Form.Control
                      type="text"
                      placeholder="请输入账号"
                      value={userAccount}
                      onChange={(e) => setUserAccount(e.target.value)}
                      required
                      className="login-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formUserPassword">
                    <Form.Control
                      type="password"
                      placeholder="请输入密码"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      required
                      className="login-input"
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 login-button">
                    登录
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage;
