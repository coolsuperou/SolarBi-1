package com.yupi.springbootinit.service.impl;

import com.yupi.springbootinit.config.EnergyTimeConfig;
import com.yupi.springbootinit.mapper.sqlserver.HourlyEnergyMapper;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.HourlyEnergyService;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
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

    // 车间显示顺序（与月度统计保持一致）
    private static final List<String> WORKSHOP_ORDER = Arrays.asList(
        "114_空调水机主机", "110注射环保设备", "102造粒环保设备", "1#办公楼",
        "101配料", "102造粒", "103冷压", "104还原", "105烧结", "106清洗",
        "107串珠", "109炼胶", "110注射", "111开刃", "112终检", "113仓库",
        "114_2#厂房电梯", "114_2#楼办公区域", "114_2#楼会议室", "114_2#楼实验室",
        "114公共", "114空压机", "充电桩", "工具研发中心", "门卫室", "食堂", "宿舍楼"
    );

    @Override
    @Transactional(readOnly = true)
    public HourlyEnergyStatistics getHourlyStatistics(Integer year, Integer month, Integer day) {
        log.info("📊 接收日能耗统计请求: {}年{}月{}日", year, month, day);

        // 1. 计算时间范围：当天07:00 到次日08:00（多查1小时）
        Calendar startCal = Calendar.getInstance();
        startCal.set(year, month - 1, day, EnergyTimeConfig.DAY_START_HOUR, 0, 0);
        startCal.set(Calendar.MILLISECOND, 0);
        Date startTime = startCal.getTime();

        Calendar endCal = Calendar.getInstance();
        endCal.set(year, month - 1, day + 1, EnergyTimeConfig.DAY_START_HOUR + 1, 0, 0);
        endCal.set(Calendar.MILLISECOND, 0);
        Date endTime = endCal.getTime();

        log.info("时间范围: {} 至 {}", startTime, endTime);

        // 2. 查询所有车间原始数据
        List<TempMonitor> allRawData = hourlyEnergyMapper.selectAllWorkshopsHourlyData(startTime, endTime);

        if (allRawData == null || allRawData.isEmpty()) {
            log.warn("{}年{}月{}日无数据", year, month, day);
            return createEmptyStatistics(year, month, day);
        }

        log.info("查询到{}条原始数据", allRawData.size());

        // 3. 提取车间列表并排序
        Set<String> workshopSet = allRawData.stream()
            .map(TempMonitor::getWorkshop)
            .filter(w -> w != null && !w.isEmpty())
            .collect(Collectors.toSet());

        List<String> workshops = new ArrayList<>();
        for (String orderedWorkshop : WORKSHOP_ORDER) {
            if (workshopSet.contains(orderedWorkshop)) {
                workshops.add(orderedWorkshop);
            }
        }

        log.info("识别到{}个车间", workshops.size());

        // 4. 按车间分组数据
        Map<String, List<TempMonitor>> dataByWorkshop = allRawData.stream()
            .filter(d -> d.getWorkshop() != null)
            .collect(Collectors.groupingBy(TempMonitor::getWorkshop));

        // 5. 计算每个车间的24小时能耗
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
                    // 🔥 防止次日07:00的数据覆盖当姩07:00的数据
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

        // 6. 构建返回结果
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
