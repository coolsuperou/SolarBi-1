package com.yupi.springbootinit.model.enums;

/**
 * 计算策略类型枚举
 * 定义车间能耗计算的策略类型
 * 
 * @author 欧展煌
 */
public enum CalculationStrategyType {
    /**
     * 标准计算策略
     * 适用于大多数车间，直接使用EnergyCalculationUtils工具类计算能耗
     */
    STANDARD("标准计算"),
    
    /**
     * 嵌套减法计算策略
     * 适用于特殊车间（如107串珠），从主车间能耗中减去嵌套表能耗
     */
    NESTED_SUBTRACTION("嵌套减法计算");
    
    private final String description;
    
    CalculationStrategyType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
