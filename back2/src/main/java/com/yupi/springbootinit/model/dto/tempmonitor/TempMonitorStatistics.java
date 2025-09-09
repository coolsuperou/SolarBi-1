package com.yupi.springbootinit.model.dto.tempmonitor;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 温湿电能监控数据统计结果
 * 
 * @author yupi
 */
@Data
@ApiModel("温湿电能监控数据统计结果")
public class TempMonitorStatistics implements Serializable {

    @ApiModelProperty("平均温度")
    private Double avgTemperature;

    @ApiModelProperty("最低温度")
    private Double minTemperature;

    @ApiModelProperty("最高温度")
    private Double maxTemperature;

    @ApiModelProperty("平均湿度")
    private Double avgHumidity;

    @ApiModelProperty("最低湿度")
    private Double minHumidity;

    @ApiModelProperty("最高湿度")
    private Double maxHumidity;

    @ApiModelProperty("总电能消耗")
    private Double totalElectricEnergy;

    @ApiModelProperty("平均电能消耗")
    private Double avgElectricEnergy;

    @ApiModelProperty("设备总数")
    private Integer totalDevices;

    private static final long serialVersionUID = 1L;
}
