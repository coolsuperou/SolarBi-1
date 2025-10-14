// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  initCharts();
  initEventListeners();
});

// 初始化所有图表
function initCharts() {
  initPowerMonitorChart();
}

// 电能监控图表 - 单条渐变曲线（类似截图）
function initPowerMonitorChart() {
  const chartDom = document.getElementById('mainChart');
  if (!chartDom) return;
  
  const myChart = echarts.init(chartDom);
  
  // 检测当前主题
  const isLightMode = document.body.classList.contains('light-mode');
  
  // 根据主题设置颜色方案
  const colors = isLightMode ? {
    primary: '#4f7cff',        // 蓝色主色
    lineColor: '#4f7cff',      // 线条颜色
    axisColor: '#9ca3af',      // 坐标轴颜色
    labelColor: '#6b7280',     // 标签颜色
    splitLineColor: 'rgba(229, 231, 235, 0.8)',  // 分割线颜色
    areaColorStart: 'rgba(79, 124, 255, 0.15)',  // 区域填充开始色
    areaColorEnd: 'rgba(79, 124, 255, 0.01)',    // 区域填充结束色
    tooltipBg: 'rgba(255, 255, 255, 0.98)',      // 提示框背景
    tooltipBorder: '#4f7cff',   // 提示框边框
    tooltipText: '#1f2937',     // 提示框文字
    pointBorder: '#ffffff',     // 数据点边框
    shadowColor: 'rgba(79, 124, 255, 0.3)'  // 阴影颜色
  } : {
    primary: '#00d4ff',
    lineColor: '#00d4ff',
    axisColor: '#00d4ff',
    labelColor: '#00d4ff',
    splitLineColor: 'rgba(0, 212, 255, 0.1)',
    areaColorStart: 'rgba(0, 212, 255, 0.4)',
    areaColorEnd: 'rgba(0, 212, 255, 0.05)',
    tooltipBg: 'rgba(10, 25, 41, 0.95)',
    tooltipBorder: '#00d4ff',
    tooltipText: '#ffffff',
    pointBorder: '#ffffff',
    shadowColor: '#00d4ff'
  };
  
  // 生成24小时时间轴（从16:00到次日15:00）
  const timeData = [];
  for (let i = 0; i < 24; i++) {
    const hour = (16 + i) % 24;
    timeData.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  // 生成电能消耗数据（模拟截图中的下降趋势）
  const powerData = [];
  for (let i = 0; i < 24; i++) {
    let value;
    if (i < 8) {
      // 前8小时保持高位（约280-300kWh）
      value = 280 + Math.random() * 20;
    } else if (i >= 8 && i < 11) {
      // 8-11小时急剧下降
      value = 280 - (i - 8) * 90 + Math.random() * 10;
    } else {
      // 11小时后保持低位（约0-10kWh）
      value = 0 + Math.random() * 10;
    }
    powerData.push(value.toFixed(2));
  }
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '60px',
      right: '40px',
      top: '60px',
      bottom: '40px',
      containLabel: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      borderWidth: isLightMode ? 1 : 2,
      textStyle: {
        color: colors.tooltipText,
        fontSize: 13,
        fontWeight: 'bold'
      },
      formatter: function(params) {
        if (params && params.length > 0) {
          const time = params[0].name;
          const value = params[0].value;
          const date = '2025-10-12';
          return `<div style="padding: 8px;">
                    <div style="color: ${colors.primary}; font-size: 14px; font-weight: bold; margin-bottom: 6px;">${date}</div>
                    <div style="color: ${colors.primary}; font-size: 13px; margin-bottom: 8px;">${time} 用电量</div>
                    <div><span style="color: ${colors.primary};">●</span> 114_空调水机主机: <span style="color: ${colors.primary}; font-weight: bold">${value} kWh</span></div>
                  </div>`;
        }
        return '';
      },
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: colors.primary,
          width: isLightMode ? 1 : 2,
          type: 'solid'
        }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLine: {
        lineStyle: {
          color: colors.axisColor,
          width: isLightMode ? 1 : 2
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: colors.axisColor
        }
      },
      axisLabel: {
        color: colors.labelColor,
        fontSize: 11,
        fontWeight: isLightMode ? 500 : 600,
        interval: 1
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.splitLineColor,
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '每小时用电量(kWh)',
      nameTextStyle: {
        color: colors.labelColor,
        fontSize: 12,
        fontWeight: isLightMode ? 500 : 600,
        padding: [0, 0, 0, -10]
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: colors.axisColor,
          width: isLightMode ? 1 : 2
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: colors.axisColor
        }
      },
      axisLabel: {
        color: colors.labelColor,
        fontSize: 11,
        fontWeight: isLightMode ? 500 : 600,
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor,
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '114_空调水机主机',
      type: 'line',
      smooth: true,  // 浅色模式使用平滑曲线
      symbol: 'circle',
      symbolSize: isLightMode ? 4 : 6,
      showSymbol: true,
      itemStyle: {
        color: colors.lineColor,
        borderColor: colors.pointBorder,
        borderWidth: 2,
        shadowColor: colors.shadowColor,
        shadowBlur: isLightMode ? 6 : 10
      },
      lineStyle: {
        width: isLightMode ? 3 : 3,
        color: colors.lineColor,
        shadowColor: colors.shadowColor,
        shadowBlur: isLightMode ? 0 : 10
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: colors.areaColorStart },
            { offset: 1, color: colors.areaColorEnd }
          ]
        }
      },
      data: powerData
    }]
  };
  
  myChart.setOption(option);
  
  // 响应式
  window.addEventListener('resize', function() {
    myChart.resize();
  });
  
  return myChart;
}

// 事件监听器
function initEventListeners() {
  // 主题切换悬浮球
  const themeToggle = document.getElementById('themeToggle');
  
  // 检查本地存储的主题偏好
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
  
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    
    // 保存主题偏好到本地存储
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // 重新初始化图表以适应新主题色
    setTimeout(() => {
      const chartDom = document.getElementById('mainChart');
      if (chartDom) {
        const chartInstance = echarts.getInstanceByDom(chartDom);
        if (chartInstance) {
          chartInstance.dispose(); // 销毁旧实例
        }
        initPowerMonitorChart(); // 重新创建
      }
    }, 300);
    
    console.log('当前主题:', isLight ? '浅色模式' : '深色模式');
  });
  
  // 模式切换按钮
  const modeBtns = document.querySelectorAll('.mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      modeBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      console.log('切换模式:', this.textContent);
    });
  });
  
  // 查询按钮
  const queryBtn = document.querySelector('.query-btn.primary');
  if (queryBtn) {
    queryBtn.addEventListener('click', function() {
      console.log('执行查询');
      // 重新加载图表
      initPowerMonitorChart();
    });
  }
}

// 已废弃的函数（保留以防错误）
function initMirrorChart() {
  const chartDom = document.getElementById('mirrorChart');
  const myChart = echarts.init(chartDom);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const series = [];
  const colors = [
    ['#3b82f6', '#2563eb'],
    ['#f472b6', '#ec4899'],
    ['#a855f7', '#9333ea'],
    ['#fbbf24', '#f59e0b'],
    ['#06ffa5', '#00e396'],
    ['#ff6b35', '#ff3d00'],
  ];
  
  for (let i = 0; i < 6; i++) {
    const data = months.map((month, index) => {
      const base = 5 + i * 1.5;
      const variation = Math.sin((index + i + 5) * 0.6) * 2;
      return (base + variation).toFixed(1);
    });
    
    series.push({
      name: `Mirror ${i + 1}`,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: colors[i][0] },
            { offset: 1, color: colors[i][1] }
          ]
        }
      },
      data: data
    });
  }
  
  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '3%',
      top: '5%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
      show: false
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: series
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}

// Sankey 图表
function initSankeyChart() {
  const chartDom = document.getElementById('sankeyChart');
  const myChart = echarts.init(chartDom);
  
  const option = {
    backgroundColor: 'transparent',
    series: {
      type: 'sankey',
      layout: 'none',
      emphasis: {
        focus: 'adjacency'
      },
      data: [
        { name: 'PARAMETER 1', itemStyle: { color: '#06ffa5' } },
        { name: 'PARAMETER 2', itemStyle: { color: '#06ffa5' } },
        { name: 'PARAMETER 3', itemStyle: { color: '#fbbf24' } },
        { name: 'PARAMETER 4', itemStyle: { color: '#fbbf24' } },
        { name: 'PARAMETER 5', itemStyle: { color: '#f472b6' } },
        { name: 'Summary', itemStyle: { color: '#06ffa5' } }
      ],
      links: [
        {
          source: 'PARAMETER 1',
          target: 'Summary',
          value: 999,
          lineStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#06ffa5' },
                { offset: 1, color: '#06ffa5' }
              ]
            }
          }
        },
        {
          source: 'PARAMETER 2',
          target: 'Summary',
          value: 999,
          lineStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#06ffa5' },
                { offset: 1, color: '#06ffa5' }
              ]
            }
          }
        },
        {
          source: 'PARAMETER 3',
          target: 'Summary',
          value: 999,
          lineStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#fbbf24' },
                { offset: 1, color: '#fbbf24' }
              ]
            }
          }
        },
        {
          source: 'PARAMETER 4',
          target: 'Summary',
          value: 999,
          lineStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#fbbf24' },
                { offset: 1, color: '#f472b6' }
              ]
            }
          }
        },
        {
          source: 'PARAMETER 5',
          target: 'Summary',
          value: 999,
          lineStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#f472b6' },
                { offset: 1, color: '#f472b6' }
              ]
            }
          }
        }
      ],
      label: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 600
      },
      lineStyle: {
        curveness: 0.5
      }
    }
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}

// Donut 图表
function initDonutChart() {
  const chartDom = document.getElementById('donutChart');
  const myChart = echarts.init(chartDom);
  
  const data = [
    { value: 999, name: 'Parameter 1', itemStyle: { color: '#06ffa5' } },
    { value: 999, name: 'Parameter 2', itemStyle: { color: '#fbbf24' } },
    { value: 999, name: 'Parameter 3', itemStyle: { color: '#f472b6' } },
    { value: 999, name: 'Parameter 4', itemStyle: { color: '#3b82f6' } },
    { value: 999, name: 'Parameter 5', itemStyle: { color: '#a855f7' } },
    { value: 999, name: 'Parameter 6', itemStyle: { color: '#8b5cf6' } }
  ];
  
  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        name: 'Parameters',
        type: 'pie',
        radius: ['60%', '85%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
      {
        type: 'pie',
        radius: ['0%', '0%'],
        label: {
          show: true,
          position: 'center',
          formatter: function() {
            return '22,870';
          },
          fontSize: 32,
          fontWeight: 700,
          color: '#ffffff'
        },
        labelLine: {
          show: false
        },
        data: [{ value: 1 }],
        tooltip: {
          show: false
        }
      }
    ]
  };
  
  myChart.setOption(option);
  
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}


// 鼠标移动视差效果
document.addEventListener('mousemove', function(e) {
  const decoration = document.querySelector('.background-decoration');
  if (!decoration) return;
  
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  
  decoration.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
});

console.log('Dashboard initialized successfully!');

