# Tasks Document

## 任务概览

本次修改只涉及一个文件的一个方法，任务非常聚焦和明确。

## 任务列表

- [x] 1. 修改 generateHourlyPoints 方法
  - File: back2/src/main/java/com/yupi/springbootinit/utils/EnergyCalculationUtils.java
  - **整体计算逻辑说明**：
    - `calculateHourlyEnergyFromRawData` 方法首先调用 `generateHourlyPoints` 生成小时时间点列表
    - 然后对每个小时时间点进行循环，计算该小时的能耗
    - **每个小时的能耗计算公式**：该小时结束时间（hourEnd = hourStart + 1小时）之后最近的一条电表数据 **减去** 该小时开始时间（hourStart）之后最近的一条电表数据
    - 如果有多个设备，分别计算后累加
  - **本次修改内容**：修改 generateHourlyPoints 私有方法的循环终止条件
  - 将 endTime 截取到小时开始，然后用于循环比较
  - Purpose: 使生成的小时时间点列表不包含 endTime 所在的小时
  - _Leverage: 现有的 Calendar API 和时间处理逻辑_
  - _Requirements: 核心需求 - 修改小时时间点生成逻辑_
  - _Prompt: 
    ```
    Implement the task for spec hourly-energy-single-range, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java Backend Developer 专精于时间处理和工具类开发
    
    Task: 修改 EnergyCalculationUtils.java 中的 generateHourlyPoints 方法（约第 268-284 行），调整循环终止条件。具体修改：
    1. 在方法开始处，创建一个新的 Calendar 对象用于处理 endTime
    2. 将 endTime 截取到小时开始（设置 MINUTE=0, SECOND=0, MILLISECOND=0）
    3. 将截取后的时间赋值给一个新变量 endHour
    4. 修改 while 循环条件，从 `cal.getTime().before(endTime)` 改为 `cal.getTime().before(endHour)`
    
    参考设计文档中的"修改前后对比"部分的代码示例。
    
    Restrictions:
    - 只修改 generateHourlyPoints 方法，不修改其他方法
    - 不修改方法签名（参数和返回值类型）
    - 不修改其他任何代码
    - 保持代码风格与现有代码一致
    - 保持现有的注释和日志
    
    Success:
    - generateHourlyPoints 方法成功修改
    - 输入 8:00-11:59 返回 [8:00, 9:00, 10:00]（不包含 11:00）
    - 现有测试（如果有）仍然通过
    - 代码编译无错误
    
    Instructions:
    1. 首先运行 spec-workflow-guide 获取工作流指南
    2. 在 tasks.md 中将此任务标记为 in-progress: `- [-] 1. 修改 generateHourlyPoints 方法`
    3. 阅读 back2/src/main/java/com/yupi/springbootinit/utils/EnergyCalculationUtils.java 文件
    4. 定位到 generateHourlyPoints 方法（约第 268-284 行）
    5. 按照 Task 中的步骤进行修改
    6. 验证代码可以编译
    7. 在 tasks.md 中将此任务标记为 completed: `- [x] 1. 修改 generateHourlyPoints 方法`
    ```

- [x] 2. 验证修改效果
  - File: 手动测试或查看日志
  - 通过日志或测试验证时间点生成是否正确
  - Purpose: 确保修改符合预期
  - _Leverage: 现有的日志输出和测试方法_
  - _Requirements: 所有需求_
  - _Prompt:
    ```
    Implement the task for spec hourly-energy-single-range, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: QA Engineer 专精于后端测试和验证
    
    Task: 验证 generateHourlyPoints 方法的修改效果。可以通过以下方式之一：
    1. 查看现有日志输出：在 calculateHourlyEnergyFromRawData 方法中有 "生成小时时间点: 共{}个小时" 的日志
    2. 编写简单的单元测试（可选）
    3. 通过前端调用接口，传入 8:00-11:59，观察返回的记录数
    
    验证点：
    - 输入 8:00-11:59，应生成 3 个时间点（8:00, 9:00, 10:00），返回 3 条记录
    - 输入 8:00-9:59，应生成 1 个时间点（8:00），返回 1 条记录
    - 输入 8:00-8:59，应生成 0 个时间点，返回 0 条记录
    
    Restrictions:
    - 如果编写测试，不要破坏现有测试
    - 验证完成后可以删除临时测试代码
    
    Success:
    - 确认时间点生成逻辑符合新规则
    - 返回的记录数正确
    - 日志输出正确
    
    Instructions:
    1. 首先运行 spec-workflow-guide 获取工作流指南
    2. 在 tasks.md 中将此任务标记为 in-progress: `- [-] 2. 验证修改效果`
    3. 选择一种验证方式进行验证
    4. 记录验证结果
    5. 在 tasks.md 中将此任务标记为 completed: `- [x] 2. 验证修改效果`
    ```

## 任务依赖关系

```
Task 1 (修改代码) --> Task 2 (验证效果)
```

## 预估工作量

- Task 1: 5-10 分钟
- Task 2: 5-10 分钟
- 总计: 10-20 分钟

## 注意事项

1. 这是一个非常小的修改，只涉及一个方法
2. 修改前建议先备份或使用 Git 保存当前状态
3. 如果不确定修改是否正确，可以先在测试环境验证
4. 注意处理边界情况（如时间跨度小于1小时的情况）
