package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.TempMonitorService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.Assert;
import org.springframework.cache.annotation.CacheEvict;

import java.util.Date;
import java.util.List;

/**
 * 温湿电能监控数据接口
 * 
 * @author yupi
 */
@Api(tags = "温湿电能监控数据管理")
@RestController
@RequestMapping("/temp-monitor")
@Slf4j
public class TempMonitorController {

    @Autowired
    private TempMonitorService tempMonitorService;

    @ApiOperation("获取最新温湿电能数据")
    @GetMapping("/latest")
    public BaseResponse<List<TempMonitor>> getLatestData() {
        List<TempMonitor> dataList = tempMonitorService.getLatestData();
        return ResultUtils.success(dataList);
    }

    @ApiOperation("按车间查询温湿电能数据")
    @GetMapping("/workshop/{workshop}")
    public BaseResponse<List<TempMonitor>> getDataByWorkshop(
            @ApiParam("车间名称") @PathVariable String workshop) {
        List<TempMonitor> dataList = tempMonitorService.getDataByWorkshop(workshop);
        return ResultUtils.success(dataList);
    }

    @ApiOperation("获取所有车间列表")
    @GetMapping("/workshops")
    public BaseResponse<List<String>> getAllWorkshops() {
        List<String> workshops = tempMonitorService.getAllWorkshops();
        return ResultUtils.success(workshops);
    }

    @ApiOperation("根据设备ID查询温湿电能数据")
    @GetMapping("/device/{deviceId}")
    public BaseResponse<List<TempMonitor>> getDataByDeviceId(
            @ApiParam("设备ID") @PathVariable String deviceId) {
        List<TempMonitor> dataList = tempMonitorService.getDataByDeviceId(deviceId);
        return ResultUtils.success(dataList);
    }

    @ApiOperation("分页查询温湿电能数据（支持多条件查询）")
    @PostMapping("/query")
    public BaseResponse<Page<TempMonitor>> queryByCondition(@RequestBody TempMonitorQueryRequest request) {
        // 设置默认分页参数
        if (request.getCurrent() <= 0) {
            request.setCurrent(1);
        }
        if (request.getPageSize() <= 0 || request.getPageSize() > 100) {
            request.setPageSize(20);
        }
        
        Page<TempMonitor> page = tempMonitorService.queryByCondition(request);
        return ResultUtils.success(page);
    }

    @ApiOperation("获取温湿电能数据统计信息")
    @GetMapping("/statistics")
    public BaseResponse<TempMonitorStatistics> getStatistics(
            @ApiParam("车间名称") @RequestParam(required = false) String workshop,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        // 后端时间范围校验：如果两者都传，必须 end > start 且范围合理
        if (startTime != null && endTime != null) {
            if (!endTime.after(startTime)) {
                return ResultUtils.error(ErrorCode.PARAMS_ERROR, "结束时间必须晚于开始时间");
            }
            long diffMs = endTime.getTime() - startTime.getTime();
            long diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays > 31) {
                return ResultUtils.error(ErrorCode.PARAMS_ERROR, "时间范围过大，请选择不超过31天");
            }
        }
        TempMonitorStatistics statistics = tempMonitorService.getStatistics(workshop, startTime, endTime);
        return ResultUtils.success(statistics);
    }

    @ApiOperation("获取设备数量统计")
    @GetMapping("/device-count")
    public BaseResponse<Integer> getDeviceCount(
            @ApiParam("车间名称") @RequestParam(required = false) String workshop,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        Integer count = tempMonitorService.getDeviceCount(workshop, startTime, endTime);
        return ResultUtils.success(count);
    }

    @ApiOperation("获取电能趋势数据（固定114_空调水机主机）")
    @GetMapping("/electric-energy-trend")
    public BaseResponse<List<TempMonitor>> getElectricEnergyTrend(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime,
            @ApiParam("限制数量") @RequestParam(required = false) Integer limit) {
        try {
            // 强制限定车间为 114_空调水机主机
            String fixedWorkshop = "114_空调水机主机";
            
            // 只有实时模式需要限制数量，其他情况都不限制
            Integer finalLimit = limit;
            // 如果没有指定limit，则不限制数量，返回所有数据
            
            List<TempMonitor> trendData = tempMonitorService.getElectricEnergyTrend(fixedWorkshop, deviceId, startTime, endTime, finalLimit);
            return ResultUtils.success(trendData);
        } catch (Exception e) {
            log.error("获取电能趋势数据失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取电能趋势数据失败");
        }
    }

    @ApiOperation("获取每小时电能消耗数据（默认模式-实时更新）- 最新小时用最新记录减去开始时间记录")
    @GetMapping("/electric-energy-hourly-consumption")
    public BaseResponse<List<HourlyEnergyConsumption>> getHourlyEnergyConsumption(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        try {
            // 小时模式后端校验：若两者都传，最大 7 天
            if (startTime != null && endTime != null) {
                if (!endTime.after(startTime)) {
                    return ResultUtils.error(ErrorCode.PARAMS_ERROR, "结束时间必须晚于开始时间");
                }
                long diffMs = endTime.getTime() - startTime.getTime();
                long diffDays = diffMs / (1000 * 60 * 60 * 24);
                if (diffDays > 7) {
                    return ResultUtils.error(ErrorCode.PARAMS_ERROR, "小时模式时间范围过大，请选择不超过7天");
                }
            }
            // 强制限定车间为 114_空调水机主机
            String fixedWorkshop = "114_空调水机主机";
            
            log.info("🔴 Controller调用默认模式API: /electric-energy-hourly-consumption - 车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", 
                fixedWorkshop, deviceId, startTime, endTime);

            List<HourlyEnergyConsumption> consumptionData = tempMonitorService.getHourlyEnergyConsumption(fixedWorkshop, deviceId, startTime, endTime);
            return ResultUtils.success(consumptionData);
        } catch (Exception e) {
            log.error("获取每小时电能消耗数据失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每小时电能消耗数据失败");
        }
    }

    @ApiOperation("获取每小时电能消耗数据（查询模式-历史数据）- 所有小时都用标准逻辑")
    @GetMapping("/electric-energy-hourly-consumption-query")
    public BaseResponse<List<HourlyEnergyConsumption>> getHourlyEnergyConsumptionQuery(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        try {
            // 小时模式查询后端校验：若两者都传，最大 31 天（历史查询可以放宽）
            if (startTime != null && endTime != null) {
                if (!endTime.after(startTime)) {
                    return ResultUtils.error(ErrorCode.PARAMS_ERROR, "结束时间必须晚于开始时间");
                }
                long diffMs = endTime.getTime() - startTime.getTime();
                long diffDays = diffMs / (1000 * 60 * 60 * 24);
                if (diffDays > 31) {
                    return ResultUtils.error(ErrorCode.PARAMS_ERROR, "时间范围过大，请选择不超过31天");
                }
            }
            // 强制限定车间为 114_空调水机主机
            String fixedWorkshop = "114_空调水机主机";
            
            log.info("🔵 Controller调用查询模式API: /electric-energy-hourly-consumption-query - 车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", 
                fixedWorkshop, deviceId, startTime, endTime);

            List<HourlyEnergyConsumption> consumptionData = tempMonitorService.getHourlyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
            return ResultUtils.success(consumptionData);
        } catch (Exception e) {
            log.error("获取每小时电能消耗数据（查询模式）失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每小时电能消耗数据（查询模式）失败");
        }
    }

    @ApiOperation("获取每日电能消耗数据（查询模式-历史数据）- 结束日期以后最新记录减去开始日期以后最新记录")
    @GetMapping("/electric-energy-daily-consumption-query")
    public BaseResponse<List<DailyEnergyConsumption>> getDailyEnergyConsumptionQuery(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        try {
            // 日模式查询后端校验：若两者都传，最大 90 天
            if (startTime != null && endTime != null) {
                if (!endTime.after(startTime)) {
                    return ResultUtils.error(ErrorCode.PARAMS_ERROR, "结束时间必须晚于开始时间");
                }
                long diffMs = endTime.getTime() - startTime.getTime();
                long diffDays = diffMs / (1000 * 60 * 60 * 24);
                if (diffDays > 90) {
                    return ResultUtils.error(ErrorCode.PARAMS_ERROR, "日模式时间范围过大，请选择不超过90天");
                }
            }
            // 强制限定车间为 114_空调水机主机
            String fixedWorkshop = "114_空调水机主机";
            
            log.info("🟡 Controller调用日模式查询API: /electric-energy-daily-consumption-query - 车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}", 
                fixedWorkshop, deviceId, startTime, endTime);

            List<DailyEnergyConsumption> consumptionData = tempMonitorService.getDailyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
            return ResultUtils.success(consumptionData);
        } catch (Exception e) {
            log.error("获取每日电能消耗数据（查询模式）失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每日电能消耗数据（查询模式）失败");
        }
    }

    /**
     * 刷新缓存并预加载上个时间段数据
     * 使用说明：
     * 1) 先对所有与 TempMonitor 相关的缓存空间执行清空（@CacheEvict allEntries=true），
     * 2) 再调用带有 @Cacheable 的服务方法进行“预热”，保证刷新后前端立即命中缓存。
     *
     * 缓存策略：全局不过期（Duration.ZERO），只在手动刷新时更新。
     */
    @ApiOperation("刷新缓存并预加载上个时间段数据")
    @PostMapping("/refresh-cache")
    @CacheEvict(cacheNames = {
            com.yupi.springbootinit.config.CacheConfig.CACHE_LATEST_DATA,
            com.yupi.springbootinit.config.CacheConfig.CACHE_BY_WORKSHOP,
            com.yupi.springbootinit.config.CacheConfig.CACHE_WORKSHOPS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_BY_DEVICE,
            com.yupi.springbootinit.config.CacheConfig.CACHE_STATISTICS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_TREND,
            com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS,
            com.yupi.springbootinit.config.CacheConfig.CACHE_HOURLY_CONS_QUERY,
            com.yupi.springbootinit.config.CacheConfig.CACHE_DAILY_CONS_QUERY,
            com.yupi.springbootinit.config.CacheConfig.CACHE_QUERY_PAGE
    }, allEntries = true, beforeInvocation = true)
    public BaseResponse<Boolean> refreshCache(
            @ApiParam("车间名称，可为空，默认114_空调水机主机") @RequestParam(required = false) String workshop) {
        try {
            String fixedWorkshop = (workshop == null || workshop.isEmpty()) ? "114_空调水机主机" : workshop;

            // 触发服务层加载，利用@Cacheable预热缓存
            tempMonitorService.getLatestData();
            tempMonitorService.getDataByWorkshop(fixedWorkshop);
            tempMonitorService.getAllWorkshops();
            tempMonitorService.getStatistics(fixedWorkshop, null, null);
            tempMonitorService.getElectricEnergyTrend(fixedWorkshop, null, null, null, 120);
            // 小时与日的查询模式按照最近范围预热（由业务SQL决定范围）
            tempMonitorService.getHourlyEnergyConsumption(fixedWorkshop, null, null, null);
            tempMonitorService.getHourlyEnergyConsumptionQuery(fixedWorkshop, null, null, null);
            tempMonitorService.getDailyEnergyConsumptionQuery(fixedWorkshop, null, null, null);

            return ResultUtils.success(Boolean.TRUE);
        } catch (Exception e) {
            log.error("刷新缓存失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "刷新缓存失败");
        }
    }
}
