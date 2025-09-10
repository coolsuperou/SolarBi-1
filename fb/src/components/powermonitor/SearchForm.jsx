import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Search, ArrowCounterclockwise, EyeSlash, Eye } from 'react-bootstrap-icons';
import './SearchForm.css';

function SearchForm({ onSearch, isChartVisible, toggleChartVisibility, currentMode }) {

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const params = Object.fromEntries(formData.entries());
    onSearch(params);
  };

  const renderHourSelect = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    return (
      <Form.Select name="startHour" aria-label="Start hour" className="hour-select">
        {hours.map(hour => <option key={hour} value={hour}>{hour}时</option>)}
      </Form.Select>
    );
  };
  
    const renderEndHourSelect = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    return (
      <Form.Select name="endHour" aria-label="End hour" className="hour-select">
        {hours.map(hour => <option key={hour} value={hour}>{hour}时</option>)}
      </Form.Select>
    );
  };

  return (
    <Form onSubmit={handleSubmit} className="search-form">
      <Row className="align-items-end g-3">
        <Col xs="auto">
          <Form.Label htmlFor="startDate">开始时间:</Form.Label>
        </Col>
        <Col xs="auto" className="d-flex">
          <Form.Control type="date" name="startDate" id="startDate" />
          {currentMode === 'hour' && renderHourSelect()}
        </Col>
        <Col xs="auto" className="time-separator">~</Col>
        <Col xs="auto">
          <Form.Label htmlFor="endDate">结束时间:</Form.Label>
        </Col>
        <Col xs="auto" className="d-flex">
          <Form.Control type="date" name="endDate" id="endDate" />
          {currentMode === 'hour' && renderEndHourSelect()}
        </Col>
        <Col xs="auto">
          <Button variant="primary" type="submit" className="search-button">
            <Search className="me-1" /> 查询
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" type="reset">
            <ArrowCounterclockwise className="me-1" /> 重置
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="outline-info" onClick={toggleChartVisibility}>
            {isChartVisible ? <EyeSlash className="me-1" /> : <Eye className="me-1" />}
            {isChartVisible ? '折叠图表' : '展开图表'}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default SearchForm;
