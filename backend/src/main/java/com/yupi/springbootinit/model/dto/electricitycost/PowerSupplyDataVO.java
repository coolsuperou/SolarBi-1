package com.yupi.springbootinit.model.dto.electricitycost;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 供电局数据返回对象
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
@Data
public class PowerSupplyDataVO implements Serializable {

    /**
     * 主键ID
     */
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
    private BigDecimal reading1To24;

    /**
     * 1-24日供电局金额(元)
     */
    private BigDecimal amount1To24;

    /**
     * 1-24日供电局单价(元/kWh)
     */
    private BigDecimal unitPrice1To24;

    /**
     * 25-月末供电局抄表数(kWh)
     */
    private BigDecimal reading25ToEnd;

    /**
     * 25-月末供电局金额(元)
     */
    private BigDecimal amount25ToEnd;

    /**
     * 25-月末供电局单价(元/kWh)
     */
    private BigDecimal unitPrice25ToEnd;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 更新人
     */
    private String updateBy;

    private static final long serialVersionUID = 1L;
}
