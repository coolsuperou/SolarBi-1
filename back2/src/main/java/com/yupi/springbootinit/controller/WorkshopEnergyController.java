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
import com.yupi.springbootinit.model.enums.WorkshopEnum;
import com.yupi.springbootinit.service.WorkshopEnergyService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

/**
 * 车间能耗统一控制器
 * 处理所有车间的电能监控数据管理接口
 * 通过URL路径动态识别车间,调用统一的WorkshopEnergyService
 * 
 * 验证需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 5.1-5.7, 10.2
 * 
 * @author 欧展煌
 */
@Api(tags = "车间能耗统一管理")
@RestController
@Slf4j
public class WorkshopEnergyController {
    
    @Autowired
    private WorkshopEnergyService workshopEnergyService;
    
    /**
     * 分页查询温湿电能数据（支持多条件查询）
     * 验证需求: 2.1, 2.2, 2.4, 5.1, 5.2, 5.3, 5.4
     * 
     * @param workshopPath URL路径中的车间标识（如 laboratory114, beading-107）
     * @param request 查询请求参数
     * @return 分页结果
     */
    @ApiOperation("分页查询温湿电能数据（支持多条件查询）")
    @PostMapping("/{workshopPath}/query")
    public BaseResponse<Page<TempMonitor>> queryByCondition(
            @PathVariable String workshopPath,
            @RequestBody TempMonitorQueryRequest request) {
        
        try {
            log.info("📋 分页查询请求 - 车间路径: {}, 查询参数: {}", workshopPath, request);
            
            // 1. 根据URL路径查找车间枚举
            WorkshopEnum workshop = WorkshopEnum.getByUrlPath("/" + workshopPath);
            if (workshop == null) {
                log.error("❌ 未找到车间配置 - URL路径: /{}", workshopPath);
                return ResultUtils.error(ErrorCode.NOT_FOUND_ERROR, "未找到车间配置: /" + workshopPath);
            }
            
            // 2. 参数校验
            if (request.getCurrent() <= 0) {
                request.setCurrent(1);
            }
            if (request.getPageSize() <= 0 || request.getPageSize() > 100) {
                request.setPageSize(20);
            }
            
            // 3. 调用统一服务
            Page<TempMonitor> page = workshopEnergyService.queryByCondition(
                workshop.getWorkshopName(), 
                request
            );
            
            log.info("✅ 分页查询成功 - 车间: {}, 总记录数: {}, 当前页: {}", 
                workshop.getWorkshopName(), page.getTotal(), page.getCurrent());
            
            return ResultUtils.success(page);
            
        } catch (Exception e) {
            log.error("❌ 分页查询失败 - 车间路径: {}", workshopPath, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "分页查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取统计数据
     * 验证需求: 2.1, 2.2, 2.5, 5.1, 5.2, 5.3, 5.4
     * 
     * @param workshopPath URL路径中的车间标识
     * @param workshop 车间名称（可选参数,实际使用从URL路径解析的车间名称）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    @ApiOperation("获取统计数据")
    @GetMapping("/{workshopPath}/statistics")
    public BaseResponse<TempMonitorStatistics> getStatistics(
            @PathVariable String workshopPath,
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        
        try {
            log.info("📊 统计数据请求 - 车间路径: {}, 时间范围: {} 到 {}", 
                workshopPath, startTime, endTime);
            
            // 1. 根据URL路径查找车间枚举
            WorkshopEnum workshopEnum = WorkshopEnum.getByUrlPath("/" + workshopPath);
            if (workshopEnum == null) {
                log.error("❌ 未找到车间配置 - URL路径: /{}", workshopPath);
                return ResultUtils.error(ErrorCode.NOT_FOUND_ERROR, "未找到车间配置: /" + workshopPath);
            }
            
            // 2. 调用统一服务
            TempMonitorStatistics statistics = workshopEnergyService.getStatistics(
                workshopEnum.getWorkshopName(), 
                startTime, 
                endTime
            );
            
            log.info("✅ 统计数据获取成功 - 车间: {}, 设备总数: {}", 
                workshopEnum.getWorkshopName(), 
                statistics != null && statistics.getTotalDevices() != null ? statistics.getTotalDevices() : 0);
            
            return ResultUtils.success(statistics);
            
        } catch (Exception e) {
            log.error("❌ 获取统计数据失败 - 车间路径: {}", workshopPath, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取统计数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取每小时电能消耗数据（查询模式-历史数据）
     * 验证需求: 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4, 10.2
     * 
     * @param workshopPath URL路径中的车间标识
     * @param workshop 车间名称（可选参数,实际使用从URL路径解析的车间名称）
     * @param deviceId 设备ID（可选）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 小时能耗列表
     */
    @ApiOperation("获取每小时电能消耗数据（查询模式-历史数据）")
    @GetMapping("/{workshopPath}/electric-energy-hourly-consumption-query")
    public BaseResponse<List<HourlyEnergyConsumption>> getHourlyEnergyConsumptionQuery(
            @PathVariable String workshopPath,
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        
        try {
            // 1. 根据URL路径查找车间枚举
            WorkshopEnum workshopEnum = WorkshopEnum.getByUrlPath("/" + workshopPath);
            if (workshopEnum == null) {
                log.error("❌ 未找到车间配置 - URL路径: /{}", workshopPath);
                return ResultUtils.error(ErrorCode.NOT_FOUND_ERROR, "未找到车间配置: /" + workshopPath);
            }
            
            // 2. 参数校验
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
            
            log.info("🔵 小时能耗查询 - 车间: {}, 设备: {}, 时间范围: {} 到 {}", 
                workshopEnum.getWorkshopName(), deviceId, startTime, endTime);
            
            // 3. 调用统一服务
            List<HourlyEnergyConsumption> consumptionData = workshopEnergyService.getHourlyEnergyConsumption(
                workshopEnum.getWorkshopName(), 
                startTime, 
                endTime
            );
            
            log.info("✅ 小时能耗查询成功 - 车间: {}, 数据条数: {}", 
                workshopEnum.getWorkshopName(), 
                consumptionData != null ? consumptionData.size() : 0);
            
            return ResultUtils.success(consumptionData);
            
        } catch (Exception e) {
            log.error("❌ 获取每小时电能消耗数据失败 - 车间路径: {}", workshopPath, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每小时电能消耗数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 日模式查询
     * 
     * 
     * @param workshopPath URL路径中的车间标识
     * @param workshop 车间名称（可选参数,实际使用从URL路径解析的车间名称）
     * @param deviceId 设备ID（可选）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 日能耗列表
     */
    @ApiOperation("日模式查询")
    @GetMapping("/{workshopPath}/electric-energy-daily-consumption-query")
    public BaseResponse<List<DailyEnergyConsumption>> getDailyEnergyConsumptionQuery(
            @PathVariable String workshopPath,
            @ApiParam("车间") @RequestParam(required = false) String workshop,
            @ApiParam("设备ID") @RequestParam(required = false) String deviceId,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime) {
        
        try {
            // 1. 根据URL路径查找车间枚举
            WorkshopEnum workshopEnum = WorkshopEnum.getByUrlPath("/" + workshopPath);
            if (workshopEnum == null) {
                log.error("❌ 未找到车间配置 - URL路径: /{}", workshopPath);
                return ResultUtils.error(ErrorCode.NOT_FOUND_ERROR, "未找到车间配置: /" + workshopPath);
            }
            
            // 2. 参数校验
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
            
            log.info("🟡 日能耗查询 - 车间: {}, 设备: {}, 时间范围: {} 到 {}", 
                workshopEnum.getWorkshopName(), deviceId, startTime, endTime);
            
            // 3. 调用统一服务
            List<DailyEnergyConsumption> consumptionData = workshopEnergyService.getDailyEnergyConsumption(
                workshopEnum.getWorkshopName(), 
                startTime, 
                endTime
            );
            
            log.info("✅ 日能耗查询成功 - 车间: {}, 数据条数: {}", 
                workshopEnum.getWorkshopName(), 
                consumptionData != null ? consumptionData.size() : 0);
            
            return ResultUtils.success(consumptionData);
            
        } catch (Exception e) {
            log.error("❌ 获取每日电能消耗数据失败 - 车间路径: {}", workshopPath, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取每日电能消耗数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 电能消耗卡片（后端计算差值）
     * 
     * 
     * @param workshopPath URL路径中的车间标识
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param mode 模式：hour/day
     * @return 能耗消耗值
     */
    @ApiOperation("电能消耗卡片（后端计算差值）")
    @GetMapping("/{workshopPath}/electric-energy-consumption")
    public BaseResponse<Double> getEnergyConsumption(
            @PathVariable String workshopPath,
            @ApiParam("开始时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
            @ApiParam("结束时间") @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime,
            @ApiParam("模式：hour/day") @RequestParam(required = false, defaultValue = "hour") String mode) {
        
        try {
            log.info("💳 能耗卡片请求 - 车间路径: {}, 时间范围: {} 到 {}, 模式: {}", 
                workshopPath, startTime, endTime, mode);
            
            // 1. 根据URL路径查找车间枚举
            WorkshopEnum workshopEnum = WorkshopEnum.getByUrlPath("/" + workshopPath);
            if (workshopEnum == null) {
                log.error("❌ 未找到车间配置 - URL路径: /{}", workshopPath);
                return ResultUtils.error(ErrorCode.NOT_FOUND_ERROR, "未找到车间配置: /" + workshopPath);
            }
            
            // 2. 调用统一服务
            Double consumption = workshopEnergyService.getEnergyConsumption(
                workshopEnum.getWorkshopName(), 
                startTime, 
                endTime, 
                mode
            );
            
            log.info("✅ 能耗卡片获取成功 - 车间: {}, 能耗值: {}", 
                workshopEnum.getWorkshopName(), consumption);
            
            return ResultUtils.success(consumption);
            
        } catch (Exception e) {
            log.error("❌ 获取电能消耗量失败 - 车间路径: {}", workshopPath, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "获取电能消耗量失败: " + e.getMessage());
        }
    }
}
