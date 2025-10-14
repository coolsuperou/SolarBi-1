# Tasks Document

## 任务概述

本任务列表将设计文档中的7个文件修改拆分为可独立执行的原子任务。每个任务专注于单个文件的修改，确保职责清晰且易于验证。

---

## 任务列表

- [ ] 1. 创建车间权限工具类
  - File: back2/src/main/java/com/yupi/springbootinit/utils/WorkshopPermissionUtils.java
  - 创建新的工具类，封装权限解析逻辑
  - 包含27个车间的路径映射关系
  - Purpose: 提供静态方法供Service层调用，解析pagePermissions并返回车间列表
  - _Leverage: 参考现有的 EnergyCalculationUtils.java 工具类的代码风格_
  - _Requirements: 需求3（pagePermissions字段格式规范）_
  - _Prompt: Implement the task for spec workshop-permissions-filter, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Java工具类开发专家，熟悉Spring Boot和Lombok
    
    Task: 创建 WorkshopPermissionUtils 工具类，实现以下功能：
    1. 定义静态常量 PATH_TO_WORKSHOP_MAPPING 存储27个车间的路径映射
    2. 实现公开静态方法 parseWorkshopsFromPermissions(String pagePermissions)
       - 解析JSON格式的pagePermissions字段
       - 使用Gson解析为字符串数组
       - 根据映射表转换为车间名称列表
       - 异常安全处理，解析失败返回空列表
    3. 实现私有静态方法 buildPathToWorkshopMapping()
       - 构建并返回包含27个车间映射的HashMap
       - 路径格式："/airConditioning" → "114_空调水机主机"
    4. 使用 @Slf4j 注解记录日志（INFO和WARN级别）
    
    Context: 参考 design.md 中 Component 1 的完整代码实现
    
    Restrictions:
    - 不要添加任何调试方法或冗余代码
    - 不要添加 getPathToWorkshopMapping() 等额外的公开方法
    - 确保代码整洁，只保留核心功能
    - 使用 Gson 而非 Jackson 进行JSON解析
    - 日志级别：空权限WARN，正常解析INFO，解析失败WARN
    
    Success:
    - 工具类编译无错误
    - 包含完整的27个车间映射
    - parseWorkshopsFromPermissions() 方法能正确解析JSON并返回车间列表
    - 异常情况返回空列表而非抛出异常
    - 代码风格与现有工具类一致
    
    Instructions:
    1. 在 tasks.md 中将此任务标记为 in-progress: `- [-] 1. 创建车间权限工具类`
    2. 使用 mcp_filesystem_write_file 创建文件
    3. 完成后将任务标记为 completed: `- [x] 1. 创建车间权限工具类`

---

- [ ] 2. 修改月度能耗Mapper接口
  - File: back2/src/main/java/com/yupi/springbootinit/mapper/sqlserver/MonthlyEnergyMapper.java
  - 修改 selectMonthlyRawData 方法签名
  - 将单个车间参数改为车间列表参数
  - Purpose: 支持根据车间列表进行数据查询
  - _Leverage: 查看现有的 Mapper 接口定义模式_
  - _Requirements: 需求1（后端API根据用户权限过滤车间数据）_
  - _Prompt: Implement the task for spec workshop-permissions-filter, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: MyBatis Mapper接口开发专家
    
    Task: 修改 MonthlyEnergyMapper 接口的 selectMonthlyRawData 方法：
    1. 移除原有的 @Param("workshop") String workshop 参数
    2. 添加新参数 @Param("workshopList") List<String> workshopList
    3. 保持其他参数不变（startTime, endTime）
    4. 保持返回类型 List<TempMonitor> 不变
    
    Context: 参考 design.md 中 Component 4 的接口修改说明
    
    Restrictions:
    - 只修改方法签名，不要修改其他内容
    - 不要改变方法名
    - 保持 @Param 注解的正确使用
    - 不要修改其他方法或注释
    
    Success:
    - 接口编译无错误
    - 方法签名与设计文档一致
    - @Param 注解正确标注 workshopList 参数
    
    Instructions:
    1. 在 tasks.md 中将此任务标记为 in-progress
    2. 使用 mcp_filesystem_update_file 修改文件
    3. 完成后将任务标记为 completed

---

- [ ] 3. 修改月度能耗Mapper XML
  - File: back2/src/main/resources/mapper/sqlserver/MonthlyEnergyMapper.xml
  - 修改 selectMonthlyRawData 查询的动态SQL
  - 添加车间列表过滤逻辑
  - Purpose: 在SQL层面根据车间列表过滤数据
  - _Leverage: 参考现有的 MyBatis 动态SQL写法_
  - _Requirements: 需求1（后端API根据用户权限过滤车间数据）_
  - _Prompt: Implement the task for spec workshop-permissions-filter, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: MyBatis XML配置专家，熟悉动态SQL
    
    Task: 修改 MonthlyEnergyMapper.xml 的 selectMonthlyRawData 查询：
    1. 移除原有的单个 workshop 参数的条件判断
    2. 在 WHERE 子句中添加动态SQL逻辑：
       - 使用 <if test="workshopList != null and workshopList.size() > 0">
         - 添加 Workshop IN (...) 条件
         - 使用 <foreach> 遍历 workshopList
       - 使用 <if test="workshopList != null and workshopList.size() == 0">
         - 添加 AND 1=0 条件（返回空结果）
    3. 保持其他WHERE条件不变（ElectricEnergy, 备用过滤, 时间范围）
    4. 保持ORDER BY子句不变
    
    Context: 参考 design.md 中 Component 5 的完整SQL示例
    
    Restrictions:
    - 不要修改 SELECT 字段列表
    - 不要修改表名
    - 不要修改现有的 ElectricEnergy 和 备用 过滤条件
    - 不要修改 ORDER BY 子句
    - 使用 <if> 而非 <choose> 标签
    
    Success:
    - XML语法正确，无解析错误
    - 动态SQL逻辑符合设计文档
    - <foreach> 标签配置正确：collection="workshopList" item="workshop" open="(" separator="," close=")"
    - 使用 #{workshop} 参数绑定防止SQL注入
    
    Instructions:
    1. 在 tasks.md 中将此任务标记为 in-progress
    2. 使用 mcp_filesystem_update_file 修改文件
    3. 完成后将任务标记为 completed

---

- [ ] 4. 修改月度能耗Service实现类
  - File: back2/src/main/java/com/yupi/springbootinit/service/impl/MonthlyEnergyServiceImpl.java
  - 添加权限解析逻辑，调用工具类
  - 修改Mapper调用，传入车间列表
  - Purpose: 在Service层集成权限过滤功能
  - _Leverage: 使用 WorkshopPermissionUtils 工具类_
  - _Requirements: 需求1（后端API根据用户权限过滤车间数据）_
  - _Prompt: Implement the task for spec workshop-permissions-filter, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Spring Boot Service层开发专家
    
    Task: 修改 MonthlyEnergyServiceImpl 的 getMonthlyStatistics 方法：
    1. 在方法开始处添加权限解析逻辑：
       - 获取当前登录用户：User currentUser = userService.getLoginUser(request);
       - 调用工具类解析权限：List<String> allowedWorkshops = WorkshopPermissionUtils.parseWorkshopsFromPermissions(currentUser.getPagePermissions());
    2. 修改Mapper调用：
       - 将原来的 monthlyEnergyMapper.selectMonthlyRawData(null, monthStart, monthEnd)
       - 改为 monthlyEnergyMapper.selectMonthlyRawData(allowedWorkshops, monthStart, monthEnd)
    3. 添加必要的import语句：
       - import com.yupi.springbootinit.utils.WorkshopPermissionUtils;
       - import com.yupi.springbootinit.model.entity.User;（如果尚未导入）
    4. 保持其他业务逻辑不变
    
    Context: 参考 design.md 中 Component 2 的修改说明
    
    Restrictions:
    - 不要修改能耗计算逻辑
    - 不要修改返回结果的数据结构
    - 不要添加管理员特殊处理逻辑（所有用户统一处理）
    - 只在 getMonthlyStatistics 方法中添加代码
    - 保持现有的日志输出
    
    Success:
    - 代码编译无错误
    - UserService 的 getLoginUser 方法能正确获取当前用户
    - WorkshopPermissionUtils 被正确调用
    - Mapper方法调用参数正确
    - 现有功能不受影响
    
    Instructions:
    1. 在 tasks.md 中将此任务标记为 in-progress
    2. 使用 mcp_filesystem_update_file 修改文件
    3. 完成后将任务标记为 completed

---

- [ ] 5. 修改日能耗Mapper接口
  - File: back2/src/main/java/com/yupi/springbootinit/mapper/sqlserver/HourlyEnergyMapper.java
  - 修改 selectAllWorkshopsHourlyData 方法签名
  - 添加车间列表参数
  - Purpose: 支持根据车间列表进行日能耗数据查询
  - _Leverage: 参考任务2的Mapper接口修改_
  - _Requirements: 需求1（后端API根据用户权限过滤车间数据）_
  - _Prompt: Implement the task for spec workshop-permissions-filter, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: MyBatis Mapper接口开发专家
    
    Task: 修改 HourlyEnergyMapper 接口的 selectAllWorkshopsHourlyData 方法：
    1. 在方法参数列表的第一个位置添加：@Param("workshopList") List<String> workshopList
    2. 保持其他参数不变（startTime, endTime）
    3. 保持返回类型 List<TempMonitor> 不变
    
    Context: 参考 design.md 中 Component 6 & 7 的接口修改说明，与月度Mapper接口修改逻辑一致
    
    Restrictions:
    - 只修改方法签名，不要修改其他内容
    - 不要改变方法名
    - 保持 @Param 注解的正确使用
    - 参数顺序：workshopList, startTime, endTime
    
    Success:
    - 接口编译无错误
    - 方法签名与设计文档一致
    - @Param 注解正确标注 workshopList 参数
    
    Instructions:
    1. 在 tasks.md 中将此任务标记为 in-progress
    2. 使用 mcp_filesystem_update_file 修改文件
    3. 完成后将任务标记为 completed

---

- [ ] 6. 修改日能耗Mapper XML
  - File: back2/src/main/resources/mapper/sqlserver/HourlyEnergyMapper.xml
  - 修改 selectAllWorkshopsHourlyData 查询的动态SQL
  - 添加车间列表过滤逻辑
  - Purpose: 在SQL层面根据车间列表过滤日能耗数据
  - _Leverage: 参考任务3的Mapper XML修改_
  - _Requirements: 需求1（后端API根据用户权限过滤车间数据）_
  - _Prompt: Implement the task for spec workshop-permissions-filter, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: MyBatis XML配置专家，熟悉动态SQL
    
    Task: 修改 HourlyEnergyMapper.xml 的 selectAllWorkshopsHourlyData 查询：
    1. 在 WHERE 子句中添加与月度Mapper XML完全相同的动态SQL逻辑：
       - 使用 <if test="workshopList != null and workshopList.size() > 0">
         - 添加 Workshop IN (...) 条件
         - 使用 <foreach> 遍历 workshopList
       - 使用 <if test="workshopList != null and workshopList.size() == 0">
         - 添加 AND 1=0 条件（返回空结果）
    2. 保持其他WHERE条件不变
    3. 保持ORDER BY子句不变
    
    Context: 参考 design.md 中 Component 6 & 7 的说明，与 MonthlyEnergyMapper.xml 的修改逻辑完全一致
    
    Restrictions:
    - 不要修改 SELECT 字段列表
    - 不要修改表名
    - 不要修改现有的过滤条件
    - 不要修改 ORDER BY 子句
    - 使用与月度Mapper XML相同的动态SQL结构
    
    Success:
    - XML语法正确，无解析错误
    - 动态SQL逻辑与月度Mapper XML一致
    - <foreach> 标签配置正确
    - 使用参数绑定防止SQL注入
    
    Instructions:
    1. 在 tasks.md 中将此任务标记为 in-progress
    2. 使用 mcp_filesystem_update_file 修改文件
    3. 完成后将任务标记为 completed

---

- [ ] 7. 修改日能耗Service实现类
  - File: back2/src/main/java/com/yupi/springbootinit/service/impl/HourlyEnergyServiceImpl.java
  - 添加权限解析逻辑，调用工具类
  - 修改Mapper调用，传入车间列表
  - Purpose: 在Service层集成权限过滤功能（日能耗）
  - _Leverage: 参考任务4的Service修改，使用 WorkshopPermissionUtils 工具类_
  - _Requirements: 需求1（后端API根据用户权限过滤车间数据）_
  - _Prompt: Implement the task for spec workshop-permissions-filter, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: Spring Boot Service层开发专家
    
    Task: 修改 HourlyEnergyServiceImpl 的 getHourlyStatistics 方法：
    1. 在方法开始处添加权限解析逻辑（与月度Service完全相同）：
       - 获取当前登录用户：User currentUser = userService.getLoginUser(request);
       - 调用工具类解析权限：List<String> allowedWorkshops = WorkshopPermissionUtils.parseWorkshopsFromPermissions(currentUser.getPagePermissions());
    2. 修改Mapper调用：
       - 将原来的 hourlyEnergyMapper.selectAllWorkshopsHourlyData(startTime, endTime)
       - 改为 hourlyEnergyMapper.selectAllWorkshopsHourlyData(allowedWorkshops, startTime, endTime)
    3. 添加必要的import语句：
       - import com.yupi.springbootinit.utils.WorkshopPermissionUtils;
       - import com.yupi.springbootinit.model.entity.User;（如果尚未导入）
    4. 保持其他业务逻辑不变
    
    Context: 参考 design.md 中 Component 3 的修改说明，与月度Service的修改逻辑完全一致
    
    Restrictions:
    - 不要修改能耗计算逻辑
    - 不要修改返回结果的数据结构
    - 不要添加管理员特殊处理逻辑
    - 只在 getHourlyStatistics 方法中添加代码
    - 保持现有的日志输出
    
    Success:
    - 代码编译无错误
    - UserService 的 getLoginUser 方法能正确获取当前用户
    - WorkshopPermissionUtils 被正确调用
    - Mapper方法调用参数正确
    - 现有功能不受影响
    
    Instructions:
    1. 在 tasks.md 中将此任务标记为 in-progress
    2. 使用 mcp_filesystem_update_file 修改文件
    3. 完成后将任务标记为 completed

---

## 任务执行说明

### 执行顺序
1. **必须按顺序执行任务1-3**（月度能耗相关）
2. **然后按顺序执行任务5-6**（日能耗相关，可与任务4并行）
3. **最后执行任务4和7**（Service层修改，依赖工具类和Mapper修改）

### 任务状态标记
- `- [ ]` 待执行
- `- [-]` 执行中
- `- [x]` 已完成

### 验证方法
1. **编译检查**：确保所有修改后的文件编译无错误
2. **接口一致性**：Mapper接口与XML文件的方法签名必须匹配
3. **功能测试**：测试月度和日能耗API，验证权限过滤功能正常工作

### 注意事项
- 每个任务完成后立即更新任务状态
- 遇到问题及时记录并寻求帮助
- 保持代码风格与现有代码一致
- 所有修改必须使用 mcp_filesystem 工具完成
