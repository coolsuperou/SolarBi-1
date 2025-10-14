# Requirements Document

## Introduction

本规范旨在在月度能耗统计和日能耗统计的Service层和Mapper层实现基于用户pagePermissions字段的车间数据过滤功能。通过在Mapper层传入用户授权的车间列表，直接在SQL查询时过滤数据，提高查询效率并确保数据安全。

改动范围：
- **Service层**: `MonthlyEnergyServiceImpl`、`HourlyEnergyServiceImpl`
- **Mapper层**: `MonthlyEnergyMapper.java`、`HourlyEnergyMapper.java`
- **Mapper XML**: `MonthlyEnergyMapper.xml`、`HourlyEnergyMapper.xml`

## Alignment with Product Vision

根据 `structure.md`，SolarBi的核心功能包括"RBAC权限控制、页面级访问控制"。本功能在现有权限体系基础上，增加数据级访问控制，使权限管理更加精细化。

## Requirements

### Requirement 1: Service层解析pagePermissions并生成车间列表

**User Story:** 作为后端开发者，我希望在Service层解析用户的pagePermissions字段，生成用户有权访问的车间名称列表，传递给Mapper层。

#### Acceptance Criteria

1. WHEN 用户调用月度能耗统计API (`/api/monthly/statistics`) THEN `MonthlyEnergyServiceImpl` SHALL 从当前登录用户的pagePermissions字段中解析页面路径列表
2. WHEN Service解析到车间页面路径（如 `/airConditioning`）THEN Service SHALL 将其映射到车间名称（如 `114_空调水机主机`）
3. WHEN Service完成映射后 THEN Service SHALL 生成车间名称列表（`List<String>`）
4. IF 用户的userRole为"admin" THEN Service SHALL 传入null或空列表给Mapper（表示查询所有车间）
5. IF 用户的pagePermissions为空或null THEN Service SHALL 传入空列表给Mapper（Mapper将返回空结果）
6. WHEN 用户调用日能耗统计API (`/api/hourly/statistics`) THEN `HourlyEnergyServiceImpl` SHALL 应用相同的逻辑

**映射逻辑示例**：
```java
// 在Service方法中定义映射
Map<String, String> pathToWorkshop = new HashMap<>();
pathToWorkshop.put("/airConditioning", "114_空调水机主机");
pathToWorkshop.put("/injection110", "110注射");
pathToWorkshop.put("/granule102", "102造粒");
// ... 其他24个车间

// 解析pagePermissions并映射为车间列表
List<String> allowedWorkshops = new ArrayList<>();
for (String path : permissionPaths) {
    if (pathToWorkshop.containsKey(path)) {
        allowedWorkshops.add(pathToWorkshop.get(path));
    }
}
```

### Requirement 2: Mapper接口支持车间列表参数

**User Story:** 作为开发者，我希望Mapper接口能够接收车间列表参数，用于SQL查询时的过滤条件。

#### Acceptance Criteria

1. WHEN `MonthlyEnergyMapper` 接口定义查询方法时 THEN 方法 SHALL 接收 `@Param("workshopList") List<String> workshopList` 参数
2. WHEN `HourlyEnergyMapper` 接口定义查询方法时 THEN 方法 SHALL 接收 `@Param("workshopList") List<String> workshopList` 参数
3. IF workshopList参数为null或空列表 THEN Mapper SHALL 根据调用场景决定行为：
   - 管理员场景（null）：查询所有车间
   - 普通用户无权限场景（空列表）：使用 `WHERE 1=0` 返回空结果
4. IF workshopList参数包含多个车间名称 THEN Mapper SHALL 使用 SQL IN 子句过滤

**Mapper接口修改示例**：
```java
// MonthlyEnergyMapper.java
List<TempMonitor> selectMonthlyRawData(
    @Param("workshopList") List<String> workshopList,  // 新增参数
    @Param("startTime") Date startTime,
    @Param("endTime") Date endTime
);

// HourlyEnergyMapper.java
List<TempMonitor> selectAllWorkshopsHourlyData(
    @Param("workshopList") List<String> workshopList,  // 新增参数
    @Param("startTime") Date startTime,
    @Param("endTime") Date endTime
);
```

### Requirement 3: Mapper XML使用动态SQL过滤车间

**User Story:** 作为开发者，我希望在Mapper XML中使用MyBatis动态SQL，根据车间列表参数动态生成WHERE条件。

#### Acceptance Criteria

1. WHEN `MonthlyEnergyMapper.xml` 的查询语句执行时 THEN SQL SHALL 包含动态条件：
   - IF `workshopList != null and workshopList.size() > 0` THEN 添加 `AND Workshop IN <foreach>` 条件
   - IF `workshopList != null and workshopList.size() == 0` THEN 添加 `AND 1=0` 条件（返回空结果）
   - IF `workshopList == null` THEN 不添加车间过滤条件（查询所有车间）
2. WHEN `HourlyEnergyMapper.xml` 的查询语句执行时 THEN SQL SHALL 应用相同的动态条件逻辑
3. WHEN 使用 `<foreach>` 标签时 THEN 配置 SHALL 为：`collection="workshopList" item="workshop" open="(" separator="," close=")"`

**Mapper XML修改示例**：
```xml
<!-- MonthlyEnergyMapper.xml -->
<select id="selectMonthlyRawData" resultMap="TempMonitorResultMap">
    SELECT 
        Id, DeviceID, Name, Tem, Hum, MAC,
        UpdateTime, ElectricEnergy, NodeID, Workshop
    FROM RSWS_TempMonitor_Copy
    WHERE ElectricEnergy IS NOT NULL
      AND Workshop != '备用'
      AND Workshop != '备用总表'
      <choose>
          <when test="workshopList != null and workshopList.size() > 0">
              AND Workshop IN
              <foreach collection="workshopList" item="workshop" open="(" separator="," close=")">
                  #{workshop}
              </foreach>
          </when>
          <when test="workshopList != null and workshopList.size() == 0">
              AND 1=0
          </when>
          <!-- workshopList == null 时不添加条件，查询所有车间 -->
      </choose>
      <if test="startTime != null">
          AND UpdateTime &gt;= #{startTime}
      </if>
      <if test="endTime != null">
          AND UpdateTime &lt;= #{endTime}
      </if>
    ORDER BY Workshop, Name, UpdateTime ASC
</select>
```

### Requirement 4: pagePermissions字段解析与异常处理

**User Story:** 作为开发者，我需要正确解析pagePermissions字段（JSON格式）并处理异常情况。

#### Acceptance Criteria

1. WHEN pagePermissions字段为JSON数组字符串（如 `["\/airConditioning", "\/injection110"]`）THEN Service SHALL 使用Gson或Jackson解析为字符串数组
2. WHEN pagePermissions字段为null或空字符串 THEN Service SHALL 生成空车间列表（传给Mapper后返回空数据）
3. IF pagePermissions解析失败（非法JSON格式）THEN Service SHALL 捕获异常，记录WARN日志，生成空车间列表
4. WHEN 管理员用户（userRole="admin"）时 THEN Service SHALL 跳过pagePermissions解析，传入null给Mapper（查询所有车间）

**pagePermissions示例格式**:
```json
["/monthly-energy", "/hourly-energy", "/airConditioning", "/injection110"]
```

## Non-Functional Requirements

### Code Architecture and Modularity
- **分层清晰**: Service层负责权限解析和映射，Mapper层负责SQL查询，职责明确
- **最小改动**: 只修改必要的文件（2个Service实现类、2个Mapper接口、2个Mapper XML）
- **向后兼容**: API响应的数据结构保持不变

### Performance
- **查询效率**: 在SQL层面过滤车间，减少内存中的数据处理量
- **索引利用**: SQL中的 `Workshop IN (...)` 条件应能利用现有的数据库索引
- **响应时间**: 权限过滤不应显著增加响应时间（< 50ms）

### Security
- **SQL注入防护**: 使用MyBatis参数绑定（`#{workshop}`），防止SQL注入
- **权限校验**: 在Service层和SQL层双重过滤，确保数据安全
- **异常处理**: pagePermissions解析失败时返回空数据，不抛出异常

### Reliability
- **容错性**: pagePermissions格式异常时系统正常运行，返回空车间列表
- **日志记录**: 记录关键信息（用户ID、解析的车间列表）便于调试
- **边界情况**: 正确处理空列表、null等边界情况

### Usability
- **管理员便利**: 管理员自动拥有全部车间访问权限（传null给Mapper）
- **可维护性**: 映射逻辑清晰，便于后续添加新车间
- **调试友好**: SQL日志应能清晰显示过滤的车间列表
