# 电费分摊计算系统

## 📋 功能说明

电费分摊计算系统用于根据供电局数据和各部门电量，计算各部门应分摊的电费金额。

## 🎯 主要功能

1. **年月选择**：选择要查询的年份和月份
2. **计算模式**：
   - 模式一：仅1-24日数据（24日金额 ÷ 24日前电量）
   - 模式二：仅25-月末数据（25-月末金额 ÷ 25-月末电量）
   - 模式三：两期数据都有（总金额 ÷ 全月总电量）
3. **信息展示**：
   - 1-24日供电局数据（抄表数、金额、单价）
   - 25-月末供电局数据（抄表数、金额、单价）
   - 天石源内部电量和内部平均单价
4. **数据表格**：显示各部门的电量和分摊金额
5. **图表展示**：
   - 一级部门电费分布饼图
   - 二级部门电费分布饼图
6. **导出功能**：导出Excel格式的电费分摊表

## 📁 文件结构

```
ElectricityCostAllocation/
├── index.tsx       # 主页面组件
├── config.ts       # 配置文件（计算模式、部门数据、图表颜色等）
├── styles.css      # 样式文件
└── README.md       # 说明文档
```

## 🔧 配置说明

### config.ts

- `CALCULATION_MODES`: 计算模式枚举
- `MODE_DESCRIPTIONS`: 模式描述
- `MODE_NAMES`: 模式名称
- `DEPARTMENT_DATA`: 部门数据（示例数据，实际应从后端获取）
- `CHART_COLORS`: 图表颜色配置

## 🚀 使用方式

1. 选择年份和月份
2. 选择计算模式
3. 查看供电局数据和天石源内部数据
4. 点击"计算电费"按钮进行计算
5. 查看数据表格和图表
6. 点击"导出Excel"按钮导出数据

## 🔗 后端接口（待实现）

需要实现以下后端接口：

1. **获取供电局数据**
   - 接口：`GET /api/power-supply-data`
   - 参数：`year`, `month`
   - 返回：供电局抄表数据和金额

2. **获取部门电量数据**
   - 接口：`GET /api/department-energy`
   - 参数：`year`, `month`
   - 返回：各部门的电量数据

3. **计算电费分摊**
   - 接口：`POST /api/calculate-electricity-cost`
   - 参数：`year`, `month`, `calculationMode`
   - 返回：各部门的分摊金额

4. **导出Excel**
   - 接口：`GET /api/export-electricity-cost`
   - 参数：`year`, `month`, `calculationMode`
   - 返回：Excel文件

## 📊 数据库表

已创建供电局数据表：`tbl_power_supply_data`

字段说明：
- `year`: 年份
- `month`: 月份
- `reading_1_to_24`: 1-24日供电局抄表数
- `amount_1_to_24`: 1-24日供电局金额
- `unit_price_1_to_24`: 1-24日供电局单价
- `reading_25_to_end`: 25-月末供电局抄表数
- `amount_25_to_end`: 25-月末供电局金额
- `unit_price_25_to_end`: 25-月末供电局单价
- `update_time`: 更新时间（触发器自动更新）
- `update_by`: 更新人

## 🎨 样式特点

- 科技蓝色主题，与其他页面保持一致
- 响应式设计，支持不同屏幕尺寸
- 固定前两列（一级部门、二级部门），方便查看
- 悬停效果和动画效果
- 自定义滚动条样式

## 📝 注意事项

1. 当前使用的是示例数据，实际使用时需要对接后端API
2. 权限控制：需要在用户管理中为用户分配 `electricity-cost-allocation` 权限
3. 图表使用 ECharts 库，已在项目中引入
4. 导出Excel功能当前仅显示提示，需要实现真实的导出逻辑

## 🔐 权限配置

路由权限：`canAccessElectricityCostAllocation`

在用户管理中为用户分配权限时，权限键为：`electricity-cost-allocation`
