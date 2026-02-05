package com.yupi.springbootinit.model.dto.electricitycost;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 电费计算响应
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
@Data
public class ElectricityCostResponse implements Serializable {

    /**
     * 供电局数据
     */
    private PowerSupplyDataVO powerSupplyData;

    /**
     * 部门电费明细列表
     */
    private List<DepartmentCostDTO> departmentCostList;

    /**
     * 一级部门汇总（部门名称 -> 汇总数据）
     */
    private Map<String, DepartmentSummaryDTO> dept1Summary;

    /**
     * 总电量(kWh)
     */
    private BigDecimal totalEnergy;

    /**
     * 总金额(元)
     */
    private BigDecimal totalCost;

    /**
     * 平均单价(元/kWh)
     */
    private BigDecimal avgUnitPrice;

    /**
     * 一级部门汇总DTO
     */
    @Data
    public static class DepartmentSummaryDTO implements Serializable {
        /**
         * 部门名称
         */
        private String deptName;

        /**
         * 总电量(kWh)
         */
        private BigDecimal totalEnergy;

        /**
         * 总金额(元)
         */
        private BigDecimal totalCost;

        private static final long serialVersionUID = 1L;
    }

    private static final long serialVersionUID = 1L;
}
