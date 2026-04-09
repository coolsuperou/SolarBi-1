package com.yupi.springbootinit.service.impl;

import com.yupi.springbootinit.config.EnergyTimeConfig;
import com.yupi.springbootinit.mapper.sqlserver.MonthlyEnergyMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.MonthlyEnergyStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.service.MonthlyEnergyService;
import com.yupi.springbootinit.service.UserService;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import com.yupi.springbootinit.utils.WorkshopPermissionUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 月度能耗统计服务实现
 *  所有车间都只统计 tbl_monitordevice 中 IsElectricMeter=1 的设备
 *  优化：一次性查询所有车间的电能表设备，使用并行流加速计算
 * 
 * @author 每天十点睡
 * @date 2026-02-09
 * 修改：使用 BigDecimal 替代 Double，确保精确计算，避免浮点数误差
 */
@Service
@Slf4j
public class MonthlyEnergyServiceImpl implements MonthlyEnergyService {

    @Resource
    private MonthlyEnergyMapper monthlyEnergyMapper;
    
    @Resource
    private UserService userService;

    /**
     * 🔥 一次性获取所有车间的电能表设备映射（使用DeviceID|NodeID组合）
     * @param workshopList 车间列表
     * @return Set<电能表设备Key（DeviceID|NodeID）>
     */
    private Set<String> getElectricMeterDeviceKeys(List<String> workshopList) {
        long startTime = System.currentTimeMillis();
        
        // 批量查询所有车间的电能表设备Key
        List<String> deviceKeys = monthlyEnergyMapper.getElectricMeterDeviceKeysByWorkshops(workshopList);
        Set<String> deviceKeySet = new HashSet<>(deviceKeys);
        
        long elapsed = System.currentTimeMillis() - startTime;
        log.info("🔥 批量查询电能表设备Key完成，耗时: {}ms，共{}个设备", elapsed, deviceKeySet.size());
        
        return deviceKeySet;
    }

    /**
     * 🔥 过滤原始数据，只保留电能表设备的数据（使用DeviceID|NodeID匹配）
     */
    private List<TempMonitor> filterByElectricMeterDeviceKeys(List<TempMonitor> rawData, Set<String> electricMeterDeviceKeys) {
        if (rawData == null || rawData.isEmpty() || electricMeterDeviceKeys == null || electricMeterDeviceKeys.isEmpty()) {
            return new ArrayList<>();
        }
        
        return rawData.stream()
                .filter(item -> {
                    String deviceKey = item.getDeviceId() + "|" + item.getNodeId();
                    return electricMeterDeviceKeys.contains(deviceKey);
                })
                .collect(Collectors.toList());
    }

    @Override
    public MonthlyEnergyStatistics getMonthlyStatistics(Integer year, Integer month, HttpServletRequest request) {
        long totalStartTime = System.currentTimeMillis();
        log.info("开始计算{}年{}月的能耗统计", year, month);

        MonthlyEnergyStatistics statistics = new MonthlyEnergyStatistics();
        statistics.setYear(year);
        statistics.setMonth(month);

        // 1. 获取当前用户并解析权限
        User loginUser = userService.getLoginUser(request);
        String pagePermissions = loginUser.getPagePermissions();
        List<String> allowedWorkshops = WorkshopPermissionUtils.parseWorkshopsFromPermissions(pagePermissions);
        
        log.info("用户 {} 有权访问的车间: {}", loginUser.getUserAccount(), allowedWorkshops);
        
        // 如果用户没有任何车间权限，返回空统计
        if (allowedWorkshops.isEmpty()) {
            log.warn("用户 {} 没有任何车间访问权限，返回空统计", loginUser.getUserAccount());
            int daysInMonth = getDaysInMonth(year, month);
            return createEmptyStatistics(year, month, daysInMonth);
        }

        // 2. 使用 EnergyTimeConfig 计算时间范围
        Calendar startCal = Calendar.getInstance();
        startCal.set(year, month - 1, 1, 
                     EnergyTimeConfig.DAY_START_HOUR, 
                     EnergyTimeConfig.DAY_START_MINUTE, 
                     EnergyTimeConfig.DAY_START_SECOND);
        startCal.set(Calendar.MILLISECOND, 0);
        Date monthStart = startCal.getTime();

        Calendar endCal = Calendar.getInstance();
        endCal.set(year, month, 1, 
                   EnergyTimeConfig.DAY_END_HOUR, 
                   EnergyTimeConfig.DAY_END_MINUTE, 
                   EnergyTimeConfig.DAY_END_SECOND);
        endCal.set(Calendar.MILLISECOND, 999);
        Date monthEnd = endCal.getTime();

        // 获取该月天数
        int daysInMonth = getDaysInMonth(year, month);
        statistics.setDaysInMonth(daysInMonth);

        log.info("时间范围: {} 至 {}, 共{}天", monthStart, monthEnd, daysInMonth);

        // 🔥 3. 一次性查询所有车间的电能表设备Key（DeviceID|NodeID组合）
        Set<String> electricMeterDeviceKeys = getElectricMeterDeviceKeys(allowedWorkshops);

        // 4. 查询用户有权限的车间数据
        long queryStartTime = System.currentTimeMillis();
        List<TempMonitor> allRawData = monthlyEnergyMapper.selectMonthlyRawData(
            allowedWorkshops, monthStart, monthEnd);
        log.info("查询原始数据耗时: {}ms，共{}条记录", System.currentTimeMillis() - queryStartTime, 
                allRawData != null ? allRawData.size() : 0);
        
        if (allRawData == null || allRawData.isEmpty()) {
            log.warn("{}年{}月无数据", year, month);
            return createEmptyStatistics(year, month, daysInMonth);
        }
        
        // 🔥 5. 过滤原始数据，只保留电能表设备的数据（使用DeviceID|NodeID匹配）
        long filterStartTime = System.currentTimeMillis();
        List<TempMonitor> filteredRawData = filterByElectricMeterDeviceKeys(allRawData, electricMeterDeviceKeys);
        log.info("🔥 电能表过滤完成（DeviceID|NodeID匹配），耗时: {}ms，原始记录: {}，过滤后: {}", 
                System.currentTimeMillis() - filterStartTime, allRawData.size(), filteredRawData.size());
        
        if (filteredRawData.isEmpty()) {
            log.warn("过滤后无电能表数据");
            return createEmptyStatistics(year, month, daysInMonth);
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
        
        statistics.setWorkshopList(workshops);
        log.info("实际返回{}个车间: {}", workshops.size(), workshops);
        
        // 7. 按车间分组过滤后的数据
        Map<String, List<TempMonitor>> dataByWorkshop = filteredRawData.stream()
            .filter(d -> d.getWorkshop() != null && !d.getWorkshop().isEmpty())
            .collect(Collectors.groupingBy(TempMonitor::getWorkshop));
        
        // 8. 初始化数据结构
        Map<String, List<BigDecimal>> workshopDailyData = new LinkedHashMap<>();
        Map<String, BigDecimal> workshopMonthlyTotal = new LinkedHashMap<>();
        BigDecimal[] dailyTotalArray = new BigDecimal[daysInMonth];
        // 初始化数组为 BigDecimal.ZERO
        for (int i = 0; i < daysInMonth; i++) {
            dailyTotalArray[i] = BigDecimal.ZERO;
        }
        
        // 🔥 9. 遍历每个车间计算能耗（串行处理，便于打印详细日志）
        long calcStartTime = System.currentTimeMillis();
        
        for (String workshop : workshops) {
            List<TempMonitor> workshopData = dataByWorkshop.getOrDefault(workshop, Collections.emptyList());
            
            if (workshopData.isEmpty()) {
                log.warn("车间 {} 无数据", workshop);
                List<BigDecimal> emptyList = new ArrayList<>();
                for (int i = 0; i < daysInMonth; i++) {
                    emptyList.add(BigDecimal.ZERO);
                }
                workshopDailyData.put(workshop, emptyList);
                workshopMonthlyTotal.put(workshop, BigDecimal.ZERO);
                continue;
            }

            // 使用 EnergyCalculationUtils 计算日能耗
            List<DailyEnergyConsumption> dailyConsumptions = 
                EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                    workshopData, monthStart, monthEnd, workshop);
            
            // 🔥 打印车间计算详情表头
            log.info("");
            log.info("╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗");
            log.info("║  📊 车间【{}】 {}年{}月 每日电能计算详情", workshop, year, month);
            log.info("╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣");
            log.info("║  日期        │ 开始电能(kWh)  │ 结束电能(kWh)  │ 消耗电能(kWh)  │ 开始时间                │ 结束时间");
            log.info("╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣");
            
            // 转换为数组格式
            List<BigDecimal> dailyData = new ArrayList<>();
            for (int i = 0; i < daysInMonth; i++) {
                dailyData.add(BigDecimal.ZERO);
            }
            BigDecimal monthlySum = BigDecimal.ZERO;

            for (DailyEnergyConsumption consumption : dailyConsumptions) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(consumption.getDay());
                int dayOfMonth = cal.get(Calendar.DAY_OF_MONTH);
                
                BigDecimal energy = consumption.getEnergyConsumption() != null ? 
                               consumption.getEnergyConsumption() : BigDecimal.ZERO;
                
                if (dayOfMonth >= 1 && dayOfMonth <= daysInMonth) {
                    dailyData.set(dayOfMonth - 1, energy);
                    monthlySum = monthlySum.add(energy);
                    dailyTotalArray[dayOfMonth - 1] = dailyTotalArray[dayOfMonth - 1].add(energy);
                    
                    // 🔥 打印每日计算详情
                    String dateStr = String.format("%d月%02d日", month, dayOfMonth);
                    String startEnergyStr = consumption.getStartEnergy() != null ? 
                            String.format("%14.2f", consumption.getStartEnergy()) : "          N/A ";
                    String endEnergyStr = consumption.getEndEnergy() != null ? 
                            String.format("%14.2f", consumption.getEndEnergy()) : "          N/A ";
                    String consumptionStr = String.format("%14.2f", energy);
                    
                    // 格式化时间显示
                    String startTimeStr = consumption.getStartTime() != null ? 
                            formatDateTime(consumption.getStartTime()) : "N/A";
                    String endTimeStr = consumption.getEndTime() != null ? 
                            formatDateTime(consumption.getEndTime()) : "N/A";
                    
                    log.info("║  {}   │ {} │ {} │ {} │ {} │ {}", 
                            dateStr, startEnergyStr, endEnergyStr, consumptionStr, startTimeStr, endTimeStr);
                }
            }
            
            // 🔥 打印车间月度汇总
            log.info("╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣");
            log.info("║  📈 月度汇总: {} kWh", monthlySum.setScale(2, RoundingMode.HALF_UP));
            log.info("╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝");
            log.info("");

            workshopDailyData.put(workshop, dailyData);
            workshopMonthlyTotal.put(workshop, monthlySum);
        }
        
        log.info("🔥 计算完成，耗时: {}ms", System.currentTimeMillis() - calcStartTime);

        // 🔥 特殊处理：104还原需要扣除无压烧结的数据
        if (workshopDailyData.containsKey("104还原") && workshopDailyData.containsKey("无压烧结")) {
            List<BigDecimal> restoration104Data = workshopDailyData.get("104还原");
            List<BigDecimal> presslessData = workshopDailyData.get("无压烧结");
            BigDecimal restoration104Total = workshopMonthlyTotal.get("104还原");
            BigDecimal presslessTotal = workshopMonthlyTotal.get("无压烧结");
            
            // 按天扣除
            List<BigDecimal> adjustedDailyData = new ArrayList<>();
            for (int i = 0; i < daysInMonth; i++) {
                BigDecimal original = restoration104Data.get(i);
                BigDecimal pressless = presslessData.get(i);
                BigDecimal adjusted = original.subtract(pressless).max(BigDecimal.ZERO);
                adjustedDailyData.add(adjusted);
                
                // 同时更新每日总能耗（先减去原值，再加上调整后的值）
                dailyTotalArray[i] = dailyTotalArray[i].subtract(original).add(adjusted);
            }
            
            // 更新104还原的数据
            workshopDailyData.put("104还原", adjustedDailyData);
            BigDecimal adjustedTotal = restoration104Total.subtract(presslessTotal).max(BigDecimal.ZERO);
            workshopMonthlyTotal.put("104还原", adjustedTotal);
            
            log.info("🔥 104还原已扣除无压烧结: 原始总量={}, 无压烧结={}, 调整后={}", 
                    restoration104Total.setScale(2, RoundingMode.HALF_UP), 
                    presslessTotal.setScale(2, RoundingMode.HALF_UP), 
                    adjustedTotal.setScale(2, RoundingMode.HALF_UP));
        }

        // 10. 转换数组为List并计算月度总能耗
        List<BigDecimal> dailyTotal = new ArrayList<>();
        for (BigDecimal d : dailyTotalArray) {
            dailyTotal.add(d);
        }
        
        BigDecimal monthlyTotal = workshopMonthlyTotal.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 转换为有序Map（保持车间顺序）
        Map<String, List<BigDecimal>> orderedDailyData = new LinkedHashMap<>();
        Map<String, BigDecimal> orderedMonthlyTotal = new LinkedHashMap<>();
        for (String workshop : workshops) {
            orderedDailyData.put(workshop, workshopDailyData.get(workshop));
            orderedMonthlyTotal.put(workshop, workshopMonthlyTotal.get(workshop));
        }

        statistics.setWorkshopDailyData(orderedDailyData);
        statistics.setWorkshopMonthlyTotal(orderedMonthlyTotal);
        statistics.setDailyTotal(dailyTotal);
        statistics.setMonthlyTotal(monthlyTotal);

        long totalElapsed = System.currentTimeMillis() - totalStartTime;
        log.info("✅ 月度统计完成: 总能耗 = {} kWh，总耗时: {}ms", 
                monthlyTotal.setScale(2, RoundingMode.HALF_UP), totalElapsed);
        return statistics;
    }
    
    /**
     * 获取指定月份的天数
     */
    private int getDaysInMonth(Integer year, Integer month) {
        Calendar tempCal = Calendar.getInstance();
        tempCal.set(year, month - 1, 1);
        return tempCal.getActualMaximum(Calendar.DAY_OF_MONTH);
    }
    
    /**
     * 创建空的统计对象
     */
    private MonthlyEnergyStatistics createEmptyStatistics(Integer year, Integer month, int daysInMonth) {
        MonthlyEnergyStatistics statistics = new MonthlyEnergyStatistics();
        statistics.setYear(year);
        statistics.setMonth(month);
        statistics.setDaysInMonth(daysInMonth);
        statistics.setWorkshopList(new ArrayList<>());
        statistics.setWorkshopDailyData(new LinkedHashMap<>());
        statistics.setWorkshopMonthlyTotal(new LinkedHashMap<>());
        
        List<BigDecimal> emptyDailyTotal = new ArrayList<>();
        for (int i = 0; i < daysInMonth; i++) {
            emptyDailyTotal.add(BigDecimal.ZERO);
        }
        statistics.setDailyTotal(emptyDailyTotal);
        statistics.setMonthlyTotal(BigDecimal.ZERO);
        return statistics;
    }

    /**
     * 🔥 格式化日期时间显示
     */
    private String formatDateTime(Date date) {
        if (date == null) return "N/A";
        SimpleDateFormat sdf = new SimpleDateFormat("MM-dd HH:mm:ss");
        return sdf.format(date);
    }
}
