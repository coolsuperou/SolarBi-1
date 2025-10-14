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
import java.util.*;
import java.util.stream.Collectors;

/**
 * 月度能耗统计服务实现
 */
@Service
@Slf4j
public class MonthlyEnergyServiceImpl implements MonthlyEnergyService {

    @Resource
    private MonthlyEnergyMapper monthlyEnergyMapper;
    
    @Resource
    private UserService userService;

    @Override
    public MonthlyEnergyStatistics getMonthlyStatistics(Integer year, Integer month, HttpServletRequest request) {
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

        // 3. 查询用户有权限的车间数据
        List<TempMonitor> allRawData = monthlyEnergyMapper.selectMonthlyRawData(
            allowedWorkshops, monthStart, monthEnd);
        
        if (allRawData == null || allRawData.isEmpty()) {
            log.warn("{}年{}月无数据", year, month);
            return createEmptyStatistics(year, month, daysInMonth);
        }
        
        log.info("查询到{}条原始数据", allRawData.size());
        
        // 4. 从查询结果中提取实际返回的车间列表并按照allowedWorkshops的顺序排列
        Set<String> workshopSet = allRawData.stream()
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
        
        // 5. 按车间分组原始数据
        Map<String, List<TempMonitor>> dataByWorkshop = allRawData.stream()
            .filter(d -> d.getWorkshop() != null && !d.getWorkshop().isEmpty())
            .collect(Collectors.groupingBy(TempMonitor::getWorkshop));
        
        // 6. 初始化数据结构
        Map<String, List<Double>> workshopDailyData = new LinkedHashMap<>();
        Map<String, Double> workshopMonthlyTotal = new LinkedHashMap<>();
        List<Double> dailyTotal = new ArrayList<>(Collections.nCopies(daysInMonth, 0.0));
        
        // 7. 遍历每个车间计算能耗
        for (String workshop : workshops) {
            log.info("开始统计车间: {}", workshop);
            
            List<TempMonitor> workshopData = dataByWorkshop.getOrDefault(workshop, Collections.emptyList());
            
            if (workshopData.isEmpty()) {
                log.warn("车间 {} 无数据", workshop);
                workshopDailyData.put(workshop, new ArrayList<>(Collections.nCopies(daysInMonth, 0.0)));
                workshopMonthlyTotal.put(workshop, 0.0);
                continue;
            }

            // 使用 EnergyCalculationUtils 计算日能耗
            List<DailyEnergyConsumption> dailyConsumptions = 
                EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                    workshopData, monthStart, monthEnd, workshop);
            
            // 转换为数组格式
            List<Double> dailyData = new ArrayList<>(Collections.nCopies(daysInMonth, 0.0));
            double monthlySum = 0.0;

            for (DailyEnergyConsumption consumption : dailyConsumptions) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(consumption.getDay());
                int day = cal.get(Calendar.DAY_OF_MONTH);
                
                double energy = consumption.getEnergyConsumption() != null ? 
                               consumption.getEnergyConsumption() : 0.0;
                
                if (day >= 1 && day <= daysInMonth) {
                    dailyData.set(day - 1, energy);
                    monthlySum += energy;
                    // 累加到每日总能耗
                    dailyTotal.set(day - 1, dailyTotal.get(day - 1) + energy);
                }
            }

            workshopDailyData.put(workshop, dailyData);
            workshopMonthlyTotal.put(workshop, monthlySum);
            
            log.info("车间 {} 月度总能耗: {} kWh", workshop, String.format("%.2f", monthlySum));
        }

        // 8. 计算月度总能耗
        double monthlyTotal = workshopMonthlyTotal.values().stream()
                .mapToDouble(Double::doubleValue).sum();

        statistics.setWorkshopDailyData(workshopDailyData);
        statistics.setWorkshopMonthlyTotal(workshopMonthlyTotal);
        statistics.setDailyTotal(dailyTotal);
        statistics.setMonthlyTotal(monthlyTotal);

        log.info("✅ 月度统计完成: 总能耗 = {} kWh", String.format("%.2f", monthlyTotal));
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
        statistics.setDailyTotal(new ArrayList<>(Collections.nCopies(daysInMonth, 0.0)));
        statistics.setMonthlyTotal(0.0);
        return statistics;
    }
}
