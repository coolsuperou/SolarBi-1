# Tasks Document

## 实现目标

修改后端 Service 层的 `queryByCondition` 方法，使表格数据的查询逻辑与能耗计算保持一致。通过创建工具类 `TableQueryFilterUtils` 来计算动态的实际结束时间，确保前端表格显示的数据与能耗计算使用相同的时间边界。

---

## 任务列表

### Phase 1: 创建工具类基础

- [ ] 1. 创建 TableQueryFilterUtils 工具类
  - **文件**: `back2/src/main/java/com/yupi/springbootinit/utils/TableQueryFilterUtils.java`
  - **任务**: 
    - 创建新的工具类文件
    - 添加类注释和必要的 import
    - 定义类结构和常量
  - **目的**: 提供表格查询的时间过滤和计算工具方法
  - **_Leverage**: `EnergyCalculationUtils.java` (参考现有工具类结构和代码风格)
  - **_Requirements**: 核心需求 - 实现方案步骤1
  - **_Prompt**: 
    ```
    Role: Java Backend Developer specializing in utility class design
    Task: Create a new utility class TableQueryFilterUtils in back2/src/main/java/com/yupi/springbootinit/utils/
    following the implementation plan in requirements, reference the structure and coding style from EnergyCalculationUtils.java
    Requirements:
      - Create class with proper package declaration
      - Add comprehensive class-level JavaDoc explaining the purpose
      - Add necessary imports (java.util.*, java.util.Date, Calendar)
      - Define class structure with static methods
      - Add logger if needed
    Leverage: EnergyCalculationUtils.java for coding patterns
    Restrictions: Keep it simple and focused, do not add unnecessary dependencies
    Success: Class file created with proper structure, compiles without errors, follows project coding standards
    ```

---

### Phase 2: 实现时间计算逻辑

- [ ] 2. 实现 truncateToHour 辅助方法
  - **文件**: `back2/src/main/java/com/yupi/springbootinit/utils/TableQueryFilterUtils.java`
  - **任务**: 
    - 实现私有静态方法 `truncateToHour(Date time)`
    - 将输入时间截取到小时开始（例如 11:59:00 → 11:00:00）
    - 添加方法级 JavaDoc
  - **目的**: 提供时间截取功能，用于统一时间边界
  - **_Leverage**: Java Calendar API
  - **_Requirements**: 核心需求 - 目标逻辑步骤1
  - **_Prompt**:
    ```
    Role: Java Developer with expertise in date/time manipulation
    Task: Implement truncateToHour method in TableQueryFilterUtils that truncates a Date to the start of its hour
    Requirements:
      - Method signature: private static Date truncateToHour(Date time)
      - Use Calendar API to set minutes, seconds, and milliseconds to 0
      - Example: 11:59:59 → 11:00:00
      - Add JavaDoc with @param and @return tags
      - Handle null input gracefully
    Leverage: Java Calendar API (Calendar.getInstance(), set())
    Restrictions: Keep it simple, do not use external libraries
    Success: Method works correctly for all test cases, properly documented
    ```

- [ ] 3. 实现 calculateActualEndTime 主方法
  - **文件**: `back2/src/main/java/com/yupi/springbootinit/utils/TableQueryFilterUtils.java`
  - **任务**: 
    - 实现公共静态方法 `calculateActualEndTime(List<TempMonitor> rawData, Date endTime)`
    - 按设备名称分组数据
    - 对每个设备查找截取后时间之后最近的记录
    - 返回所有设备中最晚的时间
    - 添加详细的 JavaDoc 和注释
  - **目的**: 计算动态的实际结束时间，确保所有设备都有数据覆盖
  - **_Leverage**: `truncateToHour` 方法, Java Stream API, TempMonitor 实体类
  - **_Requirements**: 核心需求 - 目标逻辑步骤2-4, Acceptance Criteria 1-5
  - **_Prompt**:
    ```
    Role: Java Backend Developer with expertise in data processing and stream operations
    Task: Implement calculateActualEndTime method in TableQueryFilterUtils following the requirements
    Requirements:
      - Method signature: public static Date calculateActualEndTime(List<TempMonitor> rawData, Date endTime)
      - Algorithm:
        1. Call truncateToHour(endTime) to get endHour
        2. Group rawData by device name (using Stream.collect(Collectors.groupingBy()))
        3. For each device, find the earliest UpdateTime >= endHour
        4. Collect all these times into a list
        5. Return the maximum (latest) time from the list
        6. If no records found after endHour, return original endTime
      - Handle edge cases: null/empty input, no data after endHour
      - Add comprehensive JavaDoc with @param, @return, and algorithm explanation
      - Add inline comments for key steps
    Leverage: Java Stream API, Collections, truncateToHour method, TempMonitor.getUpdateTime()
    Restrictions: Keep logic clear and maintainable, do not over-optimize prematurely
    Success: Method correctly calculates actual end time for all scenarios, well-documented, handles all edge cases
    ```

---

### Phase 3: 修改 Service 实现

- [ ] 4. 修改 OfficeArea114ServiceImpl.queryByCondition 方法
  - **文件**: `back2/src/main/java/com/yupi/springbootinit/service/impl/OfficeArea114ServiceImpl.java`
  - **任务**: 
    - 在 queryByCondition 方法中集成 TableQueryFilterUtils
    - 实现扩大查询范围逻辑（expandEndTime）
    - 调用 calculateActualEndTime 计算实际结束时间
    - 过滤数据到 actualEndTime
    - 重新构建分页结果
  - **目的**: 在实际 Service 中应用新的查询逻辑
  - **_Leverage**: `TableQueryFilterUtils.calculateActualEndTime`, 现有的 Mapper 查询方法, MyBatis-Plus Page
  - **_Requirements**: 核心需求 - 实现方案步骤2, Acceptance Criteria 6
  - **_Prompt**:
    ```
    Role: Java Backend Developer with expertise in Spring service layer and MyBatis-Plus
    Task: Modify queryByCondition method in OfficeArea114ServiceImpl to use TableQueryFilterUtils
    Requirements:
      - Locate existing queryByCondition method
      - Add expandEndTime helper method (expand by 2 hours)
      - Modify query flow:
        1. Expand endTime for initial query
        2. Call Mapper with expanded time range
        3. Call TableQueryFilterUtils.calculateActualEndTime(rawPage.getRecords(), request.getEndTime())
        4. Filter records where UpdateTime <= actualEndTime
        5. Build new Page result with filtered records
      - Maintain existing pagination parameters
      - Add import for TableQueryFilterUtils
      - Keep existing error handling
    Leverage: TableQueryFilterUtils, existing Mapper method, MyBatis-Plus Page API, Java Stream filter
    Restrictions: Do not change Service interface, maintain backward compatibility, preserve existing functionality
    Success: Method works correctly with new logic, pagination still functions, all existing tests pass
    ```

---

### Phase 4: 测试和验证

- [ ] 5. 创建 TableQueryFilterUtils 单元测试
  - **文件**: `back2/src/test/java/com/yupi/springbootinit/utils/TableQueryFilterUtilsTest.java`
  - **任务**: 
    - 创建 JUnit 测试类
    - 测试 truncateToHour 方法的各种场景
    - 测试 calculateActualEndTime 的正常和边界情况
    - 使用 mock 数据进行测试
  - **目的**: 确保工具类方法的正确性和可靠性
  - **_Leverage**: JUnit 5, 现有测试工具和模式
  - **_Requirements**: 非功能需求 - Reliability, Design 文档 - Testing Strategy
  - **_Prompt**:
    ```
    Role: QA Engineer with expertise in Java unit testing and JUnit
    Task: Create comprehensive unit tests for TableQueryFilterUtils
    Requirements:
      - Create test class with @SpringBootTest or simple JUnit setup
      - Test truncateToHour:
        * Normal case: 11:59:59 → 11:00:00
        * Edge case: already at hour start
        * Null input handling
      - Test calculateActualEndTime:
        * Normal case: multiple devices, return latest time
        * Single device case
        * No data after endHour case (return original endTime)
        * Empty/null input cases
      - Use proper assertions (assertEquals, assertNotNull, etc.)
      - Add test data builders or fixtures
    Leverage: JUnit 5 annotations, existing test patterns in the project
    Restrictions: Tests must be isolated, fast, and reliable
    Success: All tests pass, good coverage (>80%), edge cases covered
    ```

- [ ] 6. 创建 Service 集成测试
  - **文件**: `back2/src/test/java/com/yupi/springbootinit/service/impl/OfficeArea114ServiceImplTest.java`
  - **任务**: 
    - 创建或修改现有的 Service 测试类
    - 测试 queryByCondition 的完整流程
    - 验证实际结束时间的计算正确性
    - 验证分页功能正常工作
  - **目的**: 确保 Service 层集成正确，端到端功能正常
  - **_Leverage**: Spring Test, 现有的测试数据和 mock 配置
  - **_Requirements**: Design 文档 - Testing Strategy (Integration Testing)
  - **_Prompt**:
    ```
    Role: Integration Test Engineer with expertise in Spring Boot testing
    Task: Create or enhance integration tests for OfficeArea114ServiceImpl.queryByCondition
    Requirements:
      - Use @SpringBootTest or mock-based testing
      - Test complete query flow:
        * Call queryByCondition with test request
        * Verify returned data time range is correct
        * Verify actualEndTime is calculated based on device data
        * Verify pagination works correctly
      - Mock Mapper layer if needed
      - Use test database or in-memory data
      - Add assertions for:
        * Record count
        * Time boundary correctness
        * Data consistency
    Leverage: Spring Test framework, existing test configuration, mock utilities
    Restrictions: Tests should be repeatable and isolated, do not depend on external state
    Success: Integration tests pass reliably, verify end-to-end functionality, provide good confidence
    ```

---

### Phase 5: 推广应用

- [ ] 7. 应用到其他车间的 ServiceImpl
  - **文件**: 所有其他车间的 ServiceImpl 类（如 `AirConditioningServiceImpl.java`, `CanteenServiceImpl.java` 等）
  - **任务**: 
    - 识别所有需要修改的 ServiceImpl 类
    - 将 OfficeArea114ServiceImpl 的修改模式应用到其他类
    - 确保每个类都正确集成 TableQueryFilterUtils
    - 验证每个修改的类编译通过
  - **目的**: 统一所有车间的表格查询逻辑
  - **_Leverage**: 已完成的 OfficeArea114ServiceImpl 作为参考模板
  - **_Requirements**: Design 文档 - Implementation Checklist 最后一项
  - **_Prompt**:
    ```
    Role: Java Backend Developer with expertise in code refactoring and pattern application
    Task: Apply the queryByCondition modification pattern to all workshop ServiceImpl classes
    Requirements:
      - List all ServiceImpl files that have queryByCondition method
      - For each file:
        * Add import for TableQueryFilterUtils
        * Add expandEndTime helper method
        * Modify queryByCondition following the same pattern as OfficeArea114ServiceImpl
        * Adjust workshop-specific field names if needed
      - Verify compilation for each modified file
      - Ensure consistent implementation across all classes
    Leverage: Completed OfficeArea114ServiceImpl as reference template
    Restrictions: Maintain consistency across all implementations, do not introduce variations
    Success: All ServiceImpl classes successfully modified, all compile without errors, consistent pattern applied
    ```

---

## 完成标准

### 代码质量
- ✅ 所有代码编译通过，无错误
- ✅ 遵循项目现有的代码规范和风格
- ✅ 添加了完整的 JavaDoc 和必要的注释
- ✅ 代码简洁易懂，逻辑清晰

### 功能完整性
- ✅ TableQueryFilterUtils 正确实现时间计算逻辑
- ✅ Service 层成功集成工具类
- ✅ 所有车间的 ServiceImpl 都应用了统一的查询逻辑
- ✅ 表格查询和能耗计算使用相同的时间边界

### 测试覆盖
- ✅ 单元测试覆盖工具类的所有方法和边界情况
- ✅ 集成测试验证 Service 层的完整流程
- ✅ 所有测试通过，代码覆盖率 ≥ 80%

### 文档和沟通
- ✅ 代码注释清晰，易于理解和维护
- ✅ 测试用例文档化，便于回归测试
- ✅ 如有必要，更新相关的技术文档

---

## 依赖关系

```
Task 1 (创建工具类)
  ↓
Task 2 (实现 truncateToHour)
  ↓
Task 3 (实现 calculateActualEndTime) ← 依赖 Task 2
  ↓
Task 4 (修改示例 ServiceImpl) ← 依赖 Task 3
  ↓
Task 5 (单元测试) ← 依赖 Task 2, 3
  ↓
Task 6 (集成测试) ← 依赖 Task 4
  ↓
Task 7 (推广到其他 ServiceImpl) ← 依赖 Task 4, 6
```

---

## 估计时间

- **Task 1**: 30 分钟
- **Task 2**: 30 分钟
- **Task 3**: 1 小时
- **Task 4**: 1 小时
- **Task 5**: 1.5 小时
- **Task 6**: 1.5 小时
- **Task 7**: 2-3 小时（取决于车间数量）

**总计**: 约 8-9 小时

---

## 风险和注意事项

1. **性能风险**: 扩大查询范围可能返回更多数据，注意监控查询性能
2. **边界情况**: 确保处理所有设备都没有数据的情况
3. **分页一致性**: 修改后的过滤逻辑可能影响分页总数，需要验证
4. **回滚计划**: 如果出现问题，可以快速恢复到原始查询逻辑
