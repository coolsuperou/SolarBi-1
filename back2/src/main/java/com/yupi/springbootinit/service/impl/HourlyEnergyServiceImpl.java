package com.yupi.springbootinit.service.impl;

import com.yupi.springbootinit.config.EnergyTimeConfig;
import com.yupi.springbootinit.mapper.sqlserver.HourlyEnergyMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.service.HourlyEnergyService;
import com.yupi.springbootinit.service.UserService;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import com.yupi.springbootinit.utils.WorkshopPermissionUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 日能耗统计服务实现
 * 🔥 所有车间都只统计 tbl_monitordevice 中 IsElectricMeter=1 的设备
 * 🔥 优化：一次性查询所有车间的电能表设备，使用并行流加速计算
 */
@Service
@Slf4j
public class HourlyEnergyServiceImpl implements HourlyEnergyService {

    @Resource
    private HourlyEnergyMapper hourlyEnergyMapper;
    
    @Resource
    private UserService userService;

    /**
     * 🔥 一次性获取所有车间的电能表设备映射
     * @param workshopList 车间列表
     * @return Map<车间名称, Set<电能表设备名称>>
     */
    private Map<String, Set<String>> getElectricMeterMap(List<String> workshopList) {
        long startTime = System.currentTimeMillis();
        
        // 批量查询所有车间的电能表设备
        List<TempMonitor> meterList = hourlyEnergyMapper.getElectricMetersByWorkshops(workshopList);
        
        // 按车间分组
        Map<String, Set<String>> meterMap = new HashMap<>();
        for (TempMonitor meter : meterList) {
            String workshop = meter.getWorkshop();
            String name = meter.getName();
            if (workshop != null && name != null) {
                meterMap.computeIfAbsent(workshop, k -> new HashSet<>()).add(name);
            }
        }
        
        long elapsed = System.currentTimeMillis() - startTime;
        log.info("🔥 批量查询电能表设备完成，耗时: {}ms，共{}个车间", elapsed, meterMap.size());
        
        return meterMap;
    }

    @Override
    @Transactional(readOnly = true)
    public HourlyEnergyStatistics getHourlyStatistics(Integer year, Integer month, Integer day, HttpServletRequest request) {
        long totalStartTime = System.currentTimeMillis();
        log.info("📊 接收日能耗统计请求: {}年{}月{}日", year, month, day);

        // 1. 获取当前用户并解析权限
        User loginUser = userService.getLoginUser(request);
        String pagePermissions = loginUser.getPagePermissions();
        List<String> allowedWorkshops = WorkshopPermissionUtils.parseWorkshopsFromPermissions(pagePermissions);
        
        log.info("用户 {} 有权访问的车间: {}", loginUser.getUserAccount(), allowedWorkshops);
        
        // 如果用户没有任何车间权限，返回空统计
        if (allowedWorkshops.isEmpty()) {
            log.warn("用户 {} 没有任何车间访问权限，返回空统计", loginUser.getUserAccount());
            return createEmptyStatistics(year, month, day);
        }

        // 2. 计算时间范围：当天07:00 到次日08:00（多查1小时）
        Calendar startCal = Calendar.getInstance();
        startCal.set(year, month - 1, day, EnergyTimeConfig.DAY_START_HOUR, 0, 0);
        startCal.set(Calendar.MILLISECOND, 0);
        Date startTime = startCal.getTime();

        Calendar endCal = Calendar.getInstance();
        endCal.set(year, month - 1, day + 1, EnergyTimeConfig.DAY_START_HOUR + 1, 0, 0);
        endCal.set(Calendar.MILLISECOND, 0);
        Date endTime = endCal.getTime();

        log.info("时间范围: {} 至 {}", startTime, endTime);

        // 🔥 3. 一次性查询所有车间的电能表设备映射（优化：只查一次数据库）
        Map<String, Set<String>> electricMeterMap = getElectricMeterMap(allowedWorkshops);

        // 4. 查询用户有权限的车间数据
        long queryStartTime = System.currentTimeMillis();
        List<TempMonitor> allRawData = hourlyEnergyMapper.selectAllWorkshopsHourlyData(allowedWorkshops, startTime, endTime);
        log.info("查询原始数据耗时: {}ms，共{}条记录", System.currentTimeMillis() - queryStartTime, 
                allRawData != null ? allRawData.size() : 0);

        if (allRawData == null || allRawData.isEmpty()) {
            log.warn("{}年{}月{}日无数据", year, month, day);
            return createEmptyStatistics(year, month, day);
        }

        // 🔥 5. 过滤原始数据，只保留电能表设备的数据（优化：在分组前统一过滤）
        long filterStartTime = System.currentTimeMillis();
        List<TempMonitor> filteredRawData = allRawData.stream()
                .filter(item -> {
                    String workshop = item.getWorkshop();
                    String name = item.getName();
                    if (workshop == null || name == null) return false;
                    Set<String> meterNames = electricMeterMap.get(workshop);
                    return meterNames != null && meterNames.contains(name);
                })
                .collect(Collectors.toList());
        log.info("🔥 电能表过滤完成，耗时: {}ms，原始记录: {}，过滤后: {}", 
                System.currentTimeMillis() - filterStartTime, allRawData.size(), filteredRawData.size());

        if (filteredRawData.isEmpty()) {
            log.warn("过滤后无电能表数据");
            return createEmptyStatistics(year, month, day);
        }

        // 6. 从过滤后的数据中提取实际返回的车间列表并按照allowedWorkshops的顺序排列
        Set<String> workshopSet = filteredRawData.stream()
            .map(TempMonitor::getWorkshop)
            .filter(w -> w != null && !w.isEmpty())
            .collect(Collectors.toSet());

        // 按照用户权限列表的顺序排列车间
        List<String> workshops = new ArrayList<>();
        for (String allowedWorkshop : allowedWorkshops) {
            if (workshopSet.contains(allowedWorkshop)) {
                workshops.add(allowedWorkshop);
            }
        }

        log.info("实际返回{}个车间: {}", workshops.size(), workshops);

        // 7. 按车间分组过滤后的数据
        Map<String, List<TempMonitor>> dataByWorkshop = filteredRawData.stream()
            .filter(d -> d.getWorkshop() != null)
            .collect(Collectors.groupingBy(TempMonitor::getWorkshop));

        // 8. 初始化数据结构（使用线程安全的Map用于并行计算）
        Map<String, List<Double>> workshopHourlyData = new ConcurrentHashMap<>();
        double[] hourlyTotalArray = new double[24]; // 使用数组便于并行累加

        // 🔥 9. 使用并行流遍历每个车间计算能耗（优化：并行计算）
        long calcStartTime = System.currentTimeMillis();
        final Date finalStartTime = startTime;
        final Date finalEndTime = endTime;

        workshops.parallelStream().forEach(workshop -> {
            List<TempMonitor> workshopData = dataByWorkshop.getOrDefault(workshop, Collections.emptyList());

            if (workshopData.isEmpty()) {
                workshopHourlyData.put(workshop, new ArrayList<>(Collections.nCopies(24, 0.0)));
                return;
            }

            // 调用工具类计算小时能耗
            List<HourlyEnergyConsumption> hourlyConsumptions = 
                EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                    workshopData, finalStartTime, finalEndTime, workshop);

            // 转换为24小时数组
            List<Double> hourlyData = new ArrayList<>(Collections.nCopies(24, 0.0));
            for (HourlyEnergyConsumption consumption : hourlyConsumptions) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(consumption.getHour());
                int hour = cal.get(Calendar.HOUR_OF_DAY);
                
                // 计算索引：07:00对应索引0
                int index = (hour - EnergyTimeConfig.DAY_START_HOUR + 24) % 24;
                if (index >= 0 && index < 24) {
                    // 防止次日07:00的数据覆盖当天07:00的数据
                    if (hourlyData.get(index) != 0.0) {
                        continue;
                    }
                    
                    Double energy = consumption.getEnergyConsumption() != null ? 
                                   consumption.getEnergyConsumption() : 0.0;
                    hourlyData.set(index, energy);
                    
                    // 线程安全地累加到每小时总能耗
                    synchronized (hourlyTotalArray) {
                        hourlyTotalArray[index] += energy;
                    }
                }
            }

            workshopHourlyData.put(workshop, hourlyData);
        });

        log.info("🔥 并行计算完成，耗时: {}ms", System.currentTimeMillis() - calcStartTime);

        // 🔥 特殊处理：104还原需要扣除无压烧结的数据
        if (workshopHourlyData.containsKey("104还原") && workshopHourlyData.containsKey("无压烧结")) {
            List<Double> restoration104Data = workshopHourlyData.get("104还原");
            List<Double> presslessData = workshopHourlyData.get("无压烧结");
            
            // 按小时扣除
            List<Double> adjustedHourlyData = new ArrayList<>();
            for (int i = 0; i < 24; i++) {
                double original = restoration104Data.get(i);
                double pressless = presslessData.get(i);
                double adjusted = Math.max(0, original - pressless);
                adjustedHourlyData.add(adjusted);
                
                // 同时更新每小时总能耗
                hourlyTotalArray[i] = hourlyTotalArray[i] - original + adjusted;
            }
            
            // 更新104还原的数据
            workshopHourlyData.put("104还原", adjustedHourlyData);
            
            double originalTotal = restoration104Data.stream().mapToDouble(Double::doubleValue).sum();
            double presslessTotal = presslessData.stream().mapToDouble(Double::doubleValue).sum();
            double adjustedTotal = adjustedHourlyData.stream().mapToDouble(Double::doubleValue).sum();
            
            log.info("🔥 104还原已扣除无压烧结: 原始总量={}, 无压烧结={}, 调整后={}", 
                    String.format("%.2f", originalTotal), 
                    String.format("%.2f", presslessTotal), 
                    String.format("%.2f", adjustedTotal));
        }

        // 10. 转换数组为List
        List<Double> hourlyTotal = new ArrayList<>();
        for (double d : hourlyTotalArray) {
            hourlyTotal.add(d);
        }

        // 转换为有序Map（保持车间顺序）
        Map<String, List<Double>> orderedHourlyData = new LinkedHashMap<>();
        for (String workshop : workshops) {
            orderedHourlyData.put(workshop, workshopHourlyData.get(workshop));
        }

        // 11. 构建返回结果
        HourlyEnergyStatistics statistics = new HourlyEnergyStatistics();
        statistics.setYear(year);
        statistics.setMonth(month);
        statistics.setDay(day);
        statistics.setWorkshopList(workshops);
        statistics.setWorkshopHourlyData(orderedHourlyData);
        statistics.setHourlyTotal(hourlyTotal);

        long totalElapsed = System.currentTimeMillis() - totalStartTime;
        log.info("✅ 日能耗统计完成: {}个车间，总耗时: {}ms", workshops.size(), totalElapsed);
        return statistics;
    }

    /**
     * 创建空的统计对象
     */
    private HourlyEnergyStatistics createEmptyStatistics(Integer year, Integer month, Integer day) {
        HourlyEnergyStatistics statistics = new HourlyEnergyStatistics();
        statistics.setYear(year);
        statistics.setMonth(month);
        statistics.setDay(day);
        statistics.setWorkshopList(new ArrayList<>());
        statistics.setWorkshopHourlyData(new LinkedHashMap<>());
        statistics.setHourlyTotal(new ArrayList<>(Collections.nCopies(24, 0.0)));
        return statistics;
    }
}
