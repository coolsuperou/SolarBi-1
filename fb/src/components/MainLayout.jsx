import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css';

function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="main-layout-container">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`content-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Header isSidebarCollapsed={isSidebarCollapsed} />
        <main className="main-content container-fluid">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
