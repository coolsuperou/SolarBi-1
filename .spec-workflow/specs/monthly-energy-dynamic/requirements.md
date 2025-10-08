# Requirements Document

## Introduction

月度能耗动态查询功能旨在提供一个全面的能耗监控数据表，展示指定月份**所有有数据的车间**的每日能耗统计。与当前固定车间列表的方式不同，本功能将动态查询数据库中该月所有产生能耗数据的车间，并按照车间名称排序展示，确保数据的完整性和可扩展性。

用户可以通过选择年份和月份，查看该时间段内所有车间的逐日能耗数据、横向合计（每个车间的月度总能耗）、纵向合计（每日所有车间的总能耗）以及月度总能耗。

## Alignment with Product Vision

此功能支持能耗监控系统的核心目标：
- **数据完整性**：不遗漏任何产生能耗数据的车间
- **灵活性**：自动适应新增或变更的车间，无需修改代码
- **可视化**：通过横向日期展开的表格，直观展示月度能耗趋势
- **决策支持**：提供完整的车间级、日级、月级能耗数据，辅助管理决策

## Requirements

### Requirement 1: 动态车间查询

**User Story:** 作为能耗管理人员，我希望系统能够自动识别并展示该月所有有数据的车间，而不是预设的固定列表，以便我能看到完整的能耗数据。

#### Acceptance Criteria

1. WHEN 用户选择年月并查询 THEN 系统 SHALL 从数据库中查询该时间段内所有产生能耗数据的车间列表
2. WHEN 查询车间列表时 THEN 系统 SHALL 过滤掉车间名称为空或 NULL 的记录
3. WHEN 获取车间列表后 THEN 系统 SHALL 按车间名称进行排序（中文拼音或字母顺序）
4. IF 某个车间在该月没有任何能耗数据 THEN 系统 SHALL NOT 在结果中包含该车间
5. WHEN 新增车间产生数据时 THEN 系统 SHALL 自动在下次查询时包含该车间，无需修改代码

### Requirement 2: 月度能耗统计计算

**User Story:** 作为能耗管理人员，我希望系统按照统一的规则（每天7:00到次日6:59）计算每个车间的日能耗，以便准确分析能耗情况。

#### Acceptance Criteria

1. WHEN 计算日能耗时 THEN 系统 SHALL 使用 EnergyTimeConfig 配置的时间范围（7:00-次日6:59）
2. WHEN 计算某车间某日能耗时 THEN 系统 SHALL 调用 EnergyCalculationUtils.calculateDailyEnergyFromRawData() 方法
3. WHEN 某个车间某天无数据时 THEN 系统 SHALL 在该单元格显示 0 或 "-"
4. WHEN 查询的月份为2月时 THEN 系统 SHALL 根据年份正确识别28天或29天
5. WHEN 查询的月份为30天或31天时 THEN 系统 SHALL 相应调整表格列数

### Requirement 3: 数据展示格式

**User Story:** 作为能耗管理人员，我希望看到一个清晰的横向展开的表格，左侧是车间名称，右侧是每天的能耗数据，以便快速对比不同车间的能耗情况。

#### Acceptance Criteria

1. WHEN 页面加载时 THEN 系统 SHALL 显示表格，左侧固定列为车间名称，右侧为01日-31日
2. WHEN 用户横向滚动时 THEN 左侧车间名称列 SHALL 保持固定
3. WHEN 某日能耗超过2000 kWh时 THEN 系统 SHALL 以黄色高亮显示
4. WHEN 表格最后一行为合计行时 THEN 系统 SHALL 以绿色渐变背景显示
5. WHEN 鼠标悬停在数据单元格时 THEN 系统 SHALL 显示背景高亮效果

### Requirement 4: 汇总数据计算

**User Story:** 作为能耗管理人员，我希望看到每个车间的月度总能耗、每天所有车间的总能耗以及整个月的总能耗，以便进行全局分析。

#### Acceptance Criteria

1. WHEN 计算完所有车间的日能耗后 THEN 系统 SHALL 计算每个车间的月度总能耗（横向累加）
2. WHEN 计算完所有车间的日能耗后 THEN 系统 SHALL 计算每日所有车间的总能耗（纵向累加）
3. WHEN 计算完所有数据后 THEN 系统 SHALL 计算整个月的总能耗
4. WHEN 显示合计行时 THEN 系统 SHALL 在最后一行展示每日总能耗
5. IF 某个车间某天能耗为负数或异常 THEN 系统 SHALL 显示为 NULL 或 "-"，且不计入合计

### Requirement 5: 年月选择

**User Story:** 作为能耗管理人员，我希望能够灵活选择任意年份和月份，查看历史或当前的能耗数据。

#### Acceptance Criteria

1. WHEN 页面初始化时 THEN 系统 SHALL 默认显示当前年份的上一个月数据
2. WHEN 用户切换年份或月份时 THEN 系统 SHALL 自动重新查询并刷新表格数据
3. WHEN 查询数据时 THEN 系统 SHALL 显示加载状态（Spin）
4. IF 查询失败 THEN 系统 SHALL 显示友好的错误提示信息
5. WHEN 查询成功但无数据时 THEN 系统 SHALL 显示"该月暂无数据"提示

## Non-Functional Requirements

### Code Architecture and Modularity

- **Single Responsibility Principle**: 
  - Mapper 只负责数据查询
  - Service 只负责业务逻辑和数据转换
  - Controller 只负责接口暴露
  - 前端组件只负责数据展示和交互

- **Modular Design**: 
  - 后端使用新的 MonthlyStatisticsMapper 和 MonthlyStatisticsService
  - 前端使用独立的页面组件和样式文件
  - 共享 EnergyCalculationUtils 和 EnergyTimeConfig

- **Dependency Management**: 
  - 最小化对现有代码的修改
  - 复用现有的工具类和配置类

- **Clear Interfaces**: 
  - API 接口清晰定义输入输出格式
  - DTO 明确定义数据结构

### Performance

- 查询月度数据时应在 3 秒内返回结果
- 支持查询最多 50 个车间的数据
- 前端表格应支持流畅滚动，无卡顿
- 使用数据库索引优化查询性能（Workshop、UpdateTime 字段）

### Security

- API 接口需要用户登录认证
- 防止 SQL 注入（使用 MyBatis 参数化查询）
- 限制查询的时间范围（最多查询 3 年内的数据）

### Reliability

- 数据库连接失败时应有重试机制
- 计算能耗时应处理异常数据（负值、NULL）
- 前端网络请求失败时应显示友好提示

### Usability

- 表格应采用科技蓝主题，与系统整体风格一致
- 左侧车间列固定，方便横向滚动查看数据
- 超过 2000 kWh 的数据黄色高亮，便于识别异常
- 支持响应式设计，适配不同屏幕尺寸


