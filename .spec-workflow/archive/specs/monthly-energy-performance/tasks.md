# 任务清单 - 月度能耗统计Service层性能优化

## 任务1：创建WorkshopResult内部类

**状态**: [ ] 待完成

**描述**: 在MonthlyEnergyServiceImpl中创建内部类，封装单个车间的计算结果

**文件**:
- `back2/src/main/java/com/yupi/springbootinit/service/impl/MonthlyEnergyServiceImpl.java`

**实现细节**:
- 在类末尾添加 `private static class WorkshopResult`
- 包含字段：
  - `List<Double> dailyData` - 每日能耗数组
  - `double monthlyTotal` - 月度总能耗
- 实现静态工厂方法：
  - `static WorkshopResult empty(int daysInMonth)` - 创建空结果
  - `static WorkshopResult fromDailyConsumptions(List<DailyEnergyConsumption> consumptions, int daysInMonth)` - 从计算结果转换

**依赖**: 无

**验收标准**:
- WorkshopResult类编译通过
- 工厂方法正常工作
- 代码有清晰注释

---

## 任务2：提取车间计算方法

**状态**: [ ] 待完成

**描述**: 将单个车间的能耗计算逻辑提取为独立的private方法

**文件**:
- `back2/src/main/java/com/yupi/springbootinit/service/impl/MonthlyEnergyServiceImpl.java`

**实现细节**:
- 创建方法：`private WorkshopResult calculateWorkshopEnergy(String workshop, List<TempMonitor> workshopData, Date monthStart, Date monthEnd, int daysInMonth)`
- 包含原有的车间能耗计算逻辑
- 处理空数据情况：直接返回 `WorkshopResult.empty()`
- 调用 `EnergyCalculationUtils.calculateDailyEnergyFromRawData()`
- 使用 `WorkshopResult.fromDailyConsumptions()` 转换结果
- 添加日志记录单个车间的计算耗时

**依赖**: 任务1

**验收标准**:
- 方法提取成功
- 原有逻辑保持不变
- 编译无错误

---

## 任务3：实现并行Stream计算

**状态**: [ ] 待完成

**描述**: 修改主方法，使用并行Stream替代for循环

**文件**:
- `back2/src/main/java/com/yupi/springbootinit/service/impl/MonthlyEnergyServiceImpl.java`

**实现细节**:
- 在 `getMonthlyStatistics()` 方法中：
  - 删除原有的for循环
  - 使用 `workshops.parallelStream()`
  - 使用 `Collectors.toConcurrentMap()` 收集结果
  - 将结果转换为最终的DTO格式
- 注意线程安全：
  - dailyTotal数组使用同步方法累加
  - 或使用AtomicDoubleArray
- 添加并行计算的性能日志

**依赖**: 任务2

**验收标准**:
- 并行计算正常工作
- 结果与串行版本一致
- 无线程安全问题
- 性能提升30%以上

---

## 任务4：优化dailyTotal累加逻辑

**状态**: [ ] 待完成

**描述**: 解决并行计算时dailyTotal数组的线程安全问题

**文件**:
- `back2/src/main/java/com/yupi/springbootinit/service/impl/MonthlyEnergyServiceImpl.java`

**实现细节**:
方案A（推荐）：先并行计算，后串行累加
```java
// 1. 并行计算每个车间
Map<String, WorkshopResult> results = workshops.parallelStream()...

// 2. 串行累加dailyTotal
List<Double> dailyTotal = new ArrayList<>(Collections.nCopies(daysInMonth, 0.0));
for (WorkshopResult result : results.values()) {
    for (int i = 0; i < daysInMonth; i++) {
        dailyTotal.set(i, dailyTotal.get(i) + result.dailyData.get(i));
    }
}
```

方案B：使用线程安全的累加器
```java
AtomicDoubleArray dailyTotal = new AtomicDoubleArray(daysInMonth);
// 在并行流中安全累加
```

**依赖**: 任务3

**验收标准**:
- 无并发问题
- 累加结果正确
- 性能不降低

---

## 任务5：添加性能监控日志

**状态**: [ ] 待完成

**描述**: 在关键路径添加耗时统计日志

**文件**:
- `back2/src/main/java/com/yupi/springbootinit/service/impl/MonthlyEnergyServiceImpl.java`

**实现细节**:
- 方法开始记录startTime
- 关键节点记录中间时间：
  - 数据库查询完成
  - 数据分组完成
  - 并行计算完成
  - 结果组装完成
- 使用INFO级别记录正常耗时
- 如果某环节超过阈值（如1秒），使用WARN级别记录
- 最终输出总耗时和各阶段占比

**依赖**: 任务3, 任务4

**验收标准**:
- 日志输出清晰易读
- 包含所有关键性能指标
- 便于性能分析和调优

---

## 任务6：性能测试和验证

**状态**: [ ] 待完成

**描述**: 测试优化后的性能并验证结果正确性

**实现细节**:
- 使用Postman/JMeter测试API性能
- 对比优化前后的响应时间
- 验证计算结果准确性
- 测试不同数据量场景：
  - 小数据量（<1000条）
  - 中等数据量（1000-10000条）
  - 大数据量（>10000条）
- 检查日志输出

**依赖**: 任务5

**验收标准**:
- 性能提升达到30%以上
- 所有计算结果正确
- 无功能回归问题
- 日志信息完整

---

## 总结

**总任务数**: 6个
**预估时间**: 2-3小时
**核心优化**: 并行Stream计算

**关键路径**:
1. 任务1（创建WorkshopResult）
2. 任务2（提取计算方法）
3. 任务3（并行Stream）
4. 任务4（线程安全）
5. 任务5（性能日志）
6. 任务6（测试验证）





