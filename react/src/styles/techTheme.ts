// 全局科技风主题配置
export const techThemeStyles = {
  // 页面容器样式
  pageContainer: {
    background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #000051 100%)',
    minHeight: '100vh',
    color: '#fff',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },

  // 卡片样式
  card: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7))',
    border: '2px solid #00d4ff',
    borderRadius: 12,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), inset 0 0 40px rgba(0, 212, 255, 0.12)',
    position: 'relative' as const,
  },

  // 统计卡片样式
  statisticCard: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7))',
    border: '2px solid #00d4ff',
    borderRadius: 12,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 25px rgba(0, 212, 255, 0.3), inset 0 0 25px rgba(0, 212, 255, 0.1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },

  // 标题样式
  title: {
    color: '#00d4ff',
    fontWeight: 700,
    textShadow: '0 0 15px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.4)',
    fontSize: '18px',
  },

  // 子标题样式
  subtitle: {
    color: '#00d4ff',
    fontWeight: 600,
    textShadow: '0 0 10px rgba(0, 212, 255, 0.6)',
    fontSize: '16px',
  },

  // 统计数值样式
  statisticPrimary: { 
    color: '#00d4ff',
    textShadow: '0 0 10px rgba(0, 212, 255, 0.6)'
  },
  statisticSuccess: { 
    color: '#00ff88',
    textShadow: '0 0 10px rgba(0, 255, 136, 0.6)'
  },
  statisticWarning: { 
    color: '#ff6b35',
    textShadow: '0 0 10px rgba(255, 107, 53, 0.6)'
  },
  statisticPurple: { 
    color: '#a855f7',
    textShadow: '0 0 10px rgba(168, 85, 247, 0.6)'
  },

  // 按钮样式
  button: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
    border: '2px solid #00d4ff',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 15px rgba(0, 212, 255, 0.1)',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
  },

  // 重置按钮样式
  resetButton: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6))',
    border: '2px solid #00d4ff',
    borderRadius: 8,
    color: '#00d4ff',
    fontWeight: 'bold',
    boxShadow: '0 0 15px rgba(0, 212, 255, 0.3), inset 0 0 15px rgba(0, 212, 255, 0.08)',
    textShadow: '0 0 6px rgba(0, 212, 255, 0.6)',
  },

  // 危险按钮样式
  dangerButton: {
    background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
    border: '2px solid #ff4757',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(255, 71, 87, 0.5), inset 0 0 15px rgba(255, 71, 87, 0.1)',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
  },

  // 输入框样式
  input: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6))',
    border: '2px solid rgba(0, 212, 255, 0.4)',
    borderRadius: 8,
    color: '#fff',
    boxShadow: 'inset 0 0 15px rgba(0, 212, 255, 0.1)',
  },

  // 图表背景样式
  chartBackground: {
    background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(26, 35, 126, 0.85))',
    border: '2px solid #00d4ff',
    borderRadius: 12,
    padding: 8,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), inset 0 0 30px rgba(0, 212, 255, 0.08)',
  },

  // 表格样式
  table: {
    backgroundColor: 'transparent',
    color: '#fff',
  },

  // 文本样式
  text: {
    color: '#fff',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
  },

  // 次要文本样式
  textSecondary: {
    color: '#b3c6d9',
    textShadow: '0 0 6px rgba(179, 198, 217, 0.3)',
  },

  // 成功状态颜色
  colorSuccess: '#00ff88',
  // 警告状态颜色
  colorWarning: '#ff6b35',
  // 错误状态颜色
  colorError: '#ff4757',
  // 主色调
  colorPrimary: '#00d4ff',
  // 紫色
  colorPurple: '#a855f7',
};

// 背景装饰效果样式
export const techBackgroundDecorations = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none' as const,
  background: `
    radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 60% 40%, rgba(0, 255, 136, 0.06) 0%, transparent 50%),
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
  `,
  backgroundSize: '100% 100%, 100% 100%, 100% 100%, 50px 50px, 50px 50px',
  zIndex: -1
};

// 全局CSS样式字符串
export const techGlobalStyles = `
  /* 科技风格全局样式 */
  .tech-theme {
    background: linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #000051 100%);
    min-height: 100vh;
    color: #fff;
  }

  /* Ant Design 组件重写 */
  .tech-theme .ant-layout {
    background: transparent !important;
  }

  .tech-theme .ant-layout-header {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(26, 35, 126, 0.85)) !important;
    border-bottom: 2px solid rgba(0, 212, 255, 0.3) !important;
    backdrop-filter: blur(15px) !important;
    box-shadow: 0 2px 20px rgba(0, 212, 255, 0.2) !important;
  }

  .tech-theme .ant-layout-sider {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(26, 35, 126, 0.85)) !important;
    border-right: 2px solid rgba(0, 212, 255, 0.3) !important;
    backdrop-filter: blur(15px) !important;
    box-shadow: 2px 0 20px rgba(0, 212, 255, 0.2) !important;
  }

  .tech-theme .ant-menu {
    background: transparent !important;
    border: none !important;
  }

  .tech-theme .ant-menu-item {
    color: #00d4ff !important;
    border-radius: 8px !important;
    margin: 4px 8px !important;
    transition: all 0.3s ease !important;
  }

  .tech-theme .ant-menu-item:hover {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.25)) !important;
    color: #ffffff !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.3) !important;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.6) !important;
  }

  .tech-theme .ant-menu-item-selected {
    background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
    color: #ffffff !important;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5) !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8) !important;
  }

  .tech-theme .ant-menu-submenu-title {
    color: #00d4ff !important;
    border-radius: 8px !important;
    margin: 4px 8px !important;
  }

  .tech-theme .ant-menu-submenu-title:hover {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.25)) !important;
    color: #ffffff !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.3) !important;
  }

  .tech-theme .ant-card {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
    border: 2px solid rgba(0, 212, 255, 0.5) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(15px) !important;
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.3) !important;
  }

  .tech-theme .ant-card-head {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.05)) !important;
    border-bottom: 2px solid rgba(0, 212, 255, 0.3) !important;
    border-radius: 10px 10px 0 0 !important;
  }

  .tech-theme .ant-card-head-title {
    color: #00d4ff !important;
    font-weight: 700 !important;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.6) !important;
  }

  .tech-theme .ant-card-body {
    background: transparent !important;
    color: #fff !important;
  }

  .tech-theme .ant-btn-primary {
    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%) !important;
    border: 2px solid #00d4ff !important;
    border-radius: 8px !important;
    color: #fff !important;
    font-weight: bold !important;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5) !important;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.8) !important;
  }

  .tech-theme .ant-btn-primary:hover {
    background: linear-gradient(135deg, #0099cc 0%, #00d4ff 100%) !important;
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.7) !important;
    transform: translateY(-2px) !important;
  }

  .tech-theme .ant-btn-default {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
    border: 2px solid rgba(0, 212, 255, 0.5) !important;
    border-radius: 8px !important;
    color: #00d4ff !important;
    font-weight: bold !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.3) !important;
  }

  .tech-theme .ant-btn-default:hover {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1)) !important;
    color: #ffffff !important;
    box-shadow: 0 0 25px rgba(0, 212, 255, 0.5) !important;
  }

  .tech-theme .ant-btn-dangerous {
    background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%) !important;
    border: 2px solid #ff4757 !important;
    border-radius: 8px !important;
    color: #fff !important;
    font-weight: bold !important;
    box-shadow: 0 0 20px rgba(255, 71, 87, 0.5) !important;
  }

  .tech-theme .ant-input {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
    border: 2px solid rgba(0, 212, 255, 0.4) !important;
    border-radius: 8px !important;
    color: #fff !important;
    box-shadow: inset 0 0 15px rgba(0, 212, 255, 0.1) !important;
  }

  .tech-theme .ant-input:focus {
    border-color: #00d4ff !important;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4) !important;
  }

  .tech-theme .ant-input::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
  }

  .tech-theme .ant-select-selector {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
    border: 2px solid rgba(0, 212, 255, 0.4) !important;
    border-radius: 8px !important;
    color: #fff !important;
  }

  .tech-theme .ant-select-arrow {
    color: #00d4ff !important;
  }

  .tech-theme .ant-picker {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
    border: 2px solid rgba(0, 212, 255, 0.4) !important;
    border-radius: 8px !important;
    color: #fff !important;
  }

  .tech-theme .ant-picker-input input {
    color: #fff !important;
  }

  .tech-theme .ant-picker-suffix {
    color: #00d4ff !important;
  }

  .tech-theme .ant-form-item-label > label {
    color: #fff !important;
    font-weight: 600 !important;
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.3) !important;
  }

  .tech-theme .ant-pagination {
    color: #fff !important;
  }

  .tech-theme .ant-pagination-item {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
    border: 2px solid rgba(0, 212, 255, 0.4) !important;
    border-radius: 6px !important;
  }

  .tech-theme .ant-pagination-item a {
    color: #00d4ff !important;
    font-weight: 600 !important;
  }

  .tech-theme .ant-pagination-item-active {
    background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
    border-color: #00d4ff !important;
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.5) !important;
  }

  .tech-theme .ant-pagination-item-active a {
    color: #ffffff !important;
  }

  .tech-theme .ant-table {
    background: transparent !important;
    color: #fff !important;
  }

  .tech-theme .ant-table-thead > tr > th {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
    color: #00d4ff !important;
    border-bottom: 2px solid #00d4ff !important;
    font-weight: 700 !important;
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.6) !important;
  }

  .tech-theme .ant-table-tbody > tr > td:not(:nth-child(4)):not(:nth-child(5)):not(:nth-child(6)) {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
    color: #fff !important;
    border-bottom: 1px solid rgba(0, 212, 255, 0.2) !important;
  }

  /* 移除表格行悬停时的背景与阴影，避免出现黑色阴影/加深条 */
  .tech-theme .ant-table-tbody > tr:hover > td {
    background: transparent !important;
    box-shadow: none !important;
  }

  /* 特殊列悬停时保持原色 */
  .tech-theme .ant-table-tbody > tr:hover > td:nth-child(4),
  .tech-theme .ant-table-tbody > tr:hover > td:nth-child(4) * {
    color: #ffd700 !important;
    background: transparent !important;
  }

  .tech-theme .ant-table-tbody > tr:hover > td:nth-child(5),
  .tech-theme .ant-table-tbody > tr:hover > td:nth-child(5) * {
    color: #00ff88 !important;
    background: transparent !important;
  }

  .tech-theme .ant-table-tbody > tr:hover > td:nth-child(6),
  .tech-theme .ant-table-tbody > tr:hover > td:nth-child(6) * {
    color: #a855f7 !important;
    background: transparent !important;
  }

  .tech-theme .ant-list-item {
    border-bottom: 1px solid rgba(0, 212, 255, 0.2) !important;
  }

  .tech-theme .ant-empty-description {
    color: #fff !important;
  }

  .tech-theme .ant-result-title {
    color: #fff !important;
  }

  .tech-theme .ant-result-subtitle {
    color: #b3c6d9 !important;
  }

  .tech-theme .ant-upload {
    background: transparent !important;
  }

  .tech-theme .ant-upload-list {
    color: #fff !important;
  }

  .tech-theme .ant-message {
    z-index: 9999 !important;
  }

  .tech-theme .ant-spin-dot-item {
    background-color: #00d4ff !important;
  }

  .tech-theme .ant-avatar {
    border: 2px solid #00d4ff !important;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5) !important;
  }

  .tech-theme .ant-badge-status-dot {
    box-shadow: 0 0 10px currentColor !important;
  }

  .tech-theme .ant-tag {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.25)) !important;
    border: 1px solid #00d4ff !important;
    color: #00ffff !important;
    font-weight: 600 !important;
    text-shadow: 0 0 6px rgba(0, 255, 255, 0.5) !important;
    box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2) !important;
    border-radius: 4px !important;
  }

  /* Pro Components 样式重写 */
  .tech-theme .ant-pro-page-container-children-content {
    background: transparent !important;
  }

  /* Footer 样式 */
  .tech-theme .ant-pro-layout-footer {
    background: linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #000051 100%) !important;
    color: #fff !important;
    border-top: 2px solid rgba(0, 212, 255, 0.3) !important;
  }

  .tech-theme .ant-pro-layout-footer .ant-typography {
    color: #fff !important;
  }

  .tech-theme .ant-pro-layout-footer a {
    color: #00d4ff !important;
    text-decoration: none !important;
    transition: all 0.3s ease !important;
  }

  .tech-theme .ant-pro-layout-footer a:hover {
    color: #ffffff !important;
    text-shadow: 0 0 8px rgba(0, 212, 255, 0.8) !important;
  }

  .tech-theme .ant-pro-card {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
    border: 2px solid rgba(0, 212, 255, 0.5) !important;
    border-radius: 12px !important;
    backdrop-filter: blur(15px) !important;
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.3) !important;
  }

  .tech-theme .ant-pro-table-search {
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6)) !important;
    border-radius: 12px !important;
    padding: 20px !important;
    margin-bottom: 16px !important;
    border: 2px solid rgba(0, 212, 255, 0.3) !important;
  }

  /* 滚动条样式 */
  .tech-theme ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .tech-theme ::-webkit-scrollbar-track {
    background: rgba(10, 25, 41, 0.5);
    border-radius: 4px;
  }

  .tech-theme ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #00d4ff, #0099cc);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  }

  .tech-theme ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #0099cc, #00d4ff);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.7);
  }
`;
