package com.yupi.springbootinit.controller;

import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyStatistics;
import com.yupi.springbootinit.service.HourlyEnergyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 日能耗统计接口
 */
@RestController
@RequestMapping("/hourly")
@Slf4j
public class HourlyEnergyController {

    @Resource
    private HourlyEnergyService hourlyEnergyService;

    /**
     * 获取指定日期的24小时能耗统计数据
     * @param year 年份
     * @param month 月份（1-12）
     * @param day 日期（1-31）
     * @param request HTTP请求对象
     * @return 日能耗统计数据
     */
    @GetMapping("/statistics")
    public BaseResponse<HourlyEnergyStatistics> getHourlyStatistics(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam Integer day,
            HttpServletRequest request) {
        log.info("📊 接收日能耗统计请求: {}年{}月{}日", year, month, day);
        
        // 参数验证
        if (year == null || month == null || day == null) {
            log.error("❌ 参数不完整: year={}, month={}, day={}", year, month, day);
            return ResultUtils.error(400, "参数不完整，请提供年、月、日");
        }
        
        if (month < 1 || month > 12) {
            log.error("❌ 月份无效: {}", month);
            return ResultUtils.error(400, "月份必须在1-12之间");
        }
        
        if (day < 1 || day > 31) {
            log.error("❌ 日期无效: {}", day);
            return ResultUtils.error(400, "日期必须在1-31之间");
        }
        
        try {
            HourlyEnergyStatistics statistics = hourlyEnergyService.getHourlyStatistics(year, month, day, request);
            log.info("✅ 日能耗统计完成: {}个车间", statistics.getWorkshopList().size());
            return ResultUtils.success(statistics);
        } catch (Exception e) {
            log.error("❌ 日能耗统计失败: {}年{}月{}日", year, month, day, e);
            return ResultUtils.error(500, "统计失败: " + e.getMessage());
        }
    }
}
