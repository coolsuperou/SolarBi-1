import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { PersonCircle, BoxArrowRight } from 'react-bootstrap-icons';

function Header() {
  // Mock user data for display
  const currentUser = {
    userName: 'Admin',
    userAvatar: null, // or a URL to an image
  };

  const handleLogout = () => {
    // Placeholder for logout logic
    console.log('User logged out');
    alert('You have been logged out.');
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="main-header">
      <Container fluid>
         <div className="header-brand-container">
            <svg width="28" height="28" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="header-logo">
                <path d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384zm0 720c-185.4 0-336-150.6-336-336s150.6-336 336-336 336 150.6 336 336-150.6 336-336 336z"/>
                <path d="M512 512m-192 0a192 192 0 1 0 384 0 192 192 0 1 0-384 0Z"/>
                <path d="M512 128L448 32l-96 96 96 96 64-96 64 96 96-96-96-96-64 96zM896 448l96-64-96-64-96 64 96 64zM128 512l-96-64 96-64 64 96-64 96zM512 896l64 96 96-96-96-96-64 96zM128 448l-96 64 96 64 96-64-96-64zM896 576l96 64-96 64-96-64 96-64zM448 992l-96-96 96-96 64 96 64-96 96 96-96 96-64-96-64 96zM128 576l-96-64 96-64 64 96-64-96z"/>
            </svg>
            <span className="header-title">工具制造电能数据平台</span>
        </div>
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {currentUser ? (
              <NavDropdown
                title={
                  <div className="d-flex align-items-center">
                    <PersonCircle size={24} className="me-2" />
                    <span>{currentUser.userName}</span>
                  </div>
                }
                id="user-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item onClick={handleLogout}>
                  <BoxArrowRight className="me-2" /> 退出登录
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <LinkContainer to="/login">
                <Nav.Link>登录</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
