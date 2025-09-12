package com.yupi.springbootinit.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yupi.springbootinit.cache.RedisTrendRepository;
import com.yupi.springbootinit.mapper.sqlserver.TempMonitorMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.TrendCacheService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TrendCacheServiceImpl implements TrendCacheService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private RedisTrendRepository redis;

    @Autowired
    private TempMonitorMapper tempMonitorMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getHourSeriesJson() {
        try {
            String ver = redis.get(redis.getVersionKeyHour(WORKSHOP));
            if (ver == null) {
                return null;
            }
            String key = redis.getDataKeyHour(ver, WORKSHOP);
            return redis.get(key);
        } catch (Exception e) {
            log.warn("read hour series from redis failed", e);
            return null;
        }
    }

    @Override
    public String getDaySeriesJson() {
        try {
            String ver = redis.get(redis.getVersionKeyDay(WORKSHOP));
            if (ver == null) {
                return null;
            }
            String key = redis.getDataKeyDay(ver, WORKSHOP);
            return redis.get(key);
        } catch (Exception e) {
            log.warn("read day series from redis failed", e);
            return null;
        }
    }

    @Override
    public Map<String, Object> getStats() {
        try {
            String ver = redis.get(redis.getVersionKeyHour(WORKSHOP));
            if (ver == null) {
                return Collections.emptyMap();
            }
            String key = redis.getStatsKey(ver, WORKSHOP);
            // 这里简单存为 JSON String
            String json = redis.get(key);
            if (json == null) {
                return Collections.emptyMap();
            }
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("read stats from redis failed", e);
            return Collections.emptyMap();
        }
    }

    @Override
    public void preheatAll() {
        String lockKey = redis.getLockKey(WORKSHOP);
        String token = String.valueOf(System.nanoTime());
        boolean locked = redis.tryLock(lockKey, Duration.ofSeconds(60), token);
        if (!locked) {
            log.warn("skip preheat, already running");
            return;
        }
        String oldHourVer = null;
        String oldDayVer = null;
        try {
            oldHourVer = redis.get(redis.getVersionKeyHour(WORKSHOP));
            oldDayVer = redis.get(redis.getVersionKeyDay(WORKSHOP));

            String newVer = String.valueOf(System.currentTimeMillis());

            // 1) 回源构建固定窗口
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime hourStart = now.minusHours(24);
            LocalDateTime dayStart = now.minusDays(7);

            List<HourlyEnergyConsumption> hourList = tempMonitorMapper.selectHourlyEnergyConsumptionQuery(
                    WORKSHOP, null,
                    toDate(hourStart), toDate(now)
            );

            List<DailyEnergyConsumption> dayList = tempMonitorMapper.selectDailyEnergyConsumptionQuery(
                    WORKSHOP, null,
                    toDate(dayStart), toDate(now)
            );

            // 统计：设备数 + 最新总电能（从最新数据取）
            Integer deviceCount = tempMonitorMapper.countDevices(WORKSHOP, null, null);
            List<TempMonitor> latest = tempMonitorMapper.selectByWorkshop(WORKSHOP);
            double totalEnergy = 0d;
            if (latest != null && !latest.isEmpty()) {
                totalEnergy = latest.get(0).getElectricEnergy() == null ? 0d : latest.get(0).getElectricEnergy();
            }

            String hourJson = objectMapper.writeValueAsString(hourList);
            String dayJson = objectMapper.writeValueAsString(dayList);
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalDevices", deviceCount == null ? 0 : deviceCount);
            stats.put("totalElectricEnergy", totalEnergy);
            stats.put("updatedAt", now.format(FORMATTER));
            String statsJson = objectMapper.writeValueAsString(stats);

            // 2) 写临时键
            String hourTmp = redis.getDataKeyHour(newVer, WORKSHOP) + ".tmp";
            String dayTmp = redis.getDataKeyDay(newVer, WORKSHOP) + ".tmp";
            String statsTmp = redis.getStatsKey(newVer, WORKSHOP) + ".tmp";
            redis.set(hourTmp, hourJson);
            redis.set(dayTmp, dayJson);
            redis.set(statsTmp, statsJson);

            // 3) 原子上线（通过 rename）
            String hourKey = redis.getDataKeyHour(newVer, WORKSHOP);
            String dayKey = redis.getDataKeyDay(newVer, WORKSHOP);
            String statsKey = redis.getStatsKey(newVer, WORKSHOP);
            redis.rename(hourTmp, hourKey);
            redis.rename(dayTmp, dayKey);
            redis.rename(statsTmp, statsKey);

            // 4) 切版本指针
            redis.set(redis.getVersionKeyHour(WORKSHOP), newVer);
            redis.set(redis.getVersionKeyDay(WORKSHOP), newVer);

            // 5) 异步删除旧键
            final String oldHour = oldHourVer;
            final String oldDay = oldDayVer;
            new Thread(() -> deleteOldKeys(oldHour, oldDay)).start();

            log.info("preheat done. newVer={}", newVer);
        } catch (Exception e) {
            log.error("preheat failed", e);
        } finally {
            redis.unlock(lockKey, token);
        }
    }

    private void deleteOldKeys(String oldHourVer, String oldDayVer) {
        try {
            if (oldHourVer != null) {
                redis.delete(redis.getDataKeyHour(oldHourVer, WORKSHOP));
            }
            if (oldDayVer != null) {
                redis.delete(redis.getDataKeyDay(oldDayVer, WORKSHOP));
            }
            if (oldHourVer != null) {
                redis.delete(redis.getStatsKey(oldHourVer, WORKSHOP));
            }
        } catch (Exception e) {
            log.warn("delete old keys failed", e);
        }
    }

    private java.util.Date toDate(LocalDateTime ldt) {
        return java.util.Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
    }
}


