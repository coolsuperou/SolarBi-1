package com.yupi.springbootinit.service.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yupi.springbootinit.mapper.sqlserver.TempMonitorMapper;
import com.yupi.springbootinit.model.entity.TempMonitor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * 将一年窗口内的 TempMonitor 明细与索引全量构建到 Redis 命名空间，完成后原子切换。
 */
@Service
@Slf4j
public class TempMonitorCacheLoader {

    private static final int BATCH_LIMIT = 5000;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private TempMonitorMapper tempMonitorMapper;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private RedisNamespaceService namespaceService;

    @Autowired
    private java.util.concurrent.ThreadPoolExecutor threadPoolExecutor;

    public void rebuildOneYearWindow(String fixedWorkshop) {
        // 一年窗口：now - 365d 到 now
        Date end = new Date();
        Date start = Date.from(Instant.ofEpochMilli(end.getTime()).minus(365, ChronoUnit.DAYS));
        rebuildRange(start, end, fixedWorkshop);
    }

    public void rebuildRange(Date start, Date end, String fixedWorkshop) {
        String newNs = "v" + System.currentTimeMillis();
        String oldNs = namespaceService.getActiveNamespace();
        log.info("开始重建 TempMonitor Redis 缓存，命名空间: {}, 时间范围: {} ~ {}", newNs, start, end);

        long lastId = 0L;
        int total = 0;

        // 预先写入基础集合，避免空读
        execPipelined(conn -> {
            conn.sAdd(bytes(key(newNs, "tempMonitor:s:workshops")), bytes(fixedWorkshop));
            return null;
        });

        while (true) {
            List<TempMonitor> batch = tempMonitorMapper.selectBatchByIdRange(fixedWorkshop, start, end, lastId, BATCH_LIMIT);
            if (batch == null || batch.isEmpty()) break;
            lastId = Optional.ofNullable(batch.get(batch.size() - 1).getId()).map(Integer::longValue).orElse(lastId);
            total += batch.size();

            final long maxIdInBatch = lastId;
            execPipelined(conn -> {
                for (TempMonitor r : batch) {
                    try {
                        if (r == null || r.getUpdateTime() == null) continue;
                        String deviceId = nvl(r.getDeviceId(), "unknown");
                        String workshop = fixedWorkshop; // 仅同步指定车间
                        long ts = r.getUpdateTime().getTime();
                        String json = objectMapper.writeValueAsString(r);

                        // 索引集合
                        conn.sAdd(bytes(key(newNs, "tempMonitor:s:devices")), bytes(deviceId));
                        conn.sAdd(bytes(key(newNs, "tempMonitor:s:devices:byWorkshop:" + workshop)), bytes(deviceId));

                        // 时序数据
                        conn.zAdd(bytes(key(newNs, "tempMonitor:z:byDevice:" + deviceId)), (double) ts, bytes(json));
                        conn.zAdd(bytes(key(newNs, "tempMonitor:z:byWorkshop:" + workshop)), (double) ts, bytes(json));

                        // 最新快照（直接覆盖）
                        conn.hSet(bytes(key(newNs, "tempMonitor:h:latestByDevice")), bytes(deviceId), bytes(json));
                    } catch (Exception e) {
                        log.warn("写入Redis批次记录失败: {}", e.getMessage());
                    }
                }
                return null;
            });

            log.info("已写入Redis批次，累计: {}，lastId={}", total, maxIdInBatch);
        }

        // 原子切换
        namespaceService.switchActiveNamespace(newNs);
        log.info("完成重建 TempMonitor Redis 缓存，命名空间已切换到: {}，累计写入: {}", newNs, total);

        // 异步清理旧命名空间
        if (oldNs != null && !oldNs.equals(newNs)) {
            final String nsToClean = oldNs;
            threadPoolExecutor.submit(() -> {
                try {
                    cleanupNamespace(nsToClean);
                } catch (Exception e) {
                    log.warn("清理旧命名空间失败: {}", e.getMessage());
                }
            });
        }
    }

    private void cleanupNamespace(String ns) {
        String pattern = ns + ":*";
        log.info("开始清理旧命名空间: {}，匹配模式: {}", ns, pattern);
        stringRedisTemplate.execute((RedisCallback<Void>) conn -> {
            ScanOptions options = ScanOptions.scanOptions().match(pattern).count(1000).build();
            try (Cursor<byte[]> cursor = conn.scan(options)) {
                java.util.List<byte[]> batch = new java.util.ArrayList<>(1000);
                while (cursor.hasNext()) {
                    batch.add(cursor.next());
                    if (batch.size() >= 1000) {
                        conn.del(batch.toArray(new byte[batch.size()][]));
                        batch.clear();
                    }
                }
                if (!batch.isEmpty()) {
                    conn.del(batch.toArray(new byte[batch.size()][]));
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return null;
        });
        log.info("完成清理旧命名空间: {}", ns);
    }

    private byte[] bytes(String s) {
        return s == null ? new byte[0] : s.getBytes();
    }

    private String key(String ns, String suffix) {
        return namespaceService.buildKey(ns, suffix);
    }

    private <T> T execPipelined(RedisCallback<T> action) {
        try {
            List<Object> res = stringRedisTemplate.executePipelined(action);
            return null;
        } catch (Exception e) {
            throw new DataAccessResourceFailureException("Redis pipeline failed", e);
        }
    }

    private String nvl(String v, String def) {
        return (v == null || v.isEmpty()) ? def : v;
    }
}


