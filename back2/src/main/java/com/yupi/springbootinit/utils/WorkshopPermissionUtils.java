package com.yupi.springbootinit.utils;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 车间权限工具类
 * 用于解析用户的pagePermissions字段并映射为车间名称列表
 */
@Slf4j
public class WorkshopPermissionUtils {

    /**
     * 页面路径到车间名称的映射表（静态缓存，使用LinkedHashMap保持顺序）
     */
    private static final Map<String, String> PATH_TO_WORKSHOP_MAPPING = buildPathToWorkshopMapping();
    
    /**
     * 车间显示顺序列表
     */
    private static final List<String> WORKSHOP_ORDER = buildWorkshopOrder();

    /**
     * 从pagePermissions解析用户有权访问的车间列表（按固定顺序排列）
     *
     * @param pagePermissions JSON格式的页面权限字符串，如 {"airConditioning": true, "injection_workshop": true}
     * @return 车间名称列表，如果解析失败返回空列表
     */
    public static List<String> parseWorkshopsFromPermissions(String pagePermissions) {
        List<String> allowedWorkshops = new ArrayList<>();

        // 空权限处理
        if (pagePermissions == null || pagePermissions.trim().isEmpty() || "{}".equals(pagePermissions)) {
            log.warn("pagePermissions为空，将返回空车间列表");
            return allowedWorkshops;
        }

        try {
            // 使用Gson解析JSON对象
            Gson gson = new Gson();
            JsonObject jsonObject = gson.fromJson(pagePermissions, JsonObject.class);

            // 先收集用户有权限的车间到Set中
            List<String> userWorkshops = new ArrayList<>();
            for (Map.Entry<String, com.google.gson.JsonElement> entry : jsonObject.entrySet()) {
                String pagePath = entry.getKey();
                boolean hasPermission = entry.getValue().getAsBoolean();

                // 只处理权限为true的路径
                if (hasPermission) {
                    // 标准化路径格式：确保以 "/" 开头
                    String normalizedPath = pagePath.startsWith("/") ? pagePath : "/" + pagePath;

                    // 尝试映射到车间名称
                    if (PATH_TO_WORKSHOP_MAPPING.containsKey(normalizedPath)) {
                        userWorkshops.add(PATH_TO_WORKSHOP_MAPPING.get(normalizedPath));
                    } else {
                        log.debug("忽略未映射的路径: {} (原始: {})", normalizedPath, pagePath);
                    }
                }
            }

            // 按照预定义顺序排列车间
            for (String workshop : WORKSHOP_ORDER) {
                if (userWorkshops.contains(workshop)) {
                    allowedWorkshops.add(workshop);
                }
            }

            log.info("解析到{}个有权访问的车间: {}", allowedWorkshops.size(), allowedWorkshops);

        } catch (Exception e) {
            log.warn("解析pagePermissions失败: {}, 将返回空车间列表", e.getMessage());
        }

        return allowedWorkshops;
    }

    /**
     * 构建页面路径到车间名称的映射表
     *
     * @return 映射表
     */
    private static Map<String, String> buildPathToWorkshopMapping() {
        Map<String, String> mapping = new LinkedHashMap<>();

        // 28个车间的路径映射
        mapping.put("/airConditioning", "114_空调水机主机");
        mapping.put("/injection_workshop", "110注射环保设备");
        mapping.put("/granulation_workshop", "102造粒环保设备");
        mapping.put("/office_building", "1#办公楼");
        mapping.put("/feeding_workshop", "101配料");
        mapping.put("/granule102", "102造粒");
        mapping.put("/cold-press-103", "103冷压");
        mapping.put("/restoration-104", "104还原");
        mapping.put("/pressless-sintering", "无压烧结");
        mapping.put("/sintering-105", "105烧结");
        mapping.put("/cleaning-106", "106清洗");
        mapping.put("/beading-107", "107串珠");
        mapping.put("/rubber-109", "109炼胶");
        mapping.put("/injection-110", "110注射");
        mapping.put("/edging-111", "111开刃");
        mapping.put("/final-inspection-112", "112终检");
        mapping.put("/warehouse-113", "113仓库");
        mapping.put("/elevator-114", "114_2#厂房电梯");
        mapping.put("/office-area-114", "114_2#楼办公区域");
        mapping.put("/conference-room-114", "114_2#楼会议室");
        mapping.put("/laboratory-114", "114_2#楼实验室");
        mapping.put("/public-114", "114公共");
        mapping.put("/air-compressor-114", "114空压机");
        mapping.put("/charging-pile", "充电桩");
        mapping.put("/tool-rd-center", "工具研发中心");
        mapping.put("/guard-room", "门卫室");
        mapping.put("/canteen", "食堂");
        mapping.put("/dormitory", "宿舍楼");
        

        return mapping;
    }
    
    /**
     * 构建车间显示顺序列表
     * 修改这里可以调整车间在统计页面中的显示顺序
     *
     * @return 车间顺序列表
     */
    private static List<String> buildWorkshopOrder() {
        List<String> order = new ArrayList<>();
        
        // 按照期望的显示顺序添加车间
        order.add("114_空调水机主机");
        order.add("110注射环保设备");
        order.add("102造粒环保设备");
        order.add("1#办公楼");
        order.add("101配料");
        order.add("102造粒");
        order.add("103冷压");
        order.add("104还原");
        order.add("无压烧结");
        order.add("105烧结");
        order.add("106清洗");
        order.add("107串珠");
        order.add("109炼胶");
        order.add("110注射");
        order.add("111开刃");
        order.add("112终检");
        order.add("113仓库");
        order.add("114_2#厂房电梯");
        order.add("114_2#楼办公区域");
        order.add("114_2#楼会议室");
        order.add("114_2#楼实验室");
        order.add("114公共");
        order.add("114空压机");
        order.add("充电桩");
        order.add("工具研发中心");
        order.add("门卫室");
        order.add("食堂");
        order.add("宿舍楼");
        
        
        return order;
    }
}