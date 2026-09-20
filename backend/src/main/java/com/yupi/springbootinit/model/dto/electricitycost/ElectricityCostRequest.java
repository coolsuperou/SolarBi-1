package com.yupi.springbootinit.model.dto.electricitycost;

import lombok.Data;

import java.io.Serializable;

/**
 * 电费计算请求
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
@Data
public class ElectricityCostRequest implements Serializable {

    /**
     * 年份
     */
    private Integer year;

    /**
     * 月份（1-12）
     */
    private Integer month;

    private static final long serialVersionUID = 1L;
}
