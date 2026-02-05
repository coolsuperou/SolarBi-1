package com.yupi.springbootinit.model.dto.electricitycost;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 部门电费明细DTO
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
@Data
public class DepartmentCostDTO implements Serializable {

    /**
     * 一级部门
     */
    private String dept1;

    /**
     * 二级部门
     */
    private String dept2;

    /**
     * 月电能值(kWh)
     */
    private BigDecimal energy;

    /**
     * 分配金额(元)
     */
    private BigDecimal cost;

    private static final long serialVersionUID = 1L;
}
