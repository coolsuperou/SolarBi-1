// 电费分摊计算配置
export const ELECTRICITY_COST_CONFIG = {
  // 计算模式
  CALCULATION_MODES: {
    MODE1: 'mode1', // 仅1-24日数据
    MODE2: 'mode2', // 仅25-月末数据
    MODE3: 'mode3', // 两期数据都有
  },

  // 模式描述
  MODE_DESCRIPTIONS: {
    mode1: '模式一：仅1-24日数据（24日金额 ÷ 24日前电量）',
    mode2: '模式二：仅25-月末数据（25-月末金额 ÷ 25-月末电量）',
    mode3: '模式三：两期数据都有（总金额 ÷ 全月总电量）',
  },

  // 模式名称
  MODE_NAMES: {
    mode1: '模式一',
    mode2: '模式二',
    mode3: '模式三',
  },

  // 部门数据（示例数据，实际应从后端获取）
  DEPARTMENT_DATA: [
    // 工具制造中心
    { dept1: '工具制造中心', dept2: '101配料', energy: 13923.8, cost: 10369.8 },
    { dept1: '工具制造中心', dept2: '102造粒', energy: 11713.0, cost: 8723.3 },
    { dept1: '工具制造中心', dept2: '103冷压', energy: 49716.2, cost: 37026.4 },
    { dept1: '工具制造中心', dept2: '104还原', energy: 14087.3, cost: 10491.6 },
    { dept1: '工具制造中心', dept2: '105烧结', energy: 237918.1, cost: 177190.9 },
    { dept1: '工具制造中心', dept2: '106清洗', energy: 28323.4, cost: 21094.0 },
    { dept1: '工具制造中心', dept2: '107串珠', energy: 3923.4, cost: 2922.0 },
    { dept1: '工具制造中心', dept2: '109炼胶', energy: 5440.1, cost: 4051.5 },
    { dept1: '工具制造中心', dept2: '110注射', energy: 159697.0, cost: 118935.3 },
    { dept1: '工具制造中心', dept2: '111开刃', energy: 30593.3, cost: 22784.5 },
    { dept1: '工具制造中心', dept2: '112终检', energy: 412.5, cost: 307.2 },
    { dept1: '工具制造中心', dept2: '113包装', energy: 614.8, cost: 457.9 },
    { dept1: '工具制造中心', dept2: '114公共', energy: 75215.7, cost: 56017.3 },
    // 管理部
    { dept1: '管理部', dept2: '食堂', energy: 16864.0, cost: 12559.6 },
    { dept1: '管理部', dept2: '1#办公楼', energy: 29206.5, cost: 21751.7 },
    { dept1: '管理部', dept2: '宿舍楼', energy: 23523.7, cost: 17519.4 },
    { dept1: '管理部', dept2: '其他', energy: 3330.4, cost: 2480.3 },
    // 工具研发中心
    { dept1: '工具研发中心', dept2: '工具研发中心', energy: 973.5, cost: 725.02 },
  ],

  // 图表颜色配置
  CHART_COLORS: {
    // 一级部门颜色
    DEPT1: {
      工具制造中心: '#00d4ff',
      管理部: '#00e676',
      工具研发中心: '#ffc107',
    },
    // 二级部门颜色（多彩配色）
    DEPT2: [
      '#00d4ff', '#ff6b6b', '#4ecdc4', '#ffd93d', '#a29bfe',
      '#fd79a8', '#74b9ff', '#fab1a0', '#55efc4', '#fdcb6e',
      '#e17055', '#00b894', '#6c5ce7', '#00e676', '#ff9ff3',
      '#feca57', '#48dbfb', '#ff9800',
    ],
  },
};
