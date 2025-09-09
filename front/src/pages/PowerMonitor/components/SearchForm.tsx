import React from 'react';
import { Card, Space, Typography, Button, message } from 'antd';
import { EyeOutlined, SearchOutlined, ReloadOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';

type DarkThemeStyles = {
  pageContainer: React.CSSProperties;
  card: React.CSSProperties;
  title: React.CSSProperties;
  statisticPrimary: React.CSSProperties;
  statisticSuccess: React.CSSProperties;
  statisticWarning: React.CSSProperties;
  statisticPurple: React.CSSProperties;
  chartBackground: React.CSSProperties;
  button: React.CSSProperties;
  resetButton: React.CSSProperties;
  input: React.CSSProperties;
  table: React.CSSProperties;
  statisticCard: React.CSSProperties;
};

interface SearchFormProps {
  darkThemeStyles: DarkThemeStyles;
  searchParams: any;
  setSearchParams: React.Dispatch<React.SetStateAction<any>>;
  handleSearch: (values: any) => void;
  handleReset: () => void;
  showChart: boolean;
  setShowChart: React.Dispatch<React.SetStateAction<boolean>>;
  startTimeRef: React.MutableRefObject<any>;
  endTimeRef: React.MutableRefObject<any>;
}

const { Title } = Typography;

const SearchForm: React.FC<SearchFormProps> = ({
  darkThemeStyles,
  searchParams,
  setSearchParams,
  handleSearch,
  handleReset,
  showChart,
  setShowChart,
  startTimeRef,
  endTimeRef
}) => {
  return (
    <Card style={{ ...darkThemeStyles.card, marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <Space size="middle">
          <Title level={4} style={{ ...darkThemeStyles.title, margin: 0 }}>
            <EyeOutlined /> 实时监控数据
          </Title>
        </Space>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* 开始时间组合 */}
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#fff', fontSize: '14px', whiteSpace: 'nowrap' }}>开始时间:</label>
          <div className="time-combo-container" style={{
            display: 'flex',
            border: '2px solid rgba(0, 212, 255, 0.4)',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6))',
            overflow: 'hidden',
            height: '32px'
          }}>
            <input
              ref={startTimeRef}
              type="date"
              style={{
                ...darkThemeStyles.input,
                width: '140px',
                height: '28px',
                padding: '4px 8px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '0',
                background: 'transparent',
                color: '#fff',
                outline: 'none'
              }}
              onChange={(e) => {
                const dateValue = e.target.value;
                const hourValue = (document.getElementById('startHour') as HTMLSelectElement)?.value || '00';
                if (dateValue) {
                  const formattedValue = `${dateValue} ${hourValue}:00:00`;
                  setSearchParams(prev => ({ ...prev, startTime: formattedValue }));
                }
              }}
            />
            <div className="combo-divider" style={{ width: '1px', background: 'rgba(0, 212, 255, 0.3)', alignSelf: 'stretch' }}></div>
            <select
              id="startHour"
              style={{
                ...darkThemeStyles.input,
                width: '98px',
                height: '28px',
                padding: '4px 8px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '0',
                background: 'transparent',
                color: '#fff',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%2300d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>\')',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '12px 12px',
                paddingRight: '24px'
              }}
              onChange={(e) => {
                const hourValue = e.target.value;
                const dateValue = startTimeRef.current?.value;
                if (dateValue) {
                  const formattedValue = `${dateValue} ${hourValue}:00:00`;
                  setSearchParams(prev => ({ ...prev, startTime: formattedValue }));
                }
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}时
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 结束时间组合 */}
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#fff', fontSize: '14px', whiteSpace: 'nowrap' }}>结束时间:</label>
          <div className="time-combo-container" style={{
            display: 'flex',
            border: '2px solid rgba(0, 212, 255, 0.4)',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6))',
            overflow: 'hidden',
            height: '32px'
          }}>
            <input
              ref={endTimeRef}
              type="date"
              style={{
                ...darkThemeStyles.input,
                width: '140px',
                height: '28px',
                padding: '4px 8px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '0',
                background: 'transparent',
                color: '#fff',
                outline: 'none'
              }}
              onChange={(e) => {
                const dateValue = e.target.value;
                const hourValue = (document.getElementById('endHour') as HTMLSelectElement)?.value || '23';
                if (dateValue) {
                  const formattedValue = `${dateValue} ${hourValue}:05:00`;
                  setSearchParams(prev => ({ ...prev, endTime: formattedValue }));
                }
              }}
            />
            <div className="combo-divider" style={{ width: '1px', background: 'rgba(0, 212, 255, 0.3)', alignSelf: 'stretch' }}></div>
            <select
              id="endHour"
              style={{
                ...darkThemeStyles.input,
                width: '98px',
                height: '28px',
                padding: '4px 8px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '0',
                background: 'transparent',
                color: '#fff',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%2300d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>\')',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '12px 12px',
                paddingRight: '24px'
              }}
              onChange={(e) => {
                const hourValue = e.target.value;
                const dateValue = endTimeRef.current?.value;
                if (dateValue) {
                  const formattedValue = `${dateValue} ${hourValue}:05:00`;
                  setSearchParams(prev => ({ ...prev, endTime: formattedValue }));
                }
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}时
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ flex: '0 0 auto', display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            style={{ ...darkThemeStyles.button, height: '32px', padding: '0 16px' }}
            title={searchParams.startTime && searchParams.endTime 
              ? '查询指定时间范围的数据' 
              : '查询最近24小时数据（未选择时间时的默认查询）'
            }
            onClick={() => {
              // 如果用户选择了时间，使用选择的时间进行查询
              // 如果用户没有选择时间，执行默认查询（显示最近24小时数据）
              if (searchParams.startTime && searchParams.endTime) {
                handleSearch({ startTime: searchParams.startTime, endTime: searchParams.endTime });
              } else {
                // 没有选择时间时，执行默认查询
                handleSearch({});
              }
            }}
          >
            <SearchOutlined style={{ filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.6))' }} /> 查询
          </Button>
          <Button
            style={{ ...darkThemeStyles.resetButton, height: '32px', padding: '0 16px' }}
            onClick={handleReset}
          >
            <ReloadOutlined style={{ filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.6))' }} /> 重置
          </Button>
          <Button
            style={{
              ...darkThemeStyles.button,
              height: '32px',
              padding: '0 16px',
              background: showChart
                ? 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
                : 'linear-gradient(135deg, rgba(10, 25, 41, 0.8), rgba(26, 35, 126, 0.6))',
              borderColor: '#00d4ff',
              color: showChart ? '#fff' : '#00d4ff'
            }}
            onClick={() => setShowChart(!showChart)}
            title={showChart ? '折叠图表' : '展开图表'}
          >
            {showChart ? (
              <><UpOutlined style={{ filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.6))' }} /> 折叠</>
            ) : (
              <><DownOutlined style={{ filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.6))' }} /> 展开</>
            )}
          </Button>
        </div>
      </div>

      {/* 组合时间选择器样式覆盖 */}
      <style>
        {`
          /* 日期输入框样式 */
          input[type="date"] {
            color-scheme: dark !important;
            color: #fff !important;
          }

          /* 日期输入框日历图标 */
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%2300d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>') no-repeat !important;
            background-size: 16px 16px !important;
            cursor: pointer !important;
            filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.6)) !important;
            opacity: 0.8 !important;
          }

          input[type="date"]:hover::-webkit-calendar-picker-indicator {
            opacity: 1 !important;
            filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.8)) !important;
          }

          /* 下拉框选项样式 */
          select option {
            background: rgba(10, 25, 41, 0.95) !important;
            color: #fff !important;
            padding: 8px !important;
          }

          select option:hover,
          select option:checked {
            background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%) !important;
            color: #fff !important;
          }

          /* 组合组件整体悬停效果 */
          .time-combo-container:hover {
            border-color: #00d4ff !important;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 15px rgba(0, 212, 255, 0.1) !important;
          }

          /* 内部元素聚焦时的父容器效果 */
          .time-combo-container:focus-within {
            border-color: #00d4ff !important;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 15px rgba(0, 212, 255, 0.15) !important;
          }

          /* 分隔线在悬停时的效果 */
          .time-combo-container:hover .combo-divider {
            background: rgba(0, 212, 255, 0.6) !important;
          }
        `}
      </style>
    </Card>
  );
};

export default SearchForm;



