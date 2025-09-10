import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Search, ArrowCounterclockwise } from 'react-bootstrap-icons';
import './UserSearchForm.css';

function UserSearchForm({ onSearch }) {

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const params = Object.fromEntries(formData.entries());
    onSearch(params);
  };

  return (
    <Form onSubmit={handleSubmit} className="user-search-form">
      <Row className="g-3">
        <Col xs={12} md={6} lg={3}>
          <Form.Control type="text" name="id" placeholder="id: 请输入" />
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Form.Control type="text" name="userAccount" placeholder="账号: 请输入" />
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Form.Control type="text" name="userName" placeholder="用户名: 请输入" />
        </Col>
        <Col xs={12} md={6} lg={3} className="d-flex justify-content-end">
            <Button variant="outline-secondary" type="reset" className="me-2">
              <ArrowCounterclockwise className="me-1" /> 重置
            </Button>
            <Button variant="primary" type="submit" className="search-button">
              <Search className="me-1" /> 查询
            </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default UserSearchForm;
