package com.yupi.springbootinit.service.impl;

import com.yupi.springbootinit.config.EnergyTimeConfig;
import com.yupi.springbootinit.mapper.sqlserver.MonthlyEnergyMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.MonthlyEnergyStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.MonthlyEnergyService;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
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
    
    //  车间显示顺序（与路由配置一致）
    private static final List<String> WORKSHOP_ORDER = Arrays.asList(
        "114_空调水机主机",
        "110注射环保设备",
        "102造粒环保设备",
        "1#办公楼",
        "101配料",
        "102造粒",
        "103冷压",
        "104还原",
        "105烧结",
        "106清洗",
        "107串珠",
        "109炼胶",
        "110注射",
        "111开刃",
        "112终检",
        "113仓库",
        "114_2#厂房电梯",
        "114_2#楼办公区域",
        "114_2#楼会议室",
        "114_2#楼实验室",
        "114公共",
        "114空压机",
        "充电桩",
        "工具研发中心",
        "门卫室",
        "食堂",
        "宿舍楼"
    );

    @Override
    public MonthlyEnergyStatistics getMonthlyStatistics(Integer year, Integer month) {
        log.info("开始计算{}年{}月的能耗统计", year, month);

        MonthlyEnergyStatistics statistics = new MonthlyEnergyStatistics();
        statistics.setYear(year);
        statistics.setMonth(month);

        // 1. 使用 EnergyTimeConfig 计算时间范围
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
        Calendar tempCal = Calendar.getInstance();
        tempCal.set(year, month - 1, 1);
        int daysInMonth = tempCal.getActualMaximum(Calendar.DAY_OF_MONTH);
        statistics.setDaysInMonth(daysInMonth);

        log.info("时间范围: {} 至 {}, 共{}天", monthStart, monthEnd, daysInMonth);

        // 2. 一次性查询所有车间数据（workshop 传 null）
        List<TempMonitor> allRawData = monthlyEnergyMapper.selectMonthlyRawData(
            null, monthStart, monthEnd);
        
        if (allRawData == null || allRawData.isEmpty()) {
            log.warn("{}年{}月无数据", year, month);
            return createEmptyStatistics(year, month, daysInMonth);
        }
        
        log.info("查询到{}条原始数据", allRawData.size());
        
        // 3. 从查询结果中提取车间列表并按业务顺序排序
        Set<String> workshopSet = allRawData.stream()
            .map(TempMonitor::getWorkshop)
            .filter(w -> w != null && !w.isEmpty())
            .collect(Collectors.toSet());
        
        // 🔥 按照预定义的顺序排列车间
        List<String> workshops = new ArrayList<>();
        for (String orderedWorkshop : WORKSHOP_ORDER) {
            if (workshopSet.contains(orderedWorkshop)) {
                workshops.add(orderedWorkshop);
            }
        }
        // 添加不在顺序列表中的车间（防止遗漏）
        for (String workshop : workshopSet) {
            if (!WORKSHOP_ORDER.contains(workshop)) {
                workshops.add(workshop);
                log.warn("发现未定义顺序的车间: {}", workshop);
            }
        }
        
        statistics.setWorkshopList(workshops);
        
        log.info("识别到{}个车间: {}", workshops.size(), workshops);
        
        // 4. 按车间分组原始数据
        Map<String, List<TempMonitor>> dataByWorkshop = allRawData.stream()
            .filter(d -> d.getWorkshop() != null && !d.getWorkshop().isEmpty())
            .collect(Collectors.groupingBy(TempMonitor::getWorkshop));
        
        // 5. 初始化数据结构
        Map<String, List<Double>> workshopDailyData = new LinkedHashMap<>();
        Map<String, Double> workshopMonthlyTotal = new LinkedHashMap<>();
        List<Double> dailyTotal = new ArrayList<>(Collections.nCopies(daysInMonth, 0.0));
        
        // 6. 遍历每个车间计算能耗
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

        // 7. 计算月度总能耗
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


