package com.yupi.springbootinit.model.dto.tempmonitor;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 每日电能消耗数据 DTO
 * 对应 SQL 查询返回字段：deviceId、name、workshop、day、
 * energyConsumption、startEnergy、endEnergy、startTime、endTime
 * 
 * @author 每天十点睡
 * @date 2026-02-09
 * 修改：使用 BigDecimal 替代 Double，确保精确计算
 */
@Data
public class DailyEnergyConsumption implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 设备ID */
    private String deviceId;

    /** 设备名称 */
    private String name;

    /** 车间 */
    private String workshop;

    /** 日期（天） */
    private Date day;

    /** 当日用电量（kWh，按度数差值计算） */
    private BigDecimal energyConsumption;

    /** 日期开始时间以后最近记录的度数 */
    private BigDecimal startEnergy;

    /** 日期结束时间（或当天最新）以后最近记录的度数 */
    private BigDecimal endEnergy;

    /** 日期开始时间以后最近记录的时间 */
    private Date startTime;

    /** 日期结束时间（或当天最新）以后最近记录的时间 */
    private Date endTime;
}


