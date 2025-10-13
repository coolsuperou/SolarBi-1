# Tasks Document - Hourly Energy Backend API

## Task 1: 创建 DTO 数据模型

- [x] 1. 创建 HourlyEnergyStatistics DTO
  - **File**: `back2/src/main/java/com/yupi/springbootinit/model/dto/tempmonitor/HourlyEnergyStatistics.java`
  - **Description**: 创建日能耗统计数据传输对象，用于封装API返回数据
  - **Details**:
    - 定义字段：year, month, day, workshopList, workshopHourlyData, hourlyTotal
    - 使用 @Data 注解简化代码
    - 实现 Serializable 接口
  - **_Leverage**: 
    - `MonthlyEnergyStatistics.java` - 参考月度统计的 DTO 结构
    - Lombok @Data 注解
  - **_Requirements**: Requirement 1 (接口返回数据结构)
  - **_Prompt**: 
    ```
    Implement the task for spec hourly-energy-backend-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java Backend Developer specializing in DTO design and data modeling
    
    Task: Create HourlyEnergyStatistics DTO class in back2/src/main/java/com/yupi/springbootinit/model/dto/tempmonitor/HourlyEnergyStatistics.java following Requirement 1. This DTO should encapsulate the response data for the hourly energy API.
    
    Requirements:
    - Define fields: year (Integer), month (Integer), day (Integer)
    - workshopList (List<String>): sorted list of workshop names
    - workshopHourlyData (Map<String, List<Double>>): 24-hour energy data per workshop
    - hourlyTotal (List<Double>): total energy per hour (24 elements)
    - Use Lombok @Data annotation
    - Implement Serializable interface with serialVersionUID
    - Add comprehensive JavaDoc comments
    
    Leverage:
    - Reference MonthlyEnergyStatistics.java for structure and pattern
    - Use Lombok annotations to reduce boilerplate code
    
    Restrictions:
    - Do not add unnecessary fields
    - Keep the structure simple and aligned with frontend requirements
    - Follow existing project coding conventions
    
    Success Criteria:
    - DTO compiles without errors
    - All required fields are present with correct types
    - Proper Lombok annotations applied
    - JavaDoc is comprehensive and clear
    - Structure matches frontend HourlyEnergy component expectations
    
    After completing the task:
    1. Mark this task as in progress by changing [ ] to [-] in tasks.md
    2. Implement the code
    3. Verify compilation and structure
    4. Mark as completed by changing [-] to [x] in tasks.md
    ```

## Task 2: 创建 Service 接口和实现

- [x] 2.1 创建 HourlyEnergyService 接口
  - **File**: `back2/src/main/java/com/yupi/springbootinit/service/HourlyEnergyService.java`
  - **Description**: 定义日能耗统计服务接口
  - **Details**:
    - 定义方法：`getHourlyStatistics(Integer year, Integer month, Integer day)`
    - 返回类型：`HourlyEnergyStatistics`
    - 添加 JavaDoc 注释
  - **_Leverage**: 
    - `MonthlyEnergyService.java` - 参考接口定义模式
  - **_Requirements**: Requirement 1, 2, 3
  - **_Prompt**:
    ```
    Implement the task for spec hourly-energy-backend-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java Backend Developer specializing in service layer architecture
    
    Task: Create HourlyEnergyService interface in back2/src/main/java/com/yupi/springbootinit/service/HourlyEnergyService.java following Requirements 1-3. Define the service contract for hourly energy statistics.
    
    Requirements:
    - Define method: getHourlyStatistics(Integer year, Integer month, Integer day)
    - Return type: HourlyEnergyStatistics
    - Add comprehensive JavaDoc for interface and method
    - Follow service interface patterns
    
    Leverage:
    - Reference MonthlyEnergyService.java for interface pattern
    - Follow existing naming conventions
    
    Restrictions:
    - Keep interface simple with single method
    - Do not add implementation details
    - Follow interface naming conventions
    
    Success Criteria:
    - Interface compiles without errors
    - Method signature is correct
    - JavaDoc is comprehensive
    - Follows project service interface patterns
    
    After completing:
    1. Mark task 2.1 as in progress [-] in tasks.md
    2. Implement the code
    3. Mark as completed [x] in tasks.md
    ```

- [x] 2.2 实现 HourlyEnergyServiceImpl
  - **File**: `back2/src/main/java/com/yupi/springbootinit/service/impl/HourlyEnergyServiceImpl.java`
  - **Description**: 实现日能耗统计业务逻辑，保持代码简洁
  - **Details**:
    - 实现 HourlyEnergyService 接口
    - 注入必要的 Mapper（或创建统一查询方法）
    - 核心逻辑：
      1. 计算时间范围（当天07:00 到次日08:00）
      2. 查询所有车间原始数据
      3. 按车间分组
      4. 调用 EnergyCalculationUtils.calculateHourlyEnergyFromRawData 计算
      5. 组装 hourlyTotal
      6. 构建并返回 HourlyEnergyStatistics
    - 添加日志记录
    - 异常处理
  - **_Leverage**:
    - `MonthlyEnergyServiceImpl.java` - 参考实现模式
    - `EnergyCalculationUtils.calculateHourlyEnergyFromRawData` - 核心计算逻辑
    - 现有车间 Mapper 的 `selectHourlyRawData` 方法
  - **_Requirements**: Requirements 1-6 (所有需求)
  - **_Prompt**:
    ```
    Implement the task for spec hourly-energy-backend-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Senior Java Backend Developer with expertise in service implementation and energy calculation
    
    Task: Implement HourlyEnergyServiceImpl in back2/src/main/java/com/yupi/springbootinit/service/impl/HourlyEnergyServiceImpl.java following all Requirements 1-6. This is the core business logic that queries data and calculates hourly energy consumption.
    
    Core Implementation Steps:
    1. Calculate time range: from 07:00 of queried day to 08:00 of next day (extra 1 hour for boundary calculation)
    2. Query all workshops' raw data from database
    3. Group data by workshop name
    4. For each workshop, call EnergyCalculationUtils.calculateHourlyEnergyFromRawData to compute 24-hour energy data
    5. Calculate hourlyTotal by summing all workshops' energy for each hour
    6. Build and return HourlyEnergyStatistics object
    
    Leverage:
    - Reference MonthlyEnergyServiceImpl.java for implementation pattern
    - **MUST use EnergyCalculationUtils.calculateHourlyEnergyFromRawData** - do NOT reimplement calculation logic
    - Use existing Mapper's selectHourlyRawData method or create unified query
    - Follow existing logging patterns with @Slf4j
    
    Requirements:
    - Add @Service annotation
    - Add @Slf4j for logging
    - Inject necessary Mapper(s) with @Resource
    - Add @Transactional(readOnly = true) for database operations
    - Log INFO: request received with parameters
    - Log INFO: success with workshop count
    - Log ERROR: failures with full stack trace
    - Handle edge cases: no data, invalid date, etc.
    
    Restrictions:
    - Keep Service method concise (under 50 lines)
    - Do NOT reimplement energy calculation logic
    - Do NOT perform aggregation in Mapper layer
    - Do NOT add unnecessary methods
    - Service only handles: data query, calling utils, data assembly
    - Follow "代码要简洁简单，不需要太多的方法" principle
    
    Success Criteria:
    - Service implements interface correctly
    - Time range calculation is correct (07:00 to next day 08:00)
    - Successfully calls EnergyCalculationUtils for each workshop
    - hourlyTotal calculation is accurate
    - Proper logging at INFO/ERROR levels
    - Exception handling is robust
    - Code is clean and concise
    - Follows existing project patterns
    
    After completing:
    1. Mark task 2.2 as in progress [-]
    2. Implement the code
    3. Test with sample data
    4. Mark as completed [x]
    ```

## Task 3: 创建 Mapper 查询

- [x] 3. 创建 HourlyEnergyMapper (或复用现有 Mapper)
  - **File**: `back2/src/main/java/com/yupi/springbootinit/mapper/sqlserver/HourlyEnergyMapper.java` 和对应的 `back2/src/main/resources/mapper/sqlserver/HourlyEnergyMapper.xml`
  - **Description**: 创建数据访问层，查询所有车间的原始数据
  - **Details**:
    - 创建 Mapper 接口，定义 `selectAllWorkshopsHourlyData` 方法
    - 创建对应的 MyBatis XML 配置
    - 查询 TempMonitor 表，获取指定时间范围内所有车间的原始数据
    - 只查询，不聚合（聚合在 Service 层完成）
  - **_Leverage**:
    - `MonthlyEnergyMapper.java` 和对应的 XML - 参考查询模式
    - 现有的 TempMonitor 表结构
  - **_Requirements**: Requirement 4 (数据库查询优化)
  - **_Prompt**:
    ```
    Implement the task for spec hourly-energy-backend-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java Backend Developer specializing in MyBatis and database queries
    
    Task: Create HourlyEnergyMapper interface and XML configuration following Requirement 4. This Mapper queries all workshops' raw data from TempMonitor table.
    
    Files to create:
    1. back2/src/main/java/com/yupi/springbootinit/mapper/sqlserver/HourlyEnergyMapper.java
    2. back2/src/main/resources/mapper/sqlserver/HourlyEnergyMapper.xml
    
    Requirements:
    - Mapper Interface:
      - Add @Mapper annotation
      - Define method: List<TempMonitor> selectAllWorkshopsHourlyData(@Param("startTime") Date startTime, @Param("endTime") Date endTime)
      - Add JavaDoc comments
    
    - XML Configuration:
      - Query TempMonitor table
      - SELECT: name, updateTime, electricEnergy
      - WHERE: updateTime >= #{startTime} AND updateTime <= #{endTime}
      - ORDER BY: name, updateTime
      - Use parameterized query (防止 SQL 注入)
    
    Leverage:
    - Reference MonthlyEnergyMapper.java and its XML for pattern
    - Use existing TempMonitor resultType
    - Follow MyBatis query conventions
    
    Restrictions:
    - Mapper ONLY queries data, NO aggregation or calculation
    - Use parameterized queries for security
    - Do NOT add complex logic in SQL
    - Keep query simple and efficient
    
    Success Criteria:
    - Mapper interface compiles correctly
    - XML configuration is valid
    - Query returns correct data structure
    - Parameterized query prevents SQL injection
    - Follows existing Mapper patterns
    
    After completing:
    1. Mark task 3 as in progress [-]
    2. Create both files
    3. Verify XML configuration
    4. Mark as completed [x]
    ```

## Task 4: 创建 Controller API 接口

- [x] 4. 创建 HourlyEnergyController
  - **File**: `back2/src/main/java/com/yupi/springbootinit/controller/HourlyEnergyController.java`
  - **Description**: 创建 REST API 控制器，处理前端请求
  - **Details**:
    - 添加 @RestController 和 @RequestMapping("/hourly")
    - 定义 GET 接口 `/statistics`
    - 接收参数：year, month, day (使用 @RequestParam)
    - 参数验证（必需参数检查）
    - 调用 HourlyEnergyService
    - 返回 BaseResponse<HourlyEnergyStatistics>
    - 异常处理和日志记录
  - **_Leverage**:
    - `MonthlyEnergyController.java` - 参考 Controller 模式
    - `BaseResponse` - 统一响应格式
    - `ResultUtils` - 响应构建工具
  - **_Requirements**: Requirement 1, 5 (API 接口定义和错误处理)
  - **_Prompt**:
    ```
    Implement the task for spec hourly-energy-backend-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java Backend Developer specializing in RESTful API design and Spring Boot
    
    Task: Create HourlyEnergyController in back2/src/main/java/com/yupi/springbootinit/controller/HourlyEnergyController.java following Requirements 1 and 5. This controller handles frontend requests for hourly energy statistics.
    
    Requirements:
    - Add @RestController annotation
    - Add @RequestMapping("/hourly")
    - Add @Slf4j for logging
    - Inject HourlyEnergyService with @Resource
    
    - API Endpoint:
      - Path: /statistics
      - Method: GET
      - Parameters: @RequestParam Integer year, @RequestParam Integer month, @RequestParam Integer day
      - Return: BaseResponse<HourlyEnergyStatistics>
    
    - Implementation:
      - Validate parameters (not null, valid ranges)
      - Log INFO: "📊 接收日能耗统计请求: {}年{}月{}日"
      - Call service.getHourlyStatistics(year, month, day)
      - Log INFO: "✅ 日能耗统计完成: {}个车间"
      - Return ResultUtils.success(data) on success
      - Catch exceptions and return ResultUtils.error(500, message)
      - Log ERROR with full exception details
    
    Leverage:
    - Reference MonthlyEnergyController.java for exact pattern
    - Use BaseResponse and ResultUtils
    - Follow existing logging format
    
    Restrictions:
    - Controller ONLY handles: parameter receiving, validation, response returning
    - Do NOT add business logic in Controller
    - Keep method simple and clean
    - Follow RESTful conventions
    
    Success Criteria:
    - Controller compiles and runs correctly
    - API endpoint accessible at GET /hourly/statistics
    - Parameters validated properly
    - Returns correct BaseResponse format
    - Logging follows project standards
    - Exception handling is robust
    - Follows MonthlyEnergyController pattern exactly
    
    After completing:
    1. Mark task 4 as in progress [-]
    2. Implement the code
    3. Test with Postman or curl
    4. Mark as completed [x]
    ```

## Task 5: 集成测试和验证

- [ ] 5. 端到端测试和验证
  - **Description**: 测试完整功能并与前端对接
  - **Details**:
    - 启动后端服务
    - 使用 Postman 或 curl 测试 API
    - 验证返回数据格式
    - 测试边界情况（无数据、无效日期等）
    - 与前端 HourlyEnergy 组件对接
    - 验证数据展示的正确性
  - **_Requirements**: All requirements (所有需求)
  - **_Prompt**:
    ```
    Implement the task for spec hourly-energy-backend-api, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: QA Engineer and Integration Specialist
    
    Task: Perform comprehensive end-to-end testing and frontend integration for the hourly energy backend API covering all requirements.
    
    Testing Steps:
    1. Start backend service
    2. Test API with Postman/curl:
       - Valid date: GET /hourly/statistics?year=2025&month=10&day=9
       - Missing parameters
       - Invalid date (e.g., 2月30日)
       - Date with no data
    3. Verify response structure matches frontend expectations
    4. Check data accuracy:
       - 24 elements in each workshop's hourly data
       - hourlyTotal is sum of all workshops
       - Data order: 07:00-08:00 to next day 06:00-07:00
    5. Test frontend integration:
       - Ensure HourlyEnergy component can consume API
       - Verify data displays correctly in table
       - Check time labels show correctly
    6. Performance testing:
       - Response time < 2 seconds
       - Multiple concurrent requests
    
    Success Criteria:
    - All API endpoints return correct responses
    - Data structure matches frontend requirements
    - Edge cases handled properly
    - Frontend integration works smoothly
    - Performance meets requirements
    - No errors in logs
    
    After completing:
    1. Mark task 5 as in progress [-]
    2. Perform all tests
    3. Document any issues found
    4. Mark as completed [x]
    5. Update tasks.md to show all tasks completed
    ```

## Summary

本任务列表将设计分解为 5 个主要任务：

1. ✅ **DTO 模型** - 数据传输对象
2. ✅ **Service 层** - 业务逻辑（接口 + 实现）
3. ✅ **Mapper 层** - 数据访问
4. ✅ **Controller 层** - API 接口
5. ✅ **测试验证** - 端到端测试

每个任务都包含：
- 明确的文件路径
- 详细的实现要求
- 需要复用的组件
- Requirements 引用
- 完整的实现 Prompt（包含角色、任务、限制、成功标准）

**关键原则**：
- 复用 EnergyCalculationUtils 核心计算逻辑
- Service 层保持简洁
- Mapper 层只查询不计算
- 遵循现有项目模式
