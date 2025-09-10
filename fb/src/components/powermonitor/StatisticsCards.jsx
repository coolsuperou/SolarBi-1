import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { GeoAltFill, EvStationFill, LightningChargeFill } from 'react-bootstrap-icons';
import './StatisticsCards.css';

function StatisticsCards({ stats }) {
  const cardItems = [
    { 
      title: '车间', 
      value: '114_空调水机主机', // Static value for now as in the screenshot
      icon: <GeoAltFill size={30} />, 
      unit: '',
      className: 'workshop-card'
    },
    { 
      title: '电能消耗', 
      value: stats.energyConsumption?.toFixed(2), 
      icon: <EvStationFill size={30} />, 
      unit: 'kWh',
      className: 'consumption-card'
    },
    { 
      title: '总电能消耗', 
      value: stats.totalElectricEnergy?.toLocaleString(), 
      icon: <LightningChargeFill size={30} />, 
      unit: 'kWh',
      className: 'total-energy-card'
    }
  ];

  return (
    <Row xs={1} md={3} lg={3} className="g-4 mb-4">
      {cardItems.map((item, index) => (
        <Col key={index}>
          <Card className={`stat-card ${item.className}`}>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  {item.icon}
                </div>
                <div>
                  <div className="stat-title">{item.title}</div>
                  <div className="stat-value">{item.value} <span className="stat-unit">{item.unit}</span></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default StatisticsCards;
