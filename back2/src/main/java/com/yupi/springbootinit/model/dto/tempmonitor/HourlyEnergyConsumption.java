package com.yupi.springbootinit.model.dto.tempmonitor;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 每小时用电量数据DTO
 *
 * @author yupi
 */
@Data
public class HourlyEnergyConsumption implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 设备ID
     */
    private String deviceId;

    /**
     * 设备名称
     */
    private String name;

    /**
     * 车间
     */
    private String workshop;

    /**
     * 小时（格式：yyyy-MM-dd HH:00:00）
     */
    private Date hour;

    /**
     * 该小时的用电量（度数差值）
     */
    private Double energyConsumption;

    /**
     * 小时开始时间以后最近记录的度数
     */
    private Double startEnergy;

    /**
     * 小时结束时间以后最近记录的度数
     */
    private Double endEnergy;

    /**
     * 小时开始时间以后最近记录的时间
     */
    private Date startTime;

    /**
     * 小时结束时间以后最近记录的时间
     */
    private Date endTime;
}