package com.yupi.springbootinit.model.dto.tempmonitor;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 月度能耗统计数据 DTO
 * 
 * @author 每天十点睡
 * @date 2026-02-09
 * 修改：使用 BigDecimal 替代 Double，确保精确计算
 */
@Data
public class MonthlyEnergyStatistics implements Serializable {
    
    /**
     * 年份
     */
    private Integer year;
    
    /**
     * 月份
     */
    private Integer month;
    
    /**
     * 该月天数
     */
    private Integer daysInMonth;
    
    /**
     * 车间列表（动态获取，按名称排序）
     */
    private List<String> workshopList;
    
    /**
     * 各车间的每日能耗数据
     * key: 车间名称, value: 每日能耗列表（按日期顺序，索引0表示1号）
     */
    private Map<String, List<BigDecimal>> workshopDailyData;
    
    /**
     * 各车间的月度总能耗
     * key: 车间名称, value: 月度总能耗
     */
    private Map<String, BigDecimal> workshopMonthlyTotal;
    
    /**
     * 每日全部车间的总能耗
     */
    private List<BigDecimal> dailyTotal;
    
    /**
     * 月度总能耗
     */
    private BigDecimal monthlyTotal;
    
    private static final long serialVersionUID = 1L;
}


