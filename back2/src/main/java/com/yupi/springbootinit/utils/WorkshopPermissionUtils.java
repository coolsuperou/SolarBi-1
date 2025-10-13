package com.yupi.springbootinit.utils;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 车间权限工具类
 * 用于解析用户的pagePermissions字段并映射为车间名称列表
 */
@Slf4j
public class WorkshopPermissionUtils {

    /**
     * 页面路径到车间名称的映射表（静态缓存）
     */
    private static final Map<String, String> PATH_TO_WORKSHOP_MAPPING = buildPathToWorkshopMapping();

    /**
     * 从pagePermissions解析用户有权访问的车间列表
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

            // 遍历所有键值对，提取值为true的页面路径
            for (Map.Entry<String, com.google.gson.JsonElement> entry : jsonObject.entrySet()) {
                String pagePath = entry.getKey();
                boolean hasPermission = entry.getValue().getAsBoolean();

                // 只处理权限为true的路径
                if (hasPermission) {
                    // 标准化路径格式：确保以 "/" 开头
                    String normalizedPath = pagePath.startsWith("/") ? pagePath : "/" + pagePath;

                    // 尝试映射到车间名称
                    if (PATH_TO_WORKSHOP_MAPPING.containsKey(normalizedPath)) {
                        allowedWorkshops.add(PATH_TO_WORKSHOP_MAPPING.get(normalizedPath));
                    } else {
                        log.debug("忽略未映射的路径: {} (原始: {})", normalizedPath, pagePath);
                    }
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
        Map<String, String> mapping = new HashMap<>();

        // 27个车间的路径映射
        mapping.put("/airConditioning", "114_空调水机主机");
        mapping.put("/injection_workshop", "110注射环保设备");
        mapping.put("/granulation_workshop", "102造粒环保设备");
        mapping.put("/office_building", "1#办公楼");
        mapping.put("/feeding_workshop", "101配料");
        mapping.put("/granule102", "102造粒");
        mapping.put("/cold-press-103", "103冷压");
        mapping.put("/restoration-104", "104还原");
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
}