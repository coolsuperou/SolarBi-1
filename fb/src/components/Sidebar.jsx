import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { ThunderboltFill, PeopleFill, List, ArrowLeftRight } from 'react-bootstrap-icons';
import './Sidebar.css';

function Sidebar({ isCollapsed, toggleSidebar }) {
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <List size={24} /> : <ArrowLeftRight size={20} />}
      </div>

      <div className="sidebar-header">
        {isCollapsed ? null : (
          <div className="sidebar-brand">
             {/* Logo is now in the Header */}
          </div>
        )}
      </div>

      <Nav className="flex-column sidebar-nav">
        <LinkContainer to="/power-monitor">
          <Nav.Link className="sidebar-link">
            <ThunderboltFill size={20} />
            {!isCollapsed && <span className="link-text">电能数据监控</span>}
          </Nav.Link>
        </LinkContainer>
        <LinkContainer to="/user-management">
          <Nav.Link className="sidebar-link">
            <PeopleFill size={20} />
            {!isCollapsed && <span className="link-text">用户管理</span>}
          </Nav.Link>
        </LinkContainer>
      </Nav>
    </div>
  );
}

export default Sidebar;
