-- SQL Server 版本的 SolarBi 数据库建表脚本

-- 创建数据库（如果不存在）
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'solarbi')
BEGIN
    CREATE DATABASE solarbi;
END
GO

USE solarbi;
GO

-- 用户表
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='[user]' AND xtype='U')
BEGIN
    CREATE TABLE [user] (
        id           BIGINT IDENTITY(1,1) PRIMARY KEY,
        userAccount  NVARCHAR(256)                           NOT NULL,
        userPassword NVARCHAR(512)                           NOT NULL,
        userName     NVARCHAR(256)                           NULL,
        userAvatar   NVARCHAR(1024)                          NULL,
        userRole     NVARCHAR(256) DEFAULT 'user'            NOT NULL,
        createTime   DATETIME2     DEFAULT GETDATE()         NOT NULL,
        updateTime   DATETIME2     DEFAULT GETDATE()         NOT NULL,
        isDelete     BIT           DEFAULT 0                 NOT NULL
    );
    
    -- 添加注释
    EXEC sp_addextendedproperty 'MS_Description', 'id', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'id';
    EXEC sp_addextendedproperty 'MS_Description', '账号', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'userAccount';
    EXEC sp_addextendedproperty 'MS_Description', '密码', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'userPassword';
    EXEC sp_addextendedproperty 'MS_Description', '用户昵称', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'userName';
    EXEC sp_addextendedproperty 'MS_Description', '用户头像', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'userAvatar';
    EXEC sp_addextendedproperty 'MS_Description', '用户角色：user/admin', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'userRole';
    EXEC sp_addextendedproperty 'MS_Description', '创建时间', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'createTime';
    EXEC sp_addextendedproperty 'MS_Description', '更新时间', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'updateTime';
    EXEC sp_addextendedproperty 'MS_Description', '是否删除', 'SCHEMA', 'dbo', 'TABLE', '[user]', 'COLUMN', 'isDelete';
    EXEC sp_addextendedproperty 'MS_Description', '用户', 'SCHEMA', 'dbo', 'TABLE', '[user]';
    
    -- 创建索引
    CREATE INDEX idx_userAccount ON [user] (userAccount);
END
GO

-- 图表信息表
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='chart' AND xtype='U')
BEGIN
    CREATE TABLE chart (
        id           BIGINT IDENTITY(1,1) PRIMARY KEY,
        goal         NTEXT                                 NULL,
        [name]       NVARCHAR(128)                         NULL,
        chartData    NTEXT                                 NULL,
        chartType    NVARCHAR(128)                         NULL,
        genChart     NTEXT                                 NULL,
        genResult    NTEXT                                 NULL,
        [status]     NVARCHAR(128) DEFAULT 'wait'          NOT NULL,
        execMessage  NTEXT                                 NULL,
        userId       BIGINT                                NULL,
        createTime   DATETIME2     DEFAULT GETDATE()       NOT NULL,
        updateTime   DATETIME2     DEFAULT GETDATE()       NOT NULL,
        isDelete     BIT           DEFAULT 0               NOT NULL
    );
    
    -- 添加注释
    EXEC sp_addextendedproperty 'MS_Description', 'id', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'id';
    EXEC sp_addextendedproperty 'MS_Description', '分析目标', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'goal';
    EXEC sp_addextendedproperty 'MS_Description', '图表名称', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', '[name]';
    EXEC sp_addextendedproperty 'MS_Description', '图表数据', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'chartData';
    EXEC sp_addextendedproperty 'MS_Description', '图表类型', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'chartType';
    EXEC sp_addextendedproperty 'MS_Description', '生成的图表数据', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'genChart';
    EXEC sp_addextendedproperty 'MS_Description', '生成的分析结论', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'genResult';
    EXEC sp_addextendedproperty 'MS_Description', 'wait,running,succeed,failed', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', '[status]';
    EXEC sp_addextendedproperty 'MS_Description', '执行信息', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'execMessage';
    EXEC sp_addextendedproperty 'MS_Description', '创建用户 id', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'userId';
    EXEC sp_addextendedproperty 'MS_Description', '创建时间', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'createTime';
    EXEC sp_addextendedproperty 'MS_Description', '更新时间', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'updateTime';
    EXEC sp_addextendedproperty 'MS_Description', '是否删除', 'SCHEMA', 'dbo', 'TABLE', 'chart', 'COLUMN', 'isDelete';
    EXEC sp_addextendedproperty 'MS_Description', '图表信息表', 'SCHEMA', 'dbo', 'TABLE', 'chart';
END
GO

-- 帖子表
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='post' AND xtype='U')
BEGIN
    CREATE TABLE post (
        id         BIGINT IDENTITY(1,1) PRIMARY KEY,
        title      NVARCHAR(512)                     NULL,
        content    NTEXT                             NULL,
        tags       NVARCHAR(1024)                    NULL,
        thumbNum   INT      DEFAULT 0                NOT NULL,
        favourNum  INT      DEFAULT 0                NOT NULL,
        userId     BIGINT                            NOT NULL,
        createTime DATETIME2 DEFAULT GETDATE()       NOT NULL,
        updateTime DATETIME2 DEFAULT GETDATE()       NOT NULL,
        isDelete   BIT      DEFAULT 0                NOT NULL
    );
    
    -- 添加注释
    EXEC sp_addextendedproperty 'MS_Description', 'id', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'id';
    EXEC sp_addextendedproperty 'MS_Description', '标题', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'title';
    EXEC sp_addextendedproperty 'MS_Description', '内容', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'content';
    EXEC sp_addextendedproperty 'MS_Description', '标签列表（json 数组）', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'tags';
    EXEC sp_addextendedproperty 'MS_Description', '点赞数', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'thumbNum';
    EXEC sp_addextendedproperty 'MS_Description', '收藏数', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'favourNum';
    EXEC sp_addextendedproperty 'MS_Description', '创建用户 id', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'userId';
    EXEC sp_addextendedproperty 'MS_Description', '创建时间', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'createTime';
    EXEC sp_addextendedproperty 'MS_Description', '更新时间', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'updateTime';
    EXEC sp_addextendedproperty 'MS_Description', '是否删除', 'SCHEMA', 'dbo', 'TABLE', 'post', 'COLUMN', 'isDelete';
    EXEC sp_addextendedproperty 'MS_Description', '帖子', 'SCHEMA', 'dbo', 'TABLE', 'post';
    
    -- 创建索引
    CREATE INDEX idx_userId ON post (userId);
END
GO

-- 帖子点赞表（硬删除）
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='post_thumb' AND xtype='U')
BEGIN
    CREATE TABLE post_thumb (
        id         BIGINT IDENTITY(1,1) PRIMARY KEY,
        postId     BIGINT                           NOT NULL,
        userId     BIGINT                           NOT NULL,
        createTime DATETIME2 DEFAULT GETDATE()     NOT NULL,
        updateTime DATETIME2 DEFAULT GETDATE()     NOT NULL
    );
    
    -- 添加注释
    EXEC sp_addextendedproperty 'MS_Description', 'id', 'SCHEMA', 'dbo', 'TABLE', 'post_thumb', 'COLUMN', 'id';
    EXEC sp_addextendedproperty 'MS_Description', '帖子 id', 'SCHEMA', 'dbo', 'TABLE', 'post_thumb', 'COLUMN', 'postId';
    EXEC sp_addextendedproperty 'MS_Description', '创建用户 id', 'SCHEMA', 'dbo', 'TABLE', 'post_thumb', 'COLUMN', 'userId';
    EXEC sp_addextendedproperty 'MS_Description', '创建时间', 'SCHEMA', 'dbo', 'TABLE', 'post_thumb', 'COLUMN', 'createTime';
    EXEC sp_addextendedproperty 'MS_Description', '更新时间', 'SCHEMA', 'dbo', 'TABLE', 'post_thumb', 'COLUMN', 'updateTime';
    EXEC sp_addextendedproperty 'MS_Description', '帖子点赞', 'SCHEMA', 'dbo', 'TABLE', 'post_thumb';
    
    -- 创建索引
    CREATE INDEX idx_postId_thumb ON post_thumb (postId);
    CREATE INDEX idx_userId_thumb ON post_thumb (userId);
END
GO

-- 帖子收藏表（硬删除）
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='post_favour' AND xtype='U')
BEGIN
    CREATE TABLE post_favour (
        id         BIGINT IDENTITY(1,1) PRIMARY KEY,
        postId     BIGINT                           NOT NULL,
        userId     BIGINT                           NOT NULL,
        createTime DATETIME2 DEFAULT GETDATE()     NOT NULL,
        updateTime DATETIME2 DEFAULT GETDATE()     NOT NULL
    );
    
    -- 添加注释
    EXEC sp_addextendedproperty 'MS_Description', 'id', 'SCHEMA', 'dbo', 'TABLE', 'post_favour', 'COLUMN', 'id';
    EXEC sp_addextendedproperty 'MS_Description', '帖子 id', 'SCHEMA', 'dbo', 'TABLE', 'post_favour', 'COLUMN', 'postId';
    EXEC sp_addextendedproperty 'MS_Description', '创建用户 id', 'SCHEMA', 'dbo', 'TABLE', 'post_favour', 'COLUMN', 'userId';
    EXEC sp_addextendedproperty 'MS_Description', '创建时间', 'SCHEMA', 'dbo', 'TABLE', 'post_favour', 'COLUMN', 'createTime';
    EXEC sp_addextendedproperty 'MS_Description', '更新时间', 'SCHEMA', 'dbo', 'TABLE', 'post_favour', 'COLUMN', 'updateTime';
    EXEC sp_addextendedproperty 'MS_Description', '帖子收藏', 'SCHEMA', 'dbo', 'TABLE', 'post_favour';
    
    -- 创建索引
    CREATE INDEX idx_postId_favour ON post_favour (postId);
    CREATE INDEX idx_userId_favour ON post_favour (userId);
END
GO
