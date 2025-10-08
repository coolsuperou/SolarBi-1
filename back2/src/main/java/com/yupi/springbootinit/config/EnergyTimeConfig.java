package com.yupi.springbootinit.config;

/**
 * 🔥 能耗统计时间配置
 * 参考前端 timeFormats.ts 配置
 */
public class EnergyTimeConfig {
    
    // 日模式 - 开始时间
    public static final int DAY_START_HOUR = 7;      // 当前: 2024-01-01 07:00:00
    public static final int DAY_START_MINUTE = 0;
    public static final int DAY_START_SECOND = 0;
    
    // 日模式 - 结束时间  
    public static final int DAY_END_HOUR = 6;        // 时间部分: 06:59:59
    public static final int DAY_END_MINUTE = 59;
    public static final int DAY_END_SECOND = 59;
    public static final int DAY_END_OFFSET = 1;      // 🔥 结束日期偏移天数（0=当天，1=次日）
}