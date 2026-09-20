# AGENTS.md — SolarBi-1 工作区说明

工厂能耗 / 电费分摊 BI 系统（甲方：天石源）。单仓库同时放后端、两个前端和设计资产。

## 目录

| 目录 | 说明 |
|---|---|
| `back2/` | **唯一在跑的后端**，Spring Boot 2.7.2，端口 `8101`，context-path `/api`，74 个 Java 文件 |
| `front/` | React 前端（`@umijs/max`），依赖未入库 |
| `VUE/` | Vue + Vite 前端（移动端）。`node_modules` 已移出版本控制，克隆后需在 `VUE/` 下 `npm install` |
| `design/` | 设计资产（610M，含 `.glb` 模型），441 个已跟踪 + 1636 个未跟踪，处置待定 |
| `sql/` | 业务导入模板（xlsx），无建表脚本 |

## 数据库：双数据源，不是单数据源

- **主数据源** `@Primary`：MySQL `10.2.0.9:3306/dnpt`（用户/权限等）→ mapper 包 `mapper.mysql`
- **辅助数据源**：SQL Server `192.168.1.238:1433/iEMP`（能耗数据）→ mapper 包 `mapper.sqlserver`
- `MainApplication` **排除了 `DataSourceAutoConfiguration`**，两个数据源在 `config/PrimaryDataSourceConfig` 和 `config/SecondaryDataSourceConfig` 里手工装配，**靠 mapper 的包路径路由**——新增 mapper 必须放进对应子包，否则会连错库
- ⚠️ **配置类读的是 `spring.datasource.primary.*` / `spring.datasource.secondary.*`。`application-prod.yml` 里那个根级 `spring.datasource.url`（`47.105.82.96/solarbi`）没有任何代码读取，改它不生效**
- 当前 profile 是 `dev`，但仓库里**没有 `application-dev.yml`**，所以 dev 走的是 `application.yml` 里的双数据源配置
- 两个库都在远端（局域网 + 公网），连不上时应用起不来

SQL Server 侧的表：

| 表 | 用途 |
|---|---|
| `RSWS_TempMonitor` | 能耗主表（2026-09-20 由 `RSWS_TempMonitor_Copy` 切换而来）。有 `IDENTITY(Id)` 和三个覆盖索引 |
| `tbl_monitordevice` | 设备台账，用 `IsElectricMeter = 1` 筛出电能表 |
| `tbl_workshop_hierarchy` | 车间层级（一/二级部门） |
| `tbl_power_supply_data` | 供电局抄表数据。**SQL Server 侧唯一有写入的表**，按「年 + 月」做 upsert |

能耗计算口径：同一设备在时间窗内「最后一条读数 − 第一条读数」，用 `FIRST_VALUE ... OVER` 实现；`Workshop` 为 `'备用'`/`'备用总表'` 的记录一律排除。

## 常用命令

后端（在 `back2/` 下）：

```bash
mvn -o -B compile          # 编译；离线可用，依赖已在 ~/.m2
mvn spring-boot:run        # 启动（或 IDE 直接运行 MainApplication）
```

- 接口文档：http://localhost:8101/api/doc.html （Knife4j）
- **没有任何单元测试**（`src/test` 为空），验证只能靠「编译通过 + 真实启动 + 调接口」
- 部署：`Dockerfile` 用 `--spring.profiles.active=prod`

前端：

```bash
cd front && npm run dev        # umi max，API 代理指向 8101
cd front && npm run build      # 产物 dist/
cd front && npm run lint       # eslint + prettier + tsc
cd VUE   && npm run dev        # vite，vite.config.js 里 proxy → localhost:8101
cd VUE   && npm test           # vitest --run
```

## 后端编码约定

- Spring Boot **2.7.2** → 用 `javax.*`，**不是 `jakarta.*`**（写成 jakarta 编译不过）
- MyBatis-Plus 3.5.2；`map-underscore-to-camel-case: false`，所以实体必须逐个 `@TableField("列名")` 显式映射（SQL Server 表是 PascalCase 列名，MySQL 的 `tbl_power_supply_data` 是 snake_case 列名）
- 全局逻辑删除字段是 `isDelete`
- ⚠️ **`pom.xml` 里的 `maven.compiler.source/target = 8` 是显式写的，不要删**。删掉后编译级别只能靠 `spring-boot-starter-parent` 继承，一旦 Maven 导入不完整（例如导入中断），IDE 会把语言级别退化成 1.5，然后报 `Target bytecode version 5 is not supported by SDK 17`
- 表名切换遗留：`TempMonitor` 实体的 `@TableId(type = IdType.AUTO)` 与新表 `IDENTITY(1,1)` 匹配；该表目前**只有读操作**，若以后新增写入需要注意

## Git 流程

- **单主线**：只有 `master`（永远保持可编译、可部署）
- 功能/修复从 `master` 切短生命周期分支：`feat/<主题>`、`fix/<主题>`，合回后删除。纯文档、配置类的小改动可以直接提交到 `master`，不必为它开分支
- ❌ 不要再用技术栈 / 数据库 / 平台名当分支名（`react`、`vue`、`dnpt`、`wx` 是历史遗留，已清理）
- 历史分支内容已归档为 tag：`archive/react`、`archive/dnpt`、`archive/vue`、`archive/wx`；恢复用 `git checkout -b <名字> archive/<名字>`
- 提交信息用中文，带类型前缀：`feat(电费分摊): ...`、`fix(移动端): ...`、`chore: ...`
- 生产发布打 tag；`master` 已设为默认分支

## IDE / 构建环境的坑（本机）

- 根工程 `.idea/misc.xml` 的 Maven 链接必须指向 `back2/pom.xml`
- Maven 的 **User settings file 不要 Override**。两个工程的 `workspace.xml` 历史上各自指向过已删除的 Maven 安装目录（`D:\BaiduNetdiskDownload\...`、`D:\programe\java\...`），一 Override 就会出现「The specified user settings file does not exist」，Maven 面板全部功能失效
- 本地仓库统一用默认的 `C:\Users\23323\.m2\repository`（不要再用 `back2` 工程里那个 `D:\programe\java\...\mvn-repository`）
- 模块 `springboot-init` 的 Language level 应为 **8**
- 查看归档 tag 那种老提交时，可能报 `untracked working tree files would be overwritten`（老提交仍跟踪着 `VUE/node_modules`），属预期现象

## 近期重要变更（2026-09-20）

1. 能耗表从 `RSWS_TempMonitor_Copy` 切换到 `RSWS_TempMonitor`（6 个文件 17 处），性能上从无索引的副表换到带三个覆盖索引的主表
2. `back2/pom.xml` 补了显式编译级别
3. 修了 IDE 的 Maven 失效配置与模块链接
4. 新增仓库根级 `.gitignore`；`node_modules` 全部移出版本控制
5. 分支从 9 条收敛到 1 条 `master`，历史分支转为归档 tag

**待办**：`design/` 下 1636 个未跟踪文件的处置方式尚未决定；切换表后需要用同一月份的电费分摊结果与切换前做一次数据对比验收。
