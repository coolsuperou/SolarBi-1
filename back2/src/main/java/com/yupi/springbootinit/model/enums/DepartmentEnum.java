package com.yupi.springbootinit.model.enums;

import lombok.Getter;

/**
 * 部门枚举
 * 包含一级部门和二级部门的映射关系
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
@Getter
public enum DepartmentEnum {
    
    // ==================== 工具制造中心 ====================
    TOOL_MANUFACTURING_CENTER("工具制造中心", null, "一级部门"),
    DEPT_101_FEEDING("101配料", "工具制造中心", "二级部门"),
    DEPT_102_GRANULATION("102造粒", "工具制造中心", "二级部门"),
    DEPT_103_COLD_PRESS("103冷压", "工具制造中心", "二级部门"),
    DEPT_104_RESTORATION("104还原", "工具制造中心", "二级部门"),
    DEPT_105_SINTERING("105烧结", "工具制造中心", "二级部门"),
    DEPT_106_CLEANING("106清洗", "工具制造中心", "二级部门"),
    DEPT_107_BEADING("107串珠", "工具制造中心", "二级部门"),
    DEPT_109_RUBBER("109炼胶", "工具制造中心", "二级部门"),
    DEPT_110_INJECTION("110注射", "工具制造中心", "二级部门"),
    DEPT_111_EDGING("111开刃", "工具制造中心", "二级部门"),
    DEPT_112_FINAL_INSPECTION("112终检", "工具制造中心", "二级部门"),
    DEPT_113_PACKAGING("113仓库", "工具制造中心", "二级部门"),
    DEPT_114_PUBLIC("114公共", "工具制造中心", "二级部门"),
    
    // ==================== 管理部 ====================
    MANAGEMENT_DEPARTMENT("管理部", null, "一级部门"),
    CANTEEN("食堂", "管理部", "二级部门"),
    OFFICE_BUILDING_1("1#办公楼", "管理部", "二级部门"),
    DORMITORY("宿舍楼", "管理部", "二级部门"),
    OTHER("其他", "管理部", "二级部门"),
    
    // ==================== 工具研发中心 ====================
    TOOL_RD_CENTER("工具研发中心", null, "一级部门"),
    TOOL_RD_CENTER_DEPT("工具研发中心", "工具研发中心", "二级部门");
    
    /**
     * 部门名称
     */
    private final String name;
    
    /**
     * 所属一级部门（一级部门此字段为null）
     */
    private final String parentDept;
    
    /**
     * 部门级别：一级部门、二级部门
     */
    private final String level;
    
    DepartmentEnum(String name, String parentDept, String level) {
        this.name = name;
        this.parentDept = parentDept;
        this.level = level;
    }
    
    /**
     * 根据部门名称获取枚举
     */
    public static DepartmentEnum getByName(String name) {
        for (DepartmentEnum dept : values()) {
            if (dept.getName().equals(name)) {
                return dept;
            }
        }
        return null;
    }
    
    /**
     * 判断是否为一级部门
     */
    public boolean isPrimaryDept() {
        return "一级部门".equals(this.level);
    }
    
    /**
     * 判断是否为二级部门
     */
    public boolean isSecondaryDept() {
        return "二级部门".equals(this.level);
    }
}
