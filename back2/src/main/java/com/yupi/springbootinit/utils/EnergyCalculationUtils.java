package com.yupi.springbootinit.utils;

import com.yupi.springbootinit.config.EnergyTimeConfig;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.entity.TempMonitor;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.stream.Collectors;
import java.util.Comparator;

/**
 * 🔥 统一的能耗计算工具类
 * 所有车间的小时/日能耗计算都使用这个工具类
 * 避免代码重复，便于维护
 * @author yupi
 */
@Slf4j
public class EnergyCalculationUtils {

    /**
     * 🔥 通用小时能耗计算方法
     * @param rawData 原始电表数据
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param workshopName 车间名称（用于结果标识）
     * @return 小时能耗列表
     */
    public static List<HourlyEnergyConsumption> calculateHourlyEnergyFromRawData(
            List<TempMonitor> rawData,
            Date startTime,
            Date endTime,
            String workshopName) {

        List<HourlyEnergyConsumption> result = new ArrayList<>();

        if (rawData == null || rawData.isEmpty()) {
            log.warn("{}原始数据为空，无法计算小时能耗", workshopName);
            return result;
        }

        // 按设备名称分组
        Map<String, List<TempMonitor>> deviceDataMap = rawData.stream()
                .collect(Collectors.groupingBy(TempMonitor::getName));

        log.info("{}设备分组结果: 共{}个设备", workshopName, deviceDataMap.size());

        // 生成小时时间点
        List<Date> hourlyPoints = generateHourlyPoints(startTime, endTime);
        log.info("生成小时时间点: 共{}个小时", hourlyPoints.size());

        for (Date hourStart : hourlyPoints) {
            // 计算小时结束时间
            Calendar cal = Calendar.getInstance();
            cal.setTime(hourStart);
            cal.add(Calendar.HOUR_OF_DAY, 1);
            Date hourEnd = cal.getTime();

            // 所有设备的能耗汇总
            Double totalStartEnergy = 0.0;
            Double totalEndEnergy = 0.0;
            Date earliestStartTime = null;
            Date latestEndTime = null;
            boolean hasValidData = false;

            for (Map.Entry<String, List<TempMonitor>> entry : deviceDataMap.entrySet()) {
                List<TempMonitor> deviceData = entry.getValue().stream()
                        .sorted(Comparator.comparing(TempMonitor::getUpdateTime))
                        .collect(Collectors.toList());

                // 找小时开始时间之后最近的记录
                TempMonitor startRecord = deviceData.stream()
                        .filter(d -> d.getUpdateTime().compareTo(hourStart) >= 0)
                        .min(Comparator.comparing(TempMonitor::getUpdateTime))
                        .orElse(null);

                // 找小时结束时间之后最近的记录
                TempMonitor endRecord = deviceData.stream()
                        .filter(d -> d.getUpdateTime().compareTo(hourEnd) >= 0)
                        .min(Comparator.comparing(TempMonitor::getUpdateTime))
                        .orElse(null);

                // 如果没找到结束记录，使用小时范围内最后一条记录
                if (endRecord == null) {
                    endRecord = deviceData.stream()
                            .filter(d -> d.getUpdateTime().compareTo(hourStart) >= 0 && d.getUpdateTime().compareTo(hourEnd) < 0)
                            .max(Comparator.comparing(TempMonitor::getUpdateTime))
                            .orElse(null);
                }

                // 累加各设备的开始能耗
                if (startRecord != null && startRecord.getElectricEnergy() != null) {
                    totalStartEnergy += startRecord.getElectricEnergy();
                    if (earliestStartTime == null || startRecord.getUpdateTime().before(earliestStartTime)) {
                        earliestStartTime = startRecord.getUpdateTime();
                    }
                    hasValidData = true;
                }

                // 累加各设备的结束能耗
                if (endRecord != null && endRecord.getElectricEnergy() != null) {
                    totalEndEnergy += endRecord.getElectricEnergy();
                    if (latestEndTime == null || endRecord.getUpdateTime().after(latestEndTime)) {
                        latestEndTime = endRecord.getUpdateTime();
                    }
                    hasValidData = true;
                }
            }

            // 构建结果（只有有效数据才添加）
            if (hasValidData && totalStartEnergy != null && totalEndEnergy != null &&
                    totalStartEnergy > 0 && totalEndEnergy > 0) {

                HourlyEnergyConsumption consumption = new HourlyEnergyConsumption();
                consumption.setDeviceId(workshopName);
                consumption.setName(workshopName);
                consumption.setWorkshop(workshopName);
                consumption.setHour(hourStart);
                consumption.setStartEnergy(totalStartEnergy);
                consumption.setEndEnergy(totalEndEnergy);
                consumption.setStartTime(earliestStartTime);
                consumption.setEndTime(latestEndTime);

                // 计算能耗差值
                if (totalEndEnergy >= totalStartEnergy) {
                    consumption.setEnergyConsumption(totalEndEnergy - totalStartEnergy);
                } else {
                    consumption.setEnergyConsumption(null);
                }

                result.add(consumption);
            }
        }

        // 按小时排序
        return result.stream()
                .sorted(Comparator.comparing(HourlyEnergyConsumption::getHour))
                .collect(Collectors.toList());
    }

    /**
     * 🔥 通用日能耗计算方法
     * 日能耗统计规则：根据配置，每天从 7:00:00 开始到次日 6:59:59 结束
     * 计算方式：各设备在结束时间之后的第一条 减去 开始时间之后的第一条，然后累加
     * @param rawData 原始电表数据
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param workshopName 车间名称
     * @return 日能耗列表
     */
    public static List<DailyEnergyConsumption> calculateDailyEnergyFromRawData(
            List<TempMonitor> rawData,
            Date startTime,
            Date endTime,
            String workshopName) {

        List<DailyEnergyConsumption> result = new ArrayList<>();

        if (rawData == null || rawData.isEmpty()) {
            log.warn("{}原始数据为空，无法计算日能耗", workshopName);
            return result;
        }

        // 按设备名称分组
        Map<String, List<TempMonitor>> deviceDataMap = rawData.stream()
                .collect(Collectors.groupingBy(TempMonitor::getName));

        log.info("{}设备分组结果: 共{}个设备", workshopName, deviceDataMap.size());

        // 使用配置生成日时间点（从配置的开始时间开始）
        List<Date> dailyPoints = generateDailyPoints(startTime, endTime);
        log.info("生成日时间点: 共{}天", dailyPoints.size());

        for (Date dayStart : dailyPoints) {
            // 使用配置计算当天结束时间
            Calendar cal = Calendar.getInstance();
            cal.setTime(dayStart);
            cal.add(Calendar.DAY_OF_MONTH, EnergyTimeConfig.DAY_END_OFFSET);
            cal.set(Calendar.HOUR_OF_DAY, EnergyTimeConfig.DAY_END_HOUR);
            cal.set(Calendar.MINUTE, EnergyTimeConfig.DAY_END_MINUTE);
            cal.set(Calendar.SECOND, EnergyTimeConfig.DAY_END_SECOND);
            cal.set(Calendar.MILLISECOND, 999);
            Date dayEnd = cal.getTime();

            // 计算所有设备的能耗并累加
            double totalEnergyConsumption = 0.0;
            Date earliestStartTime = null;
            Date latestEndTime = null;
            boolean hasValidData = false;

            for (Map.Entry<String, List<TempMonitor>> entry : deviceDataMap.entrySet()) {
                List<TempMonitor> deviceData = entry.getValue().stream()
                        .sorted(Comparator.comparing(TempMonitor::getUpdateTime))
                        .collect(Collectors.toList());

                // 找开始时间之后的第一条记录
                TempMonitor startRecord = deviceData.stream()
                        .filter(d -> d.getUpdateTime().compareTo(dayStart) >= 0)
                        .min(Comparator.comparing(TempMonitor::getUpdateTime))
                        .orElse(null);

                // 找结束时间之后的第一条记录
                TempMonitor endRecord = deviceData.stream()
                        .filter(d -> d.getUpdateTime().compareTo(dayEnd) >= 0)
                        .min(Comparator.comparing(TempMonitor::getUpdateTime))
                        .orElse(null);

                // 如果没找到结束记录，使用当天范围内最后一条记录
                if (endRecord == null) {
                    endRecord = deviceData.stream()
                            .filter(d -> d.getUpdateTime().compareTo(dayStart) >= 0 && d.getUpdateTime().compareTo(dayEnd) <= 0)
                            .max(Comparator.comparing(TempMonitor::getUpdateTime))
                            .orElse(null);
                }

                // 计算该设备的能耗差值并累加
                if (startRecord != null && endRecord != null &&
                        startRecord.getElectricEnergy() != null && endRecord.getElectricEnergy() != null) {

                    double deviceEnergy = endRecord.getElectricEnergy() - startRecord.getElectricEnergy();
                    if (deviceEnergy >= 0) {
                        totalEnergyConsumption += deviceEnergy;
                        hasValidData = true;

                        if (earliestStartTime == null || startRecord.getUpdateTime().before(earliestStartTime)) {
                            earliestStartTime = startRecord.getUpdateTime();
                        }
                        if (latestEndTime == null || endRecord.getUpdateTime().after(latestEndTime)) {
                            latestEndTime = endRecord.getUpdateTime();
                        }
                    }
                }
            }

            // 构建结果（只有有效数据才添加）
            if (hasValidData) {
                // 🔥 将 day 字段归零到当天 00:00:00，避免前端图表时间偏移
                Calendar dayCalendar = Calendar.getInstance();
                dayCalendar.setTime(dayStart);
                dayCalendar.set(Calendar.HOUR_OF_DAY, 0);
                dayCalendar.set(Calendar.MINUTE, 0);
                dayCalendar.set(Calendar.SECOND, 0);
                dayCalendar.set(Calendar.MILLISECOND, 0);

                DailyEnergyConsumption consumption = new DailyEnergyConsumption();
                consumption.setDeviceId(workshopName);
                consumption.setName(workshopName);
                consumption.setWorkshop(workshopName);
                consumption.setDay(dayCalendar.getTime());  // 使用归零后的日期，避免前端时间轴偏移
                consumption.setStartTime(earliestStartTime);
                consumption.setEndTime(latestEndTime);
                consumption.setEnergyConsumption(totalEnergyConsumption);

                result.add(consumption);
            }
        }

        // 按日期排序
        return result.stream()
                .sorted(Comparator.comparing(DailyEnergyConsumption::getDay))
                .collect(Collectors.toList());
    }

    /**
     * 生成小时时间点（通用方法）
     */
    private static List<Date> generateHourlyPoints(Date startTime, Date endTime) {
        List<Date> hourlyPoints = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.setTime(startTime);

        // 截取到小时开始
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);

        while (cal.getTime().before(endTime)) {
            hourlyPoints.add(cal.getTime());
            cal.add(Calendar.HOUR_OF_DAY, 1);
        }

        return hourlyPoints;
    }

    /**
     * 生成日时间点（使用配置的每天统计范围）
     */
    private static List<Date> generateDailyPoints(Date startTime, Date endTime) {
        List<Date> dailyPoints = new ArrayList<>();
        Calendar cal = Calendar.getInstance();
        cal.setTime(startTime);

        // 使用配置截取到当天的开始时间（例如：7:00:00）
        cal.set(Calendar.HOUR_OF_DAY, EnergyTimeConfig.DAY_START_HOUR);
        cal.set(Calendar.MINUTE, EnergyTimeConfig.DAY_START_MINUTE);
        cal.set(Calendar.SECOND, EnergyTimeConfig.DAY_START_SECOND);
        cal.set(Calendar.MILLISECOND, 0);

        // 如果开始时间已经过了当天的配置开始时间，从次日开始
        if (startTime.after(cal.getTime())) {
            cal.add(Calendar.DAY_OF_MONTH, 1);
        }

        while (cal.getTime().before(endTime)) {
            dailyPoints.add(cal.getTime());
            cal.add(Calendar.DAY_OF_MONTH, 1);  // 每次加一天
        }

        return dailyPoints;
    }
}