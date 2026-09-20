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

    // ==================== 通用字段（所有模式） ====================
    
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
     * 总金额(元)
     */
    private BigDecimal totalCost;

    // ==================== 模式一、模式二专用字段 ====================
    
    /**
     * 总电量(kWh) 
     */
    private BigDecimal totalEnergy;

    /**
     * 平均单价(元/kWh) 
     */
    private BigDecimal avgUnitPrice;

    // ==================== 模式三专用字段 ====================
    
    /**
     * 1-24日电量(kWh) 
     */
    private BigDecimal energy1To24;

    /**
     * 25-月末电量(kWh) 
     */
    private BigDecimal energy25ToEnd;

    /**
     * 1-24日内部单价(元/kWh) 
     */
    private BigDecimal avgUnitPrice1To24;

    /**
     * 25-月末内部单价(元/kWh) 
     */
    private BigDecimal avgUnitPrice25ToEnd;

    /**
     * 月平均单价(元/kWh) - （用于计算部门分摊金额）
     */
    private BigDecimal monthlyAvgUnitPrice;

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
