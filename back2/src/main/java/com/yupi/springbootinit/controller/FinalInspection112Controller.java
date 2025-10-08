package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.FinalInspection112Service;
import com.yupi.springbootinit.service.cache.TempMonitorCacheLoader;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@Api(tags = "112终检车间电能监控数据管理")
@RestController
@RequestMapping("/final-inspection-112")
@Slf4j
public class FinalInspection112Controller {

    @Autowired
    private FinalInspection112Service finalInspection112Service;

    @Autowired
    private TempMonitorCacheLoader tempMonitorCacheLoader;


    @ApiOperation("分页查询温湿电能数据（112终检，支持多条件查询）")
    @PostMapping("/query")
    public BaseResponse<Page<TempMonitor>> queryByCondition(@RequestBody TempMonitorQueryRequest request) {
        if (request.getCurrent() <= 0) {
            request.setCurrent(1);
        }
        if (request.getPageSize() <= 0 || request.getPageSize() > 100) {
            request.setPageSize(20);
        }
        Page<TempMonitor> page = finalInspection112Service.queryByCondition(request);
        return ResultUtils.success(page);
    }



    @ApiOperation("总电能消耗（112终检）")
    @GetMapping("/statistics")
    public BaseResponse<TempMonitorStatistics> getStatistics(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        try {
            TempMonitorStatistics statistics = finalInspection112Service.getStatistics("112终检", startTime, endTime);
            return ResultUtils.success(statistics);
        } catch (Exception e) {
            log.error("获取统计数据失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取统计数据失败");
        }
    }

    @ApiOperation("获取每小时电能消耗数据（112终检，查询模式-历史数据）")
    @GetMapping("/electric-energy-hourly-consumption-query")
    public BaseResponse<List<HourlyEnergyConsumption>> getHourlyEnergyConsumptionQuery(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        try {
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
            String fixedWorkshop = "112终检";
            log.info("🔵 Controller调用查询模式API: /electric-energy-hourly-consumption-query - 车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}",
                    fixedWorkshop, deviceId, startTime, endTime);
            List<HourlyEnergyConsumption> consumptionData = finalInspection112Service.getHourlyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
            return ResultUtils.success(consumptionData);
        } catch (Exception e) {
            log.error("获取每小时电能消耗数据（查询模式）失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每小时电能消耗数据（查询模式）失败");
        }
    }

    @ApiOperation("日模式查询（112终检）")
    @GetMapping("/electric-energy-daily-consumption-query")
    public BaseResponse<List<DailyEnergyConsumption>> getDailyEnergyConsumptionQuery(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        try {
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
            String fixedWorkshop = "112终检";
            log.info("🟡 Controller调用日模式查询API: /electric-energy-daily-consumption-query - 车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}",
                    fixedWorkshop, deviceId, startTime, endTime);
            List<DailyEnergyConsumption> consumptionData = finalInspection112Service.getDailyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
            return ResultUtils.success(consumptionData);
        } catch (Exception e) {
            log.error("获取每日电能消耗数据（查询模式）失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每日电能消耗数据（查询模式）失败");
        }
    }

    @ApiOperation("电能消耗卡片（112终检，后端计算差值）")
    @GetMapping("/electric-energy-consumption")
    public BaseResponse<Double> getEnergyConsumption(
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime,
            @ApiParam("模式：hour/day") @RequestParam(required = false, defaultValue = "hour") String mode) {
        try {
            Double consumption = finalInspection112Service.getEnergyConsumption(startTime, endTime, mode);
            return ResultUtils.success(consumption);
        } catch (Exception e) {
            log.error("获取电能消耗量失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取电能消耗量失败");
        }
    }

    @ApiOperation("刷新缓存并预加载上个时间段数据（112终检）")
    @PostMapping("/refresh-cache")
    public BaseResponse<Boolean> refreshCache(
            @ApiParam("车间名称，可为空，默认112终检") @RequestParam(required = false) String workshop) {
        try {
            String fixedWorkshop = (workshop == null || workshop.isEmpty()) ? "112终检" : workshop;
            tempMonitorCacheLoader.rebuildOneYearWindow(fixedWorkshop);
            return ResultUtils.success(Boolean.TRUE);
        } catch (Exception e) {
            log.error("刷新缓存失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "刷新缓存失败");
        }
    }
}