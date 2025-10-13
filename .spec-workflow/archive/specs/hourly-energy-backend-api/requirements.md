# Requirements Document - Hourly Energy Backend API

## Introduction

本需求文档定义了日能耗统计后端 API 的功能需求，该 API 用于对接前端的 HourlyEnergy 页面。API 将提供指定日期（年-月-日）的24小时能耗数据，时间范围从当天 07:00 到次日 07:00，为前端提供各车间的小时级能耗统计数据。

### 核心价值
- 为企业管理者提供更细粒度的能耗监控能力
- 支持按天查询各车间的小时能耗数据
- 帮助识别能耗高峰时段，优化生产排班
- 与月度能耗统计形成互补，提供多时间维度的数据分析

## Alignment with Product Vision

本功能与现有的月度能耗统计系统保持一致的技术架构和设计模式：
- 采用相同的 Controller-Service-Mapper 三层架构
- 复用现有的数据库连接和查询工具类
- 保持统一的 API 响应格式（BaseResponse）
- 遵循相同的代码规范和日志记录标准

## Requirements

### Requirement 1: 日能耗数据查询接口

**User Story:** 作为一个前端应用，我需要通过 API 获取指定日期的24小时能耗数据，以便在日能耗统计页面展示各车间的小时级能耗情况

#### Acceptance Criteria

1. WHEN 前端发送 GET 请求到 `/hourly/statistics?year=2025&month=10&day=9` THEN 系统 SHALL 返回该日期从 07:00 到次日 07:00 的24小时能耗数据
2. IF 请求参数中年份、月份或日期缺失 THEN 系统 SHALL 返回 400 错误并提示"缺少必需参数"
3. IF 请求的日期无效（如 2月30日）THEN 系统 SHALL 返回 400 错误并提示"无效的日期"
4. WHEN 请求的日期没有任何能耗数据 THEN 系统 SHALL 返回成功响应，但数据为空列表或零值
5. WHEN API 调用成功 THEN 响应 SHALL 包含以下字段：
   - `workshopList`: 车间名称列表（动态获取，按名称排序）
   - `workshopHourlyData`: 各车间的24小时能耗数据（Map<String, List<Double>>）
   - `hourlyTotal`: 所有车间的每小时总能耗（List<Double>，24个元素）
   - `year`, `month`, `day`: 查询的日期参数

### Requirement 2: 时间范围处理

**User Story:** 作为系统，我需要正确处理跨天的时间范围查询，确保返回从当天 07:00 到次日 07:00 的24小时数据

#### Acceptance Criteria

1. WHEN 查询 2025-10-09 的数据 THEN Mapper层 SHALL 查询从 2025-10-09 07:00:00 到 2025-10-10 07:59:59 的数据（多查询1小时）
2. WHEN Service层处理数据 THEN 系统 SHALL 使用结束时间后最近的一条数据进行差值计算
3. WHEN 组织返回数据 THEN 小时数据 SHALL 按以下顺序排列：
   - 索引 0-16：当天 07:00-23:59（17个小时段）
   - 索引 17-23：次日 00:00-06:59（7个小时段）
4. IF 某个小时段没有数据 THEN 该小时段的值 SHALL 为 0.0

### Requirement 3: 车间数据聚合和小时电能计算

**User Story:** 作为系统，我需要从数据库中动态获取所有有数据的车间，并为每个车间计算24尊时的能耗数据

#### 小时电能计算逻辑（简化版）

**计算原理**：
1. Mapper层查询从当天07:00到次日08:00的原始数据（多查1小时用于边界计算）
2. Service层按车间分组，生成24个小时时间点（07:00-08:00, 08:00-09:00, ...）
3. 对每个小时：
   - 找小时开始时间后最近的记录作为开始值
   - 找小时结束时间后最近的记录作为结束值
   - **小时能耗 = 结束值 - 开始值**
4. 汇总所有车间的每小时能耗得到 hourlyTotal

**实现要求**：
- 直接复用现有的 `EnergyCalculationUtils.calculateHourlyEnergyFromRawData` 方法
- Service层保持简洁，主要负责调用工具类和数据组装

#### Acceptance Criteria

1. WHEN Mapper层执行查询 THEN SHALL 查询从当天07:00到次日08:00的原始数据
2. WHEN Service层处理 THEN SHALL 直接调用 EnergyCalculationUtils 工具类进行计算
3. WHEN 组装返回数据 THEN SHALL 按车间分组，生成24个小时的能耗数组
4. WHEN 计算 hourlyTotal THEN SHALL 对每个小时段所有车间进行求和
5. IF 某车间在某小时没有数据 THEN 该值 SHALL 为 0.0

### Requirement 4: 数据库查询优化

**User Story:** 作为系统管理员，我希望 API 查询性能高效，避免对数据库造成过大压力

#### Acceptance Criteria

1. WHEN 执行数据库查询 THEN 系统 SHALL 使用参数化查询避免 SQL 注入
2. WHEN 查询日期范围 THEN Mapper层 SHALL 查询从当天07:00到次日08:00的数据（多查1小时用于差值计算）
3. WHEN Mapper层返回数据 THEN Mapper SHALL 只负责数据查询，不进行任何聚合和计算
4. WHEN Service层处理数据 THEN Service SHALL 负责所有业务逻辑计算（包括分组、求和、差值计算等）
5. IF 查询时间超过 5 秒 THEN 系统 SHALL 记录慢查询日志

### Requirement 5: 错误处理和日志记录

**User Story:** 作为开发人员，我需要清晰的错误信息和日志记录，以便快速定位和解决问题

#### Acceptance Criteria

1. WHEN 参数验证失败 THEN 系统 SHALL 返回 400 错误码和具体的错误信息
2. WHEN 数据库查询失败 THEN 系统 SHALL 返回 500 错误码并记录详细的异常堆栈
3. WHEN API 接收到请求 THEN 系统 SHALL 记录 INFO 级别日志，包含年月日参数
4. WHEN API 返回成功 THEN 系统 SHALL 记录 INFO 级别日志，包含车间数量和数据概要
5. WHEN 发生异常 THEN 系统 SHALL 记录 ERROR 级别日志，包含完整的异常信息

### Requirement 6: 数据一致性和准确性

**User Story:** 作为业务用户，我需要确保小时能耗数据的准确性和一致性

#### Acceptance Criteria

1. WHEN 查询小时能耗数据 THEN 各车间的小时数据总和 SHALL 等于 hourlyTotal 对应小时的值（误差不超过 0.01）
2. WHEN 使用相同参数重复查询 THEN 系统 SHALL 返回相同的结果
3. WHEN 数据来源于多个表 THEN 系统 SHALL 确保数据的一致性和完整性
4. IF 发现数据异常（如负值能耗）THEN 系统 SHALL 记录警告日志

## Non-Functional Requirements

### Code Architecture and Modularity

- **单一职责原则**: 
  - Controller 层仅负责参数接收和响应返回
  - Service 层负责业务逻辑和数据聚合
  - Mapper 层负责数据库查询
  
- **模块化设计**: 
  - 复用现有的 `EnergyCalculationUtils` 工具类进行日期和时间计算
  - 参考 `MonthlyEnergyService` 的实现模式
  - 使用统一的 DTO 模型封装返回数据

- **依赖管理**: 
  - 最小化与其他模块的耦合
  - 通过接口而非具体实现进行依赖注入

- **清晰接口**: 
  - Controller 提供清晰的 RESTful API 接口
  - Service 接口定义明确的方法签名
  - DTO 类使用 Lombok 注解简化代码

### Performance

- API 响应时间应在 2 秒内（正常数据量）
- 支持并发查询，单节点至少支持 50 QPS
- 数据库查询应使用索引优化（基于时间戳字段）
- 考虑使用缓存机制缓存常查询的日期数据

### Security

- 所有 SQL 查询必须使用参数化查询，防止 SQL 注入
- API 接口应集成现有的权限验证机制
- 敏感参数（如有）应进行脱敏处理

### Reliability

- 系统应能处理数据库连接失败的情况，返回友好错误信息
- 异常情况下不应影响其他接口的正常运行
- 应有完善的错误处理机制，避免空指针异常

### Usability

- API 返回的错误信息应清晰易懂
- 日志记录应包含足够的上下文信息
- 代码应有充分的注释说明

### Compatibility

- 遵循现有系统的 API 规范和命名约定
- 与前端 HourlyEnergy 组件的数据结构完全兼容
- 保持与 MonthlyEnergy API 相似的接口设计风格

## Technical Context

### 现有系统架构参考
- **Controller**: `MonthlyEnergyController`
- **Service**: `MonthlyEnergyService` 和 `MonthlyEnergyServiceImpl`
- **DTO**: `MonthlyEnergyStatistics`
- **Mapper**: `MonthlyEnergyMapper`（MyBatis）

### 数据库表结构
- 使用与月度统计相同的数据表 (TempMonitor)
- 表中包含：车间名称 (name)、更新时间 (updateTime)、电能值 (electricEnergy) 等字段
- 支持按小时维度的数据聚合

### 前端数据格式需求
```typescript
{
  code: 0,
  data: {
    year: 2025,
    month: 10,
    day: 9,
    workshopList: ['1办公楼', '101铸科', ...],
    workshopHourlyData: {
      '1办公楼': [95.7, 105.2, ...], // 24个数值
      '101铸科': [42.6, 56.3, ...],
      ...
    },
    hourlyTotal: [878.6, 1113.8, ...] // 24个合计值
  }
}
```
