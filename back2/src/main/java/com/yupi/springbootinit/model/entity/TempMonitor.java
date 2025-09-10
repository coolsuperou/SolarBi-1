package com.yupi.springbootinit.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 温湿电能监控数据实体
 * 对应 SQL Server 表：RSWS_TempMonitor_Copy
 * 
 * @author yupi
 */
@Data
@TableName("RSWS_TempMonitor_Copy")
public class TempMonitor implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "Id", type = IdType.AUTO)
    private Integer id;

    /**
     * 设备ID
     */
    @TableField("DeviceID")
    private String deviceId;

    /**
     * 设备名称
     */
    @TableField("Name")
    private String name;

    /**
     * 温度
     */
    @TableField("Tem")
    private Double tem;

    /**
     * 湿度
     */
    @TableField("Hum")
    private Double hum;

    /**
     * MAC地址
     */
    @TableField("MAC")
    private String mac;

    /**
     * 更新时间
     */
    @TableField("UpdateTime")
    private Date updateTime;

    /**
     * 电能
     */
    @TableField("ElectricEnergy")
    private Double electricEnergy;

    /**
     * 节点ID
     */
    @TableField("NodeID")
    private Integer nodeId;

    /**
     * 车间
     */
    @TableField("Workshop")
    private String workshop;
}
