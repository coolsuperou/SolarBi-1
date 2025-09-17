// 响应式布局CSS样式
// 从各页面中提取的可复用响应式样式

export const responsiveStylesCSS = `
/* ==========  响应式布局  ========== */

/* 平板适配 (768px - 1024px) */
@media (max-width: 1024px) {
  .dark-table .ant-table {
    font-size: 13px !important;
  }

  .dark-table .ant-table-thead th {
    padding: 8px 12px !important;
    font-size: 13px !important;
  }

  .dark-table .ant-table-tbody td {
    padding: 8px 12px !important;
    font-size: 13px !important;
  }

  .dark-table .ant-pagination {
    padding: 12px !important;
  }

  .dark-table .ant-pagination .ant-pagination-item,
  .dark-table .ant-pagination .ant-pagination-prev,
  .dark-table .ant-pagination .ant-pagination-next {
    min-width: 28px !important;
    height: 28px !important;
    font-size: 12px !important;
  }
}

/* 手机端适配 (最大宽度 768px) */
@media (max-width: 768px) {
  /* 搜索表单手机端布局 - 保持一行显示 */
  .time-combo-container {
    width: 100% !important;
    flex-direction: row !important;
    height: 40px !important;
    max-width: 260px !important;
  }

  .time-combo-container input[type="date"] {
    width: 150px !important;
    height: 36px !important;
    flex-shrink: 0 !important;
  }

  .time-combo-container select {
    width: 80px !important;
    height: 36px !important;
    flex-shrink: 0 !important;
  }

  .combo-divider {
    display: block !important;
    width: 1px !important;
    height: 36px !important;
  }

  /* 表格手机端滚动 */
  .dark-table .ant-table-wrapper {
    overflow-x: auto !important;
  }

  .dark-table .ant-table {
    min-width: 600px !important;
    font-size: 12px !important;
  }

  .dark-table .ant-table-thead th {
    padding: 6px 8px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
  }

  .dark-table .ant-table-tbody td {
    padding: 6px 8px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
  }

  /* 分页器手机端适配 */
  .dark-table .ant-pagination {
    padding: 8px !important;
    text-align: center !important;
  }

  .dark-table .ant-pagination .ant-pagination-item,
  .dark-table .ant-pagination .ant-pagination-prev,
  .dark-table .ant-pagination .ant-pagination-next {
    min-width: 24px !important;
    height: 24px !important;
    font-size: 11px !important;
    margin: 0 1px !important;
  }

  .dark-table .ant-pagination .ant-pagination-total-text {
    font-size: 12px !important;
  }

  /* 图表手机端适配 */
  .echarts-container {
    height: 300px !important;
  }

  /* 统计卡片手机端适配 */
  .ant-statistic-content {
    font-size: 16px !important;
  }

  .ant-statistic-title {
    font-size: 12px !important;
  }
}

/* 小屏幕手机适配 (最大宽度 480px) */
@media (max-width: 480px) {
  /* 页面边距调整 */
  .ant-pro-page-container-children-content {
    padding: 12px !important;
  }

  /* 卡片间距调整 */
  .ant-row {
    margin-left: -8px !important;
    margin-right: -8px !important;
  }

  .ant-col {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  /* 搜索表单紧凑布局 */
  .time-combo-container input[type="date"],
  .time-combo-container select {
    height: 36px !important;
    padding: 4px 6px !important;
    font-size: 12px !important;
  }

  /* 按钮紧凑布局 */
  .ant-btn {
    height: 36px !important;
    padding: 0 12px !important;
    font-size: 12px !important;
  }

  /* 图表进一步适配 */
  .echarts-container {
    height: 250px !important;
  }

  /* 表格进一步压缩 */
  .dark-table .ant-table {
    min-width: 500px !important;
    font-size: 11px !important;
  }

  .dark-table .ant-table-thead th,
  .dark-table .ant-table-tbody td {
    padding: 4px 6px !important;
    font-size: 11px !important;
  }
}
`;
