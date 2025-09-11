package com.yupi.springbootinit.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.cache.CacheManagerCustomizer;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class CacheConfig {

    /**
     * 缓存命名空间（Redis 中的 cacheName 前缀），统一由 Spring Cache 管理。
     * 注意：本项目采用“仅手动刷新”的策略，TTL 统一为不过期（Duration.ZERO），
     * 通过控制器的刷新接口清空+预热缓存，日常查询只读取缓存，不直接访问数据库。
     *
     * Redis Key 结构：<cacheName>::<key>
     * - 序列化：GenericJackson2JsonRedisSerializer（JSON）
     * - 禁止缓存 null 值
     */
    public static final String CACHE_LATEST_DATA = "tempMonitor:latest";
    // 最新一批监控数据（列表），用于首页/快速展示
    public static final String CACHE_BY_WORKSHOP = "tempMonitor:byWorkshop";
    // 按车间聚合的数据列表，key = 车间名（为空时存 ALL）
    public static final String CACHE_WORKSHOPS = "tempMonitor:workshops";
    // 车间名称列表
    public static final String CACHE_BY_DEVICE = "tempMonitor:byDevice";
    // 按设备ID的数据列表，key = 设备ID
    public static final String CACHE_STATISTICS = "tempMonitor:statistics";
    // 统计信息（设备数、温湿度等），key = 车间 + 起止时间戳
    public static final String CACHE_TREND = "tempMonitor:trend";
    // 电能趋势（曲线），key = 车间 + 设备 + 起止时间戳 + limit
    public static final String CACHE_HOURLY_CONS = "tempMonitor:hourlyConsumption";
    // 每小时电能消耗（默认模式）
    public static final String CACHE_HOURLY_CONS_QUERY = "tempMonitor:hourlyConsumptionQuery";
    // 每小时电能消耗（查询模式）
    public static final String CACHE_DAILY_CONS_QUERY = "tempMonitor:dailyConsumptionQuery";
    // 每日电能消耗（查询模式）
    public static final String CACHE_QUERY_PAGE = "tempMonitor:queryPage";
    // 分页多条件查询结果，key 覆盖所有查询条件 + 分页参数

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        // Use a dedicated serializer that does not mutate global MVC ObjectMapper
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(new ObjectMapper());

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                // 统一设置为不过期：只在“刷新数据”时清空并预热缓存
                .entryTtl(Duration.ZERO)
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        // 逐类显式指定“不过期”，便于后续针对单类做差异化策略
        cacheConfigs.put(CACHE_LATEST_DATA, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_BY_WORKSHOP, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_WORKSHOPS, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_BY_DEVICE, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_STATISTICS, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_TREND, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_HOURLY_CONS, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_HOURLY_CONS_QUERY, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_DAILY_CONS_QUERY, defaultConfig.entryTtl(Duration.ZERO));
        cacheConfigs.put(CACHE_QUERY_PAGE, defaultConfig.entryTtl(Duration.ZERO));

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}


