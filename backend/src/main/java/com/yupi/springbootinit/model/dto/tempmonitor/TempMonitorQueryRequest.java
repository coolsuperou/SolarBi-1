package com.yupi.springbootinit.model.dto.tempmonitor;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.yupi.springbootinit.common.PageRequest;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

/**
 * 温湿电能监控数据查询请求
 * 
 * @author yupi
 */
@EqualsAndHashCode(callSuper = true)
@Data
@ApiModel("温湿电能监控数据查询请求")
public class TempMonitorQueryRequest extends PageRequest {

    /**
     * 设备ID
     */
    @ApiModelProperty("设备ID")
    private String deviceId;

    /**
     * 设备名称（模糊查询）
     */
    @ApiModelProperty("设备名称")
    private String name;

    /**
     * 车间
     */
    @ApiModelProperty("车间")
    private String workshop;

    /**
     * 开始时间
     */
    @ApiModelProperty("开始时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date startTime;

    /**
     * 结束时间
     */
    @ApiModelProperty("结束时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date endTime;

    /**
     * 排序字段（tem, hum, electricEnergy, updateTime等）
     */
    @ApiModelProperty("排序字段")
    private String sortField;

    /**
     * 排序方向（asc, desc）
     */
    @ApiModelProperty("排序方向")
    private String sortOrder;

    private static final long serialVersionUID = 1L;
}
