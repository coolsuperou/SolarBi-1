# Tasks

## Backend Implementation

### Task 1: 创建 MonthlyEnergyMapper 接口
**Status**: [x] Completed

**Description**: 创建 Mapper 接口，定义查询月度原始数据的方法

**Files**:
- `back2/src/main/java/com/yupi/springbootinit/mapper/sqlserver/MonthlyEnergyMapper.java`

**Implementation Details**:
- 创建接口类并添加 `@Mapper` 注解
- 定义 `selectMonthlyRawData()` 方法，接收 workshop、startTime、endTime 参数
- workshop 参数可为 null（表示查询所有车间）
- 返回类型为 `List<TempMonitor>`

**Dependencies**: 无

---

### Task 2: 创建 MonthlyEnergyMapper XML 映射文件
**Status**: [x] Completed

**Description**: 创建 MyBatis XML 映射文件，实现 SQL 查询逻辑

**Files**:
- `back2/src/main/resources/mapper/sqlserver/MonthlyEnergyMapper.xml`

**Implementation Details**:
- 创建 XML 文件，命名空间指向 MonthlyEnergyMapper
- 定义 `TempMonitorResultMap`，映射数据库列到 Java 属性（注意 deviceId 和 nodeId 的驼峰命名）
- 实现 `selectMonthlyRawData` SQL：
  - 查询 `RSWS_TempMonitor_Copy` 表
  - 过滤 `ElectricEnergy IS NOT NULL`
  - 使用 `<if>` 标签动态添加 Workshop、UpdateTime 条件
  - 按 `Workshop, Name, UpdateTime ASC` 排序

**Dependencies**: Task 1

**Acceptance Criteria**:
- SQL 支持 workshop 为 null 时查询所有车间
- 正确映射 DeviceID → deviceId, NodeID → nodeId

---

### Task 3: 创建 MonthlyEnergyStatistics DTO
**Status**: [x] Completed

**Description**: 创建数据传输对象，封装月度能耗统计数据

**Files**:
- `back2/src/main/java/com/yupi/springbootinit/model/dto/tempmonitor/MonthlyEnergyStatistics.java`

**Implementation Details**:
- 创建 DTO 类，添加 `@Data` 注解
- 定义字段：
  - `Integer year` - 年份
  - `Integer month` - 月份
  - `Integer daysInMonth` - 该月天数
  - `List<String> workshopList` - 车间列表（排序后）
  - `Map<String, List<Double>> workshopDailyData` - 各车间每日能耗
  - `Map<String, Double> workshopMonthlyTotal` - 各车间月度总能耗
  - `List<Double> dailyTotal` - 每日总能耗
  - `Double monthlyTotal` - 月度总能耗
- 实现 `Serializable` 接口

**Dependencies**: 无

---

### Task 4: 创建 MonthlyEnergyService 接口
**Status**: [x] Completed

**Description**: 创建服务接口，定义获取月度统计数据的方法

**Files**:
- `back2/src/main/java/com/yupi/springbootinit/service/MonthlyEnergyService.java`

**Implementation Details**:
- 创建接口类
- 定义 `getMonthlyStatistics(Integer year, Integer month)` 方法
- 返回类型为 `MonthlyEnergyStatistics`

**Dependencies**: Task 3

---

### Task 5: 创建 MonthlyEnergyServiceImpl 实现类
**Status**: [x] Completed

**Description**: 实现月度能耗统计的核心业务逻辑

**Files**:
- `back2/src/main/java/com/yupi/springbootinit/service/impl/MonthlyEnergyServiceImpl.java`

**Implementation Details**:
- 添加 `@Service` 和 `@Slf4j` 注解
- 注入 `MonthlyEnergyMapper`
- 实现 `getMonthlyStatistics()` 方法：
  1. 使用 `EnergyTimeConfig` 计算月度时间范围
  2. 调用 `monthlyEnergyMapper.selectMonthlyRawData(null, ...)` 一次性查询所有车间数据
  3. 从查询结果中提取车间列表（Stream 去重 + 排序）
  4. 按车间分组原始数据（`Collectors.groupingBy`）
  5. 遍历每个车间，调用 `EnergyCalculationUtils.calculateDailyEnergyFromRawData()` 计算日能耗
  6. 转换为数组格式，累加每日总能耗
  7. 组装并返回 `MonthlyEnergyStatistics` 对象
- 处理空数据情况，返回空统计对象

**Dependencies**: Task 1, Task 2, Task 3, Task 4

**Acceptance Criteria**:
- 只调用一次 Mapper 查询
- 车间列表按字母排序
- 正确计算每日和月度总能耗
- 处理空数据不报错

---

### Task 6: 创建 MonthlyEnergyController
**Status**: [x] Completed

**Description**: 创建 REST 控制器，暴露月度统计 API 接口

**Files**:
- `back2/src/main/java/com/yupi/springbootinit/controller/MonthlyEnergyController.java`

**Implementation Details**:
- 添加 `@RestController`、`@RequestMapping("/monthly")`、`@Slf4j` 注解
- 注入 `MonthlyEnergyService`
- 创建 `getMonthlyStatistics()` 方法：
  - `@GetMapping("/statistics")`
  - 接收 `@RequestParam Integer year` 和 `Integer month`
  - 调用 Service 获取统计数据
  - 使用 `ResultUtils.success()` 包装返回结果
- 添加日志记录请求参数

**Dependencies**: Task 4, Task 5

**Acceptance Criteria**:
- API 路径为 `/api/monthly/statistics`
- 正确处理 year 和 month 参数
- 返回标准 `BaseResponse` 格式

---

## Frontend Implementation

### Task 7: 创建 monthlyEnergyController API 服务
**Status**: [x] Completed

**Description**: 创建前端 API 服务文件，封装后端接口调用

**Files**:
- `front/src/services/SolarBi-front/monthlyEnergyController.ts`

**Implementation Details**:
- 导入 `request` from `@umijs/max`
- 创建 `getMonthlyEnergy()` 函数：
  - 接收参数对象 `{ year: number, month: number }`
  - 使用 `request<API.BaseResponse<any>>()` 调用 `/api/monthly/statistics`
  - 使用 GET 方法
  - 返回 Promise

**Dependencies**: Task 6 (后端 API 完成)

---

### Task 8: 创建 MonthlyEnergy 页面组件
**Status**: [x] Completed

**Description**: 创建月度能耗统计表格页面

**Files**:
- `front/src/pages/MonthlyEnergy/index.tsx`

**Implementation Details**:
- 导入必要的依赖：React、Ant Design 组件、API 服务
- 定义状态：loading、year、month、data
- 实现 `loadData()` 函数：
  - 调用 `getMonthlyEnergy()` API
  - 处理响应并更新 data 状态
  - 错误处理和提示
- 实现 `getHighlightClass()` 函数：
  - value > 4000 → `styles.highlightPurple`
  - value > 2000 → `styles.highlightYellow`
  - 否则返回空字符串
- 实现 `formatValue()` 函数：
  - null/undefined/0 → 显示 '-'
  - 其他 → 保留一位小数
- 渲染页面结构：
  - 页面标题："电能监控月度数据统计表"
  - 查询区域：年份和月份选择器
  - 数据表格：
    - 固定列（车间名称）
    - 动态列（1-31日，根据该月天数）
    - 动态行（从 data.workshopList 获取）
    - 应用高亮样式
    - 合计行
- 使用 `useEffect` 在参数变化时自动加载数据

**Dependencies**: Task 7

**Acceptance Criteria**:
- 表格横向滚动，首列固定
- 正确显示所有车间数据
- 高亮逻辑正确（黄色 2000+，紫色 4000+）
- 合计行正确显示

---

### Task 9: 创建 MonthlyEnergy 页面样式
**Status**: [x] Completed

**Description**: 创建页面样式文件，实现科技蓝主题和高亮效果

**Files**:
- `front/src/pages/MonthlyEnergy/index.less`

**Implementation Details**:
- 定义 `.container` 样式：
  - 渐变背景（深蓝色系）
  - 最小高度 100vh
  - 内边距
- 定义 `.pageTitle` 样式：
  - 居中对齐
  - 科技蓝色
  - 文字阴影
- 定义 `.querySection` 样式：
  - Flex 布局
  - 查询组和标签样式
- 定义 `.tableContainer` 样式：
  - 白色背景卡片
  - 圆角和阴影
- 定义 `.tableWrapper` 样式：
  - 横向滚动支持
- 定义 `.dataTable` 样式：
  - 边框和间距
  - 固定首列（使用 sticky）
  - 表头样式（深蓝背景）
  - 单元格样式
- 定义 `.infoHeader` 和 `.infoCell` 样式：
  - 固定列特殊样式
  - 左对齐
  - 背景色
- 定义 `.highlightYellow` 样式：
  - 黄色背景 `rgba(255, 235, 59, 0.5)`
  - 字体加粗
- 定义 `.highlightPurple` 样式：
  - 紫色背景 `rgba(156, 39, 176, 0.5)`
  - 字体加粗
  - 白色文字
- 定义 `.totalRow` 样式：
  - 绿色背景
  - 字体加粗

**Dependencies**: Task 8

**Acceptance Criteria**:
- 表格首列固定不滚动
- 黄色和紫色高亮清晰可见
- 合计行绿色突出显示
- 整体科技感强

---

### Task 10: 配置前端路由
**Status**: [x] Completed

**Description**: 在路由配置中添加月度能耗统计页面

**Files**:
- `front/config/routes.ts`

**Implementation Details**:
- 在路由数组中添加新路由配置：
  ```typescript
  {
    name: '月度能耗统计',
    icon: 'BarChartOutlined',
    path: '/monthly-energy',
    component: './MonthlyEnergy',
    access: 'canUser',
  }
  ```
- 确保路由在合适的位置（建议在其他能耗相关页面附近）

**Dependencies**: Task 8, Task 9

**Acceptance Criteria**:
- 路由可正常访问
- 侧边栏显示菜单项
- 权限配置正确

---

## Testing and Validation

### Task 11: 后端接口测试
**Status**: [-] Ready for Testing

**Description**: 测试后端 API 接口的正确性

**Implementation Details**:
- 使用 Postman/curl 测试 `/api/monthly/statistics` 接口
- 测试场景：
  - 正常查询（2025年9月）
  - 边界情况（2月、12月）
  - 无数据月份
  - 参数校验
- 验证返回数据结构和内容正确性
- 检查日志输出是否正常

**Dependencies**: Task 6

**Acceptance Criteria**:
- API 返回 200 状态码
- 数据格式符合 DTO 定义
- 车间列表已排序
- 能耗计算准确

---

### Task 12: 前端功能测试
**Status**: [-] Ready for Testing

**Description**: 测试前端页面的功能和交互

**Implementation Details**:
- 测试场景：
  - 页面加载和数据展示
  - 年份/月份切换
  - 表格滚动和固定列
  - 高亮显示（手动构造测试数据）
  - 合计行计算
  - 空数据处理
  - 错误提示
- 浏览器兼容性测试（Chrome, Edge）
- 响应式布局测试

**Dependencies**: Task 10

**Acceptance Criteria**:
- 所有功能正常工作
- UI 显示美观
- 交互流畅无卡顿
- 错误处理友好

---

## Summary

**Total Tasks**: 12
- Backend: 6 tasks
- Frontend: 4 tasks  
- Testing: 2 tasks

**Estimated Time**: 4-6 hours

**Critical Path**:
1. Tasks 1-2 (Mapper)
2. Tasks 3-5 (Service Layer)
3. Task 6 (Controller)
4. Task 7 (Frontend API)
5. Tasks 8-9 (Frontend UI)
6. Task 10 (Routing)
7. Tasks 11-12 (Testing)

