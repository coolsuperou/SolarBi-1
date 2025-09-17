// 表格和相关组件的通用样式
// 从各页面中提取的可复用CSS样式

export const tableStylesCSS = `
/* ==========  基础表格样式  ========== */
.dark-table .ant-table {
  background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
  color: #fff !important;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}

/* 强制移除表格容器和相关组件的所有阴影 */
.dark-table,
.dark-table *,
.dark-table .ant-pro-table,
.dark-table .ant-pro-table *,
.dark-table .ant-card,
.dark-table .ant-card-body,
.dark-table .ant-table-wrapper,
.dark-table .ant-table-container,
.dark-table .ant-table-content,
.dark-table .ant-pro-table-list-toolbar,
.dark-table .ant-pro-table-list-toolbar-container {
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
  filter: none !important;
}

/* 特别针对可能来自global.less的全局样式覆盖 */
.dark-table .ant-card,
.dark-table .ant-pro-card,
.dark-table .ant-tag {
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}

/* 更高优先级的阴影移除 */
div.dark-table,
div.dark-table .ant-table,
div.dark-table .ant-table *,
div.dark-table .ant-pro-table,
div.dark-table .ant-pro-table * {
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}

/* 特殊无阴影Card类 */
.no-shadow-card,
.no-shadow-card.ant-card,
.no-shadow-card .ant-card-body,
.no-shadow-card * {
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
  filter: none !important;
}

/* 仅针对表格数据内容移除阴影，保留分页器等其他组件的发光效果 */
.dark-table .ant-table-tbody,
.dark-table .ant-table-tbody tr,
.dark-table .ant-table-tbody td {
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}

/* ==========  表头样式  ========== */
.dark-table .ant-table-thead th {
  background: linear-gradient(135deg, #0f1a2e, #1a2742) !important;
  border-bottom: 2px solid #00d4ff !important;
  color: #00d4ff !important;
  font-weight: 700 !important;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.8), 0 0 16px rgba(0, 212, 255, 0.6) !important;
}

/* ==========  表体通用样式  ========== */
.dark-table .ant-table-tbody td {
  background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
  border-bottom: 1px solid rgba(0, 212, 255, 0.15) !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  text-decoration: none !important;
  box-shadow: none !important;
}

/* 强制移除所有可能的阴影 */
.dark-table .ant-table-tbody td *,
.dark-table .ant-table-tbody td span,
.dark-table .ant-table-tbody td div,
.dark-table .ant-table-tbody td .ant-space,
.dark-table .ant-table-tbody td .ant-badge,
.dark-table .ant-table-tbody td .anticon,
.dark-table .ant-table-tbody .ant-tag,
.dark-table .ant-table-tbody .ant-typography,
.dark-table .ant-table-tbody .ant-space-item {
  box-shadow: none !important;
  filter: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}

/* 覆盖全局标签样式在表格中的阴影 */
.dark-table .ant-table-tbody .ant-tag {
  box-shadow: none !important;
}

/* ==========  默认列样式（白色）========== */
.dark-table .ant-table-tbody td:nth-child(1),
.dark-table .ant-table-tbody td:nth-child(3),
.dark-table .ant-table-tbody td:nth-child(5) {
  color: #ffffff !important;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8) !important;
}

.dark-table .ant-table-tbody td:nth-child(1) *,
.dark-table .ant-table-tbody td:nth-child(3) *,
.dark-table .ant-table-tbody td:nth-child(5) * {
  color: #ffffff !important;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8) !important;
}

/* ==========  特殊列样式  ========== */
/* 部门车间列（第2列）- 紫色发光 */
.dark-table .ant-table-tbody td:nth-child(2),
.dark-table .ant-table-tbody td:nth-child(2) * {
  color: #a855f7 !important;
  text-shadow: 0 0 8px rgba(168, 85, 247, 0.8), 0 0 16px rgba(168, 85, 247, 0.6) !important;
  border-bottom: none !important;
}

/* 电能度数列（第4列）- 黄色发光 */
.dark-table .ant-table-tbody td:nth-child(4),
.dark-table .ant-table-tbody td:nth-child(4) * {
  color: #ffd700 !important;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.8), 0 0 16px rgba(255, 215, 0, 0.6) !important;
  border-bottom: none !important;
}

/* ==========  悬停效果  ========== */
.dark-table .ant-table-tbody tr:hover td:nth-child(1),
.dark-table .ant-table-tbody tr:hover td:nth-child(3),
.dark-table .ant-table-tbody tr:hover td:nth-child(5) {
  background: linear-gradient(135deg, rgba(10, 25, 41, 1), rgba(26, 35, 126, 0.9)) !important;
}

.dark-table .ant-table-tbody tr:hover td:nth-child(2) {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.12)) !important;
}

.dark-table .ant-table-tbody tr:hover td:nth-child(4) {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 215, 0, 0.12)) !important;
}

/* ==========  分页器样式  ========== */
.dark-table .ant-pagination {
  background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

/* 分页项通用样式 */
.dark-table .ant-pagination .ant-pagination-item,
.dark-table .ant-pagination .ant-pagination-prev,
.dark-table .ant-pagination .ant-pagination-next {
  background: linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(26, 35, 126, 0.7)) !important;
  border: 2px solid rgba(0, 212, 255, 0.6) !important;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3) !important;
  min-width: 32px !important;
  height: 32px !important;
  margin: 0 2px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

/* 悬停效果 */
.dark-table .ant-pagination .ant-pagination-item:hover,
.dark-table .ant-pagination .ant-pagination-prev:hover,
.dark-table .ant-pagination .ant-pagination-next:hover {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.2)) !important;
  border-color: #00d4ff !important;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.5) !important;
  transform: translateY(-1px) !important;
}

/* 激活状态 */
.dark-table .ant-pagination .ant-pagination-item-active {
  background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
  border: 2px solid #ffffff !important;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.8) !important;
  transform: scale(1.1) !important;
}

/* 禁用状态 */
.dark-table .ant-pagination .ant-pagination-disabled {
  background: linear-gradient(135deg, rgba(10, 25, 41, 0.6), rgba(26, 35, 126, 0.4)) !important;
  border: 2px solid rgba(0, 212, 255, 0.3) !important;
  cursor: not-allowed !important;
  opacity: 0.5 !important;
}

/* 文字样式 */
.dark-table .ant-pagination .ant-pagination-item a,
.dark-table .ant-pagination .ant-pagination-prev a,
.dark-table .ant-pagination .ant-pagination-next a {
  color: #00d4ff !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.8) !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-decoration: none !important;
}

.dark-table .ant-pagination .ant-pagination-item-active a {
  color: #ffffff !important;
  font-weight: 800 !important;
  text-shadow: 0 0 10px rgba(255, 255, 255, 1) !important;
}

.dark-table .ant-pagination .ant-pagination-total-text {
  color: #e6f7ff !important;
  font-weight: 600;
  text-shadow: 0 0 4px rgba(230, 247, 255, 0.4);
}

/* ==========  表单组件样式  ========== */
.dark-table .ant-input,
.dark-table .ant-select-selector {
  background: rgba(26, 35, 50, 0.8) !important;
  border: 1px solid rgba(64, 169, 255, 0.3) !important;
  color: #fff !important;
}

.ant-form-item-label > label {
  color: #fff !important;
}

.ant-picker {
  background: rgba(26, 35, 50, 0.8) !important;
  border: 1px solid rgba(64, 169, 255, 0.3) !important;
  color: #fff !important;
}

.ant-picker-input input {
  color: #fff !important;
}

.ant-picker-suffix {
  color: #40a9ff !important;
}

/* ==========  标签样式  ========== */
.ant-tag {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.25)) !important;
  border: 1px solid #00d4ff !important;
  color: #00ffff !important;
  font-weight: 600;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2);
  border-radius: 4px;
}

.dark-table .ant-table-tbody .ant-tag {
  background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
  border: 1px solid #00ffff !important;
  color: #ffffff !important;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  box-shadow: none !important;
}

/* ==========  其他组件样式  ========== */
.ant-empty-description {
  color: #fff !important;
}
`;
