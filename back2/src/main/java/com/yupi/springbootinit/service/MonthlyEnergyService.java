package com.yupi.springbootinit.service;

import com.yupi.springbootinit.model.dto.tempmonitor.MonthlyEnergyStatistics;

/**
 * 月度能耗统计服务
 */
public interface MonthlyEnergyService {
    
    /**
     * 获取月度能耗统计数据
     * @param year 年份
     * @param month 月份
     * @return 月度统计数据
     */
    MonthlyEnergyStatistics getMonthlyStatistics(Integer year, Integer month);
}


