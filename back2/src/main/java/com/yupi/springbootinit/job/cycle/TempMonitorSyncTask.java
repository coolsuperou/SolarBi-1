package com.yupi.springbootinit.job.cycle;

import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.TempMonitorService;
import org.springframework.cache.annotation.CacheEvict;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * TempMonitor数据同步定时任务
 * 与前端保持一致的刷新频率：
 * - 在每小时的x1:54时同步数据（01:54, 11:54, 21:54, 31:54, 41:54, 51:54）
 * - 与数据库数据更新时间保持一致
 * 
 * @author yupi
 */
@Component
@Slf4j
public class TempMonitorSyncTask {

    @Autowired
    private TempMonitorService tempMonitorService;

    /**
     * 在每小时的x1:54时同步最新数据
     * 对应前端图表数据的刷新频率（01:54, 11:54, 21:54, 31:54, 41:54, 51:54）
     */
    @Scheduled(cron = "54 1,11,21,31,41,51 * * * ?")
    @CacheEvict(cacheNames = {
            com.yupi.springbootinit.config.CacheConfig.CACHE_LATEST_DATA,
            com.yupi.springbootinit.config.CacheConfig.CACHE_BY_WORKSHOP,
            com.yupi.springbootinit.config.CacheConfig.CACHE_WORKSHOPS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_BY_DEVICE,
            com.yupi.springbootinit.config.CacheConfig.CACHE_STATISTICS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_TREND,
            com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS_QUERY,
            com.yupi.springbootinit.config.CacheConfig.CACHE_DAILY_CONS_QUERY
    }, allEntries = true, beforeInvocation = true)
    public void syncLatestData() {
        try {
            // 获取最新数据用于图表显示
            // 这里预加载数据，前端请求时可以从缓存快速获取
            List<TempMonitor> latestData = tempMonitorService.getLatestData();
            if (latestData != null && !latestData.isEmpty()) {
                log.info("TempMonitor图表数据同步完成，同步时间: {}, 数据条数: {}", 
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), 
                    latestData.size());
            }
        } catch (Exception e) {
            log.error("TempMonitor图表数据同步失败", e);
        }
    }

    /**
     * 在每小时的x1:54时刷新统计数据和完整数据集
     * 对应前端表格数据的刷新频率（01:54, 11:54, 21:54, 31:54, 41:54, 51:54）
     */
    @Scheduled(cron = "54 1,11,21,31,41,51 * * * ?")
    @CacheEvict(cacheNames = {
            com.yupi.springbootinit.config.CacheConfig.CACHE_LATEST_DATA,
            com.yupi.springbootinit.config.CacheConfig.CACHE_BY_WORKSHOP,
            com.yupi.springbootinit.config.CacheConfig.CACHE_WORKSHOPS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_BY_DEVICE,
            com.yupi.springbootinit.config.CacheConfig.CACHE_STATISTICS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_TREND,
            com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS_QUERY,
            com.yupi.springbootinit.config.CacheConfig.CACHE_DAILY_CONS_QUERY
    }, allEntries = true, beforeInvocation = true)
    public void syncFullData() {
        try {
            // 刷新114_空调水机主机的完整数据
            tempMonitorService.getDataByWorkshop("114_空调水机主机");
            
            // 刷新统计数据
            tempMonitorService.getStatistics("114_空调水机主机", null, null);
            
            log.info("TempMonitor完整数据和统计数据同步完成，同步时间: {}", 
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        } catch (Exception e) {
            log.error("TempMonitor完整数据同步失败", e);
        }
    }

    /**
     * 在每小时的x1:54时同步电能趋势数据
     * 与图表数据刷新频率保持一致（01:54, 11:54, 21:54, 31:54, 41:54, 51:54）
     */
    @Scheduled(cron = "54 1,11,21,31,41,51 * * * ?")
    @CacheEvict(cacheNames = {
            com.yupi.springbootinit.config.CacheConfig.CACHE_LATEST_DATA,
            com.yupi.springbootinit.config.CacheConfig.CACHE_BY_WORKSHOP,
            com.yupi.springbootinit.config.CacheConfig.CACHE_WORKSHOPS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_BY_DEVICE,
            com.yupi.springbootinit.config.CacheConfig.CACHE_STATISTICS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_TREND,
            com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS_QUERY,
            com.yupi.springbootinit.config.CacheConfig.CACHE_DAILY_CONS_QUERY
    }, allEntries = true, beforeInvocation = true)
    public void syncElectricEnergyTrend() {
        try {
            // 获取114_空调水机主机的电能趋势数据
            List<TempMonitor> trendData = tempMonitorService.getElectricEnergyTrend("114_空调水机主机", null, null, null, 120);
            if (trendData != null && !trendData.isEmpty()) {
                log.info("TempMonitor电能趋势数据同步完成，同步时间: {}, 数据条数: {}", 
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), 
                    trendData.size());
            }
        } catch (Exception e) {
            log.error("TempMonitor电能趋势数据同步失败", e);
        }
    }
}
