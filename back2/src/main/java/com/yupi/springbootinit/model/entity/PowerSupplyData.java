package com.yupi.springbootinit.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 供电局数据实体
 * 对应表：tbl_power_supply_data
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
@TableName(value = "tbl_power_supply_data")
@Data
public class PowerSupplyData implements Serializable {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 年份
     */
    private Integer year;

    /**
     * 月份（1-12）
     */
    private Integer month;

    /**
     * 1-24日供电局抄表数(kWh)
     */
    @TableField("reading_1_to_24")
    private BigDecimal reading1To24;

    /**
     * 1-24日供电局金额(元)
     */
    @TableField("amount_1_to_24")
    private BigDecimal amount1To24;

    /**
     * 1-24日供电局单价(元/kWh)
     */
    @TableField("unit_price_1_to_24")
    private BigDecimal unitPrice1To24;

    /**
     * 25-月末供电局抄表数(kWh)
     */
    @TableField("reading_25_to_end")
    private BigDecimal reading25ToEnd;

    /**
     * 25-月末供电局金额(元)
     */
    @TableField("amount_25_to_end")
    private BigDecimal amount25ToEnd;

    /**
     * 25-月末供电局单价(元/kWh)
     */
    @TableField("unit_price_25_to_end")
    private BigDecimal unitPrice25ToEnd;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private Date updateTime;

    /**
     * 更新人
     */
    @TableField("update_by")
    private String updateBy;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
