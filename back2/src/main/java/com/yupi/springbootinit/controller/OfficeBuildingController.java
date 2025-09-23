package com.yupi.springbootinit.controller;

import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.OfficeBuildingService;
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

@Api(tags = "1#办公楼电能监控数据管理")
@RestController
@RequestMapping("/office-building")
@Slf4j
public class OfficeBuildingController {

    @Autowired
    private OfficeBuildingService officeBuildingService;

    @Autowired
    private TempMonitorCacheLoader tempMonitorCacheLoader;




    @ApiOperation("获取所有车间列表（1#办公楼）")
    @GetMapping("/workshops")
    public BaseResponse<List<String>> getAllWorkshops() {
        List<String> workshops = officeBuildingService.getAllWorkshops();
        return ResultUtils.success(workshops);
    }



    @ApiOperation("获取统计信息（1#办公楼）")
    @GetMapping("/statistics")
    public BaseResponse<TempMonitorStatistics> getStatistics(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        try {
            TempMonitorStatistics statistics = officeBuildingService.getStatistics("1#办公楼", startTime, endTime);
            return ResultUtils.success(statistics);
        } catch (Exception e) {
            log.error("获取统计数据失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取统计数据失败");
        }
    }

    @ApiOperation("获取电能趋势数据（1#办公楼）")
    @GetMapping("/electric-energy-trend")
    public BaseResponse<List<TempMonitor>> getElectricEnergyTrend(
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime,
            @ApiParam("限制数量") @RequestParam(required = false) Integer limit) {
        try {
            String fixedWorkshop = "1#办公楼";
            Integer finalLimit = limit;
            List<TempMonitor> trendData = officeBuildingService.getElectricEnergyTrend(fixedWorkshop, deviceId, startTime, endTime, finalLimit);
            return ResultUtils.success(trendData);
        } catch (Exception e) {
            log.error("获取电能趋势数据失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取电能趋势数据失败");
        }
    }


    @ApiOperation("获取每小时电能消耗数据（1#办公楼，查询模式-历史数据）")
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
            String fixedWorkshop = "1#办公楼";
            log.info("🔵 Controller调用查询模式API: /electric-energy-hourly-consumption-query - 车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}",
                    fixedWorkshop, deviceId, startTime, endTime);
            List<HourlyEnergyConsumption> consumptionData = officeBuildingService.getHourlyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
            return ResultUtils.success(consumptionData);
        } catch (Exception e) {
            log.error("获取每小时电能消耗数据（查询模式）失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每小时电能消耗数据（查询模式）失败");
        }
    }

    @ApiOperation("获取每日电能消耗数据（1#办公楼，查询模式-历史数据）")
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
            String fixedWorkshop = "1#办公楼";
            log.info("🟡 Controller调用日模式查询API: /electric-energy-daily-consumption-query - 车间: {}, 设备: {}, 开始时间: {}, 结束时间: {}",
                    fixedWorkshop, deviceId, startTime, endTime);
            List<DailyEnergyConsumption> consumptionData = officeBuildingService.getDailyEnergyConsumptionQuery(fixedWorkshop, deviceId, startTime, endTime);
            return ResultUtils.success(consumptionData);
        } catch (Exception e) {
            log.error("获取每日电能消耗数据（查询模式）失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每日电能消耗数据（查询模式）失败");
        }
    }

    @ApiOperation("刷新缓存并预加载上个时间段数据（1#办公楼）")
    @PostMapping("/refresh-cache")
    public BaseResponse<Boolean> refreshCache(
            @ApiParam("车间名称，可为空，默认1#办公楼") @RequestParam(required = false) String workshop) {
        try {
            String fixedWorkshop = (workshop == null || workshop.isEmpty()) ? "1#办公楼" : workshop;
            tempMonitorCacheLoader.rebuildOneYearWindow(fixedWorkshop);
            return ResultUtils.success(Boolean.TRUE);
        } catch (Exception e) {
            log.error("刷新缓存失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "刷新缓存失败");
        }
    }

    @ApiOperation("获取电能消耗量（1#办公楼，后端计算差值）")
    @GetMapping("/electric-energy-consumption")
    public BaseResponse<Double> getEnergyConsumption(
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        try {
            Double consumption = officeBuildingService.getEnergyConsumption(startTime, endTime);
            return ResultUtils.success(consumption);
        } catch (Exception e) {
            log.error("获取电能消耗量失败", e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取电能消耗量失败");
        }
    }
}
