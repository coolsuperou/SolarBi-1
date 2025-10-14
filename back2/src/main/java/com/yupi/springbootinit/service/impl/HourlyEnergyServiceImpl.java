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
import java.util.stream.Collectors;

/**
 * 日能耗统计服务实现
 */
@Service
@Slf4j
public class HourlyEnergyServiceImpl implements HourlyEnergyService {

    @Resource
    private HourlyEnergyMapper hourlyEnergyMapper;
    
    @Resource
    private UserService userService;

    @Override
    @Transactional(readOnly = true)
    public HourlyEnergyStatistics getHourlyStatistics(Integer year, Integer month, Integer day, HttpServletRequest request) {
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

        // 3. 查询用户有权限的车间数据
        List<TempMonitor> allRawData = hourlyEnergyMapper.selectAllWorkshopsHourlyData(allowedWorkshops, startTime, endTime);

        if (allRawData == null || allRawData.isEmpty()) {
            log.warn("{}年{}月{}日无数据", year, month, day);
            return createEmptyStatistics(year, month, day);
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

        log.info("实际返回{}个车间: {}", workshops.size(), workshops);

        // 5. 按车间分组数据
        Map<String, List<TempMonitor>> dataByWorkshop = allRawData.stream()
            .filter(d -> d.getWorkshop() != null)
            .collect(Collectors.groupingBy(TempMonitor::getWorkshop));

        // 6. 计算每个车间的24小时能耗
        Map<String, List<Double>> workshopHourlyData = new LinkedHashMap<>();
        List<Double> hourlyTotal = new ArrayList<>(Collections.nCopies(24, 0.0));

        for (String workshop : workshops) {
            List<TempMonitor> workshopData = dataByWorkshop.getOrDefault(workshop, Collections.emptyList());

            if (workshopData.isEmpty()) {
                workshopHourlyData.put(workshop, new ArrayList<>(Collections.nCopies(24, 0.0)));
                continue;
            }

            // 调用工具类计算小时能耗
            List<HourlyEnergyConsumption> hourlyConsumptions = 
                EnergyCalculationUtils.calculateHourlyEnergyFromRawData(
                    workshopData, startTime, endTime, workshop);

            // 🔥 输出车间计算详情
            log.info("\n车间【{}】计算详情:", workshop);
            log.info("--------------------------------------------------------------------------------");

            // 转换为24小时数组
            List<Double> hourlyData = new ArrayList<>(Collections.nCopies(24, 0.0));
            for (HourlyEnergyConsumption consumption : hourlyConsumptions) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(consumption.getHour());
                int hour = cal.get(Calendar.HOUR_OF_DAY);
                
                // 计算索引：07:00对应索引0
                int index = (hour - EnergyTimeConfig.DAY_START_HOUR + 24) % 24;
                if (index >= 0 && index < 24) {
                    // 🔥 防止次日07:00的数据覆盖当天07:00的数据
                    if (hourlyData.get(index) != 0.0) {
                        log.warn("⚠️ 跳过重复的小时数据: {}:00 (index={}), 已经有值={}", 
                            String.format("%02d", hour), index, hourlyData.get(index));
                        continue;
                    }
                    
                    Double energy = consumption.getEnergyConsumption() != null ? 
                                   consumption.getEnergyConsumption() : 0.0;
                    hourlyData.set(index, energy);
                    hourlyTotal.set(index, hourlyTotal.get(index) + energy);
                    
                    // 🔥 输出每个小时的详细计算数据
                    Calendar nextHourCal = Calendar.getInstance();
                    nextHourCal.setTime(consumption.getHour());
                    nextHourCal.add(Calendar.HOUR_OF_DAY, 1);
                    int nextHour = nextHourCal.get(Calendar.HOUR_OF_DAY);
                    
                    String startEnergyStr = consumption.getStartEnergy() != null ? String.format("%.2f", consumption.getStartEnergy()) : "N/A";
                    String endEnergyStr = consumption.getEndEnergy() != null ? String.format("%.2f", consumption.getEndEnergy()) : "N/A";
                    String energyStr = String.format("%.2f", energy);
                    String startTimeStr = consumption.getStartTime() != null ? consumption.getStartTime().toString() : "N/A";
                    String endTimeStr = consumption.getEndTime() != null ? consumption.getEndTime().toString() : "N/A";
                    
                    log.info("  📌 {}:00-{}:00 | 起始电能={} kWh | 结束电能={} kWh | 消耗={} kWh | 起始时间={} | 结束时间={}",
                        String.format("%02d", hour),
                        String.format("%02d", nextHour),
                        startEnergyStr,
                        endEnergyStr,
                        energyStr,
                        startTimeStr,
                        endTimeStr
                    );
                }
            }

            workshopHourlyData.put(workshop, hourlyData);
        }

        // 7. 构建返回结果
        HourlyEnergyStatistics statistics = new HourlyEnergyStatistics();
        statistics.setYear(year);
        statistics.setMonth(month);
        statistics.setDay(day);
        statistics.setWorkshopList(workshops);
        statistics.setWorkshopHourlyData(workshopHourlyData);
        statistics.setHourlyTotal(hourlyTotal);

        log.info("✅ 日能耗统计完成: {}个车间", workshops.size());
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
