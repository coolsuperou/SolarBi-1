package com.yupi.springbootinit.model.enums;

import java.util.Arrays;
import java.util.Optional;

/**
 * 车间枚举类
 * 集中管理所有车间的元数据配置
 * 
 * @author 欧展煌
 */
public enum WorkshopEnum {
    // ── 前道生产线 ──
    FEEDING_WORKSHOP("101配料", "/feeding-workshop", CalculationStrategyType.STANDARD),
    GRANULE_102("102造粒", "/granule102", CalculationStrategyType.STANDARD),
    GRANULATION_WORKSHOP("102造粒环保设备", "/granulation-workshop", CalculationStrategyType.STANDARD),
    COLD_PRESS_103("103冷压", "/cold-press-103", CalculationStrategyType.STANDARD),
    RESTORATION_104("104还原", "/restoration-104", CalculationStrategyType.STANDARD),
    SINTERING_105("105烧结", "/sintering-105", CalculationStrategyType.STANDARD),
    
    // ── 无压烧结（独立） ──
    PRESSLESS_SINTERING("无压烧结", "/pressless-sintering", CalculationStrategyType.STANDARD),
    
    // ── 后道生产线 ──
    CLEANING_106("106清洗", "/cleaning-106", CalculationStrategyType.STANDARD),
    BEADING_107("107串珠", "/beading-107", CalculationStrategyType.NESTED_SUBTRACTION),
    RUBBER_109("109炼胶", "/rubber-109", CalculationStrategyType.STANDARD),
    INJECTION_110("110注射", "/injection-110", CalculationStrategyType.STANDARD),
    INJECTION_WORKSHOP("110注射环保设备", "/injection-workshop", CalculationStrategyType.STANDARD),
    EDGING_111("111开刃", "/edging-111", CalculationStrategyType.STANDARD),
    
    // ── 公共模块 ──
    FINAL_INSPECTION_112("112终检", "/final-inspection-112", CalculationStrategyType.STANDARD),
    WAREHOUSE_113("113仓库", "/warehouse113", CalculationStrategyType.STANDARD),
    PUBLIC_114("114公共", "/public114", CalculationStrategyType.STANDARD),
    AIR_CONDITIONING("114_空调水机主机", "/air-conditioning", CalculationStrategyType.STANDARD),
    AIR_COMPRESSOR_114("114空压机", "/aircompressor114", CalculationStrategyType.STANDARD),
    ELEVATOR_114("114_2#厂房电梯", "/elevator114", CalculationStrategyType.STANDARD),
    OFFICE_AREA_114("114_2#楼办公区域", "/officearea114", CalculationStrategyType.STANDARD),
    CONFERENCE_ROOM_114("114_2#楼会议室", "/conferenceroom114", CalculationStrategyType.STANDARD),
    LABORATORY_114("114_2#楼实验室", "/laboratory114", CalculationStrategyType.STANDARD),
    
    // ── 其他 ──
    OFFICE_BUILDING("1#办公楼", "/office-building", CalculationStrategyType.STANDARD),
    TOOL_RD_CENTER("工具研发中心", "/toolrdcenter", CalculationStrategyType.STANDARD),
    CHARGING_PILE("充电桩", "/chargingpile", CalculationStrategyType.STANDARD),
    GUARD_ROOM("门卫室", "/guardroom", CalculationStrategyType.STANDARD),
    CANTEEN("食堂", "/canteen", CalculationStrategyType.STANDARD),
    DORMITORY("宿舍楼", "/dormitory", CalculationStrategyType.STANDARD);
    
    /**
     * 车间名称（中文）
     */
    private final String workshopName;
    
    /**
     * URL路径前缀
     */
    private final String urlPath;
    
    /**
     * 计算策略类型
     */
    private final CalculationStrategyType strategyType;
    
    /**
     * 构造函数
     * 
     * @param workshopName 车间名称
     * @param urlPath URL路径前缀
     * @param strategyType 计算策略类型
     */
    WorkshopEnum(String workshopName, String urlPath, CalculationStrategyType strategyType) {
        this.workshopName = workshopName;
        this.urlPath = urlPath;
        this.strategyType = strategyType;
    }
    
    public String getWorkshopName() {
        return workshopName;
    }
    
    public String getUrlPath() {
        return urlPath;
    }
    
    public CalculationStrategyType getStrategyType() {
        return strategyType;
    }
    
    /**
     * 根据URL路径查找车间枚举
     * 
     * @param urlPath URL路径（如 "/laboratory114"）
     * @return 对应的车间枚举，如果未找到则返回null
     */
    public static WorkshopEnum getByUrlPath(String urlPath) {
        if (urlPath == null || urlPath.trim().isEmpty()) {
            return null;
        }
        
        Optional<WorkshopEnum> result = Arrays.stream(WorkshopEnum.values())
                .filter(workshop -> workshop.getUrlPath().equals(urlPath))
                .findFirst();
        
        return result.orElse(null);
    }
    
    /**
     * 根据车间名称查找车间枚举
     * 
     * @param workshopName 车间名称（如 "114_2#楼实验室"）
     * @return 对应的车间枚举，如果未找到则返回null
     */
    public static WorkshopEnum getByWorkshopName(String workshopName) {
        if (workshopName == null || workshopName.trim().isEmpty()) {
            return null;
        }
        
        Optional<WorkshopEnum> result = Arrays.stream(WorkshopEnum.values())
                .filter(workshop -> workshop.getWorkshopName().equals(workshopName))
                .findFirst();
        
        return result.orElse(null);
    }
}
