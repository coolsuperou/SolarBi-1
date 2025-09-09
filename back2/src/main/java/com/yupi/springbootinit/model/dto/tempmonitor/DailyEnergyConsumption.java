package com.yupi.springbootinit.model.dto.tempmonitor;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 每日电能消耗数据 DTO
 * 对应 SQL 查询返回字段：deviceId、name、workshop、day、
 * energyConsumption、startEnergy、endEnergy、startTime、endTime
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
    private Double energyConsumption;

    /** 日期开始时间以后最近记录的度数 */
    private Double startEnergy;

    /** 日期结束时间（或当天最新）以后最近记录的度数 */
    private Double endEnergy;

    /** 日期开始时间以后最近记录的时间 */
    private Date startTime;

    /** 日期结束时间（或当天最新）以后最近记录的时间 */
    private Date endTime;
}


