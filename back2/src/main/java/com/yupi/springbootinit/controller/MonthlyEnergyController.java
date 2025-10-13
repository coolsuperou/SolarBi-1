package com.yupi.springbootinit.controller;

import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.model.dto.tempmonitor.MonthlyEnergyStatistics;
import com.yupi.springbootinit.service.MonthlyEnergyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 月度能耗统计接口
 */
@RestController
@RequestMapping("/monthly")
@Slf4j
public class MonthlyEnergyController {

    @Resource
    private MonthlyEnergyService monthlyEnergyService;

    /**
     * 获取月度能耗统计数据
     * @param year 年份
     * @param month 月份（1-12）
     * @param request HTTP请求对象
     * @return 月度统计数据
     */
    @GetMapping("/statistics")
    public BaseResponse<MonthlyEnergyStatistics> getMonthlyStatistics(
            @RequestParam Integer year,
            @RequestParam Integer month,
            HttpServletRequest request) {
        log.info("📊 接收月度能耗统计请求: {}年{}月", year, month);
        
        try {
            MonthlyEnergyStatistics statistics = monthlyEnergyService.getMonthlyStatistics(year, month, request);
            log.info("✅ 月度统计完成: {}个车间, 总能耗={} kWh", 
                    statistics.getWorkshopList().size(), 
                    String.format("%.2f", statistics.getMonthlyTotal()));
            return ResultUtils.success(statistics);
        } catch (Exception e) {
            log.error("❌ 月度统计失败: {}年{}月", year, month, e);
            return ResultUtils.error(500, "统计失败: " + e.getMessage());
        }
    }
}
