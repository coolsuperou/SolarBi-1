# Requirements Document

## Introduction

修改后端 Service 层的 `queryByCondition` 方法，使表格数据的查询逻辑与能耗计算保持一致。

**核心目标**：修改表格查询方法 `public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request)`，让其查询逻辑采用：**查找结束时间之后某个设备最近的时间点，作为实际结束时间，返回开始时间到实际结束时间之间的所有数据**。

这样可以确保前端表格显示的数据与能耗计算使用相同的时间边界，提供一致的用户体验。

## Alignment with Product Vision

该功能优化符合 SolarBi 能耗监控系统的核心目标：
- **数据一致性**：确保表格查询和能耗计算使用相同的时间边界
- **准确的能耗统计**：统一的时间范围保证数据准确性
- **可维护性**：统一的查询逻辑，便于维护

## Requirements

### 核心需求：修改表格查询时间范围逻辑

#### 当前实现

**方法签名**：
```java
public Page<TempMonitor> queryByCondition(TempMonitorQueryRequest request)
```

**当前逻辑**：
- 直接使用用户输入的 startTime 和 endTime
- 查询 `startTime <= UpdateTime <= endTime` 的所有记录
- 返回这些原始数据（分页）

**问题**：
- 查询的结束时间是用户输入的精确时间（如 11:59:00）
- 能耗计算使用的是 11:59:00 **之后**最近的记录
- 导致表格数据和能耗计算使用的时间边界不一致

#### 目标逻辑

**修改方式**：修改 Service 层的实现，动态调整实际查询的结束时间

**统一的查询规则**：
1. 用户输入：startTime 和 endTime
2. 将 endTime 截取到小时开始：例如 11:59:00 → 11:00:00
3. 对每个设备，查找截取后的时间之后最近的一条记录
4. 在所有设备的这些记录中，找时间**最晚**的一条，作为 actualEndTime
5. 查询：返回 `startTime <= UpdateTime <= actualEndTime` 的所有记录（分页）

#### 具体示例

**场景**：前端查询 `startTime = 2024-01-01 08:00:00`, `endTime = 2024-01-01 11:59:00`

**后端处理流程**：

1. **将结束时间截取到小时**：
   - 输入：`endTime = 2024-01-01 11:59:00`
   - 截取后：`endHour = 2024-01-01 11:00:00`

2. **对每个设备，查找 11:00:00 之后最近的一条数据**：
   ```sql
   -- 设备A
   SELECT MIN(UpdateTime) FROM RSWS_TempMonitor_Copy
   WHERE Name = '设备A' AND UpdateTime >= '2024-01-01 11:00:00'
   -- 结果：11:05:00
   
   -- 设备B
   SELECT MIN(UpdateTime) FROM RSWS_TempMonitor_Copy
   WHERE Name = '设备B' AND UpdateTime >= '2024-01-01 11:00:00'
   -- 结果：11:03:00
   
   -- 设备C
   SELECT MIN(UpdateTime) FROM RSWS_TempMonitor_Copy
   WHERE Name = '设备C' AND UpdateTime >= '2024-01-01 11:00:00'
   -- 结果：11:10:00
   ```

3. **在所有设备的这些记录中，找时间最晚的**：
   - 设备时间列表：[11:05:00, 11:03:00, 11:10:00]
   - 最晚时间：`actualEndTime = 2024-01-01 11:10:00`
   - **关键点**：不是找“任意一个设备”最近的时间，而是找“所有设备各自最近的时间”中的“最晚时间”，确保所有设备都有数据覆盖到这个时间点

4. **使用实际结束时间查询数据**：
   ```sql
   SELECT *
   FROM RSWS_TempMonitor_Copy
   WHERE Workshop = '114_2#楼办公区域'
     AND UpdateTime >= '2024-01-01 08:00:00'
     AND UpdateTime <= '2024-01-01 11:10:00'  -- 使用实际结束时间
   ORDER BY UpdateTime DESC
   LIMIT 10 OFFSET 0  -- 分页
   ```

5. **返回结果**（分页）：
   ```java
   Page<TempMonitor> {
     records: [
       {
         "name": "设备A",
         "updateTime": "2024-01-01 11:10:00",
         "electricEnergy": 1150.0,
         ...
       },
       {
         "name": "设备C",
         "updateTime": "2024-01-01 11:10:00",
         "electricEnergy": 1000.0,
         ...
       },
       {
         "name": "设备B",
         "updateTime": "2024-01-01 11:05:00",
         "electricEnergy": 1140.0,
         ...
       },
       ... // 更多原始记录
     ],
     total: 120,  // 08:00:00 到 11:10:00 的总记录数
     current: 1,
     size: 10
   }
   ```

**关键点**：
- 返回的是**所有原始数据记录**，不是计算后的数据
- 需要先将 endTime 截取到小时开始（与小时能耗计算保持一致）
- 结束时间为：所有设备各自在截取后时间之后最近记录中的**最晚时间**
- 确保所有设备都有数据覆盖到实际结束时间
- 表格显示的数据范围与能耗计算使用的时间边界一致

#### Acceptance Criteria

1. WHEN Service 层调用 queryByCondition 方法 THEN 系统 SHALL 将 endTime 截取到小时开始
2. WHEN 截取后 THEN 系统 SHALL 对每个设备查找截取后时间之后最近的记录时间
3. WHEN 查找完成 THEN 系统 SHALL 在所有设备的这些时间中找到最晚的时间作为 actualEndTime
4. WHEN 查询数据 THEN 系统 SHALL 返回 startTime 到 actualEndTime 之间的所有原始记录（分页）
5. IF 某个设备找不到截取后时间之后的记录 THEN 系统 SHALL 跳过该设备（只使用有记录的设备）
6. WHEN 返回分页数据 THEN 系统 SHALL 保持分页功能正常工作

### 实现方案

**采用方案**：在 utils 中添加工具类方法 + ServiceImpl 调用

#### 步骤1：新建工具类 TableQueryFilterUtils

在 `back2/src/main/java/com/yupi/springbootinit/utils/` 目录下新建 `TableQueryFilterUtils` 类

添加方法：
```java
public static Date calculateActualEndTime(List<TempMonitor> rawData, Date endTime)
```

**方法功能**：
1. 将 endTime 截取到小时开始
2. 对每个设备，查找截取后时间之后最近的记录时间
3. 返回所有设备中最晚的时间作为 actualEndTime

#### 步骤2：ServiceImpl 中调用工具方法

在 `queryByCondition` 方法中：
1. 先调用原有的 Mapper 查询（获取较大范围的数据）
2. 调用 utils 工具方法计算 actualEndTime
3. 使用 actualEndTime 过滤数据
4. 返回过滤后的分页结果

**优点**：
- Service 接口不变
- 逻辑封装在 utils 中，可复用
- ServiceImpl 只负责调用和组合

### 非功能需求

#### Code Architecture and Modularity
- **新建工具类**：创建新的工具类 `TableQueryFilterUtils`，包含 `calculateActualEndTime` 方法
- **Service 接口不变**：不修改 Service 接口定义
- **只修改 ServiceImpl**：在各车间的 ServiceImpl 的 `queryByCondition` 方法中调用 utils 工具方法
- **工具方法可复用**：utils 中的方法可以被所有车间的 ServiceImpl 调用
- **保持接口兼容**：返回类型保持 `Page<TempMonitor>`

#### Performance
- 增加一次额外的时间点查询，性能影响较小
- 实际结束时间查询应该很快（只查最小值）

#### Reliability
- 处理边界情况：endTime 之后没有记录的情况
- 保持详细的日志记录

#### Usability
- 前端无需修改
- 表格数据时间范围更准确
