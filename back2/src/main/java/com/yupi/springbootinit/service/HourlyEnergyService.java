package com.yupi.springbootinit.service;

import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyStatistics;

/**
 * 日能耗统计服务
 * <p>
 * 提供指定日期的24小时能耗统计功能
 * 时间范围：当天 07:00 到次日 07:00（共24小时）
 * </p>
 */
public interface HourlyEnergyService {
    
    /**
     * 获取指定日期的24小时能耗统计数据
     * 
     * @param year 年份
     * @param month 月份（1-12）
     * @param day 日期（1-31）
     * @return 日能耗统计数据，包含各车间每小时能耗及总计
     */
    HourlyEnergyStatistics getHourlyStatistics(Integer year, Integer month, Integer day);
}
