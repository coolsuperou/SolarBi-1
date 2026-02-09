package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.config.EnergyTimeConfig;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.mapper.sqlserver.ElectricityCostMapper;
import com.yupi.springbootinit.model.dto.electricitycost.*;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.entity.PowerSupplyData;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.service.ElectricityCostService;
import com.yupi.springbootinit.utils.EnergyCalculationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 电费分摊服务实现
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
@Service
@Slf4j
public class ElectricityCostServiceImpl extends ServiceImpl<ElectricityCostMapper, PowerSupplyData>
        implements ElectricityCostService {

    @Resource
    private ElectricityCostMapper electricityCostMapper;

    @Resource
    private com.yupi.springbootinit.service.UserService userService;
    
    @Resource
    private com.yupi.springbootinit.service.MonthlyEnergyService monthlyEnergyService;

    @Override
    public PowerSupplyDataVO getPowerSupplyData(Integer year, Integer month) {
        QueryWrapper<PowerSupplyData> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("year", year).eq("month", month);
        PowerSupplyData powerSupplyData = this.getOne(queryWrapper);
        
        if (powerSupplyData == null) {
            return null;
        }
        
        PowerSupplyDataVO vo = new PowerSupplyDataVO();
        BeanUtils.copyProperties(powerSupplyData, vo);
        return vo;
    }

    @Override
    public boolean savePowerSupplyData(PowerSupplyDataRequest request, javax.servlet.http.HttpServletRequest httpRequest) {
        if (request.getYear() == null || request.getMonth() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "年份和月份不能为空");
        }
        
        // 获取当前登录用户
        com.yupi.springbootinit.model.entity.User loginUser = userService.getLoginUser(httpRequest);
        String userName = loginUser.getUserName();
        
        // 查询是否已存在
        QueryWrapper<PowerSupplyData> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("year", request.getYear()).eq("month", request.getMonth());
        PowerSupplyData existData = this.getOne(queryWrapper);
        
        PowerSupplyData powerSupplyData = new PowerSupplyData();
        BeanUtils.copyProperties(request, powerSupplyData);
        
        // 设置更新人
        powerSupplyData.setUpdateBy(userName);
        
        if (existData != null) {
            // 更新
            powerSupplyData.setId(existData.getId());
            log.info("更新供电局数据: {}年{}月, 更新人: {}", request.getYear(), request.getMonth(), userName);
            return this.updateById(powerSupplyData);
        } else {
            // 新增
            log.info("新增供电局数据: {}年{}月, 更新人: {}", request.getYear(), request.getMonth(), userName);
            return this.save(powerSupplyData);
        }
    }

    @Override
    public ElectricityCostResponse calculateMode1(ElectricityCostRequest request) {
        log.info("模式一计算：仅1-24日数据，year={}, month={}", request.getYear(), request.getMonth());
        
        // 1. 获取供电局数据
        PowerSupplyDataVO powerSupplyData = getPowerSupplyData(request.getYear(), request.getMonth());
        if (powerSupplyData == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "未找到供电局数据");
        }
        
        // 2. 计算时间范围 (1日 7:00:00 到 24日 6:59:59)
        Calendar startCal = Calendar.getInstance();
        startCal.set(request.getYear(), request.getMonth() - 1, 1,
                EnergyTimeConfig.DAY_START_HOUR,
                EnergyTimeConfig.DAY_START_MINUTE,
                EnergyTimeConfig.DAY_START_SECOND);
        startCal.set(Calendar.MILLISECOND, 0);
        Date startTime = startCal.getTime();
        
        Calendar endCal = Calendar.getInstance();
        endCal.set(request.getYear(), request.getMonth() - 1, 25,
                EnergyTimeConfig.DAY_END_HOUR,
                EnergyTimeConfig.DAY_END_MINUTE,
                EnergyTimeConfig.DAY_END_SECOND);
        endCal.set(Calendar.MILLISECOND, 999);
        Date endTime = endCal.getTime();
        
        log.info("计算时间范围: {} 到 {}", startTime, endTime);
        
        // 3. 计算各车间电量
        Map<String, BigDecimal> workshopEnergyMap = calculateWorkshopEnergy(startTime, endTime);
        
        // 4. 计算总电量
        BigDecimal totalEnergy = workshopEnergyMap.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalEnergy.compareTo(BigDecimal.ZERO) == 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "1-24日总电量为0，无法计算");
        }
        
        log.info("1-24日总电量: {} kWh", totalEnergy);
        
        // 5. 计算单价
        BigDecimal unitPrice = powerSupplyData.getAmount1To24()
                .divide(totalEnergy, 4, RoundingMode.HALF_UP);
        
        log.info("计算单价: {} 元 ÷ {} kWh = {} 元/kWh",
                powerSupplyData.getAmount1To24(), totalEnergy, unitPrice);
        
        // 6. 生成部门电费明细
        List<DepartmentCostDTO> departmentCostList = generateDepartmentCostList(workshopEnergyMap, unitPrice);
        
        // 7. 计算一级部门汇总
        Map<String, ElectricityCostResponse.DepartmentSummaryDTO> dept1Summary = 
                calculateDept1Summary(departmentCostList);
        
        // 8. 组装响应
        ElectricityCostResponse response = new ElectricityCostResponse();
        response.setPowerSupplyData(powerSupplyData);
        response.setDepartmentCostList(departmentCostList);
        response.setDept1Summary(dept1Summary);
        response.setTotalEnergy(totalEnergy);
        response.setTotalCost(powerSupplyData.getAmount1To24());
        response.setAvgUnitPrice(unitPrice);
        
        return response;
    }

    @Override
    public ElectricityCostResponse calculateMode2(ElectricityCostRequest request) {
        log.info("模式二计算：仅25-月末数据，year={}, month={}", request.getYear(), request.getMonth());
        
        // 1. 获取供电局数据
        PowerSupplyDataVO powerSupplyData = getPowerSupplyData(request.getYear(), request.getMonth());
        if (powerSupplyData == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "未找到供电局数据");
        }
        
        // 2. 计算时间范围 (25日 7:00:00 到 月末 6:59:59)
        Calendar startCal = Calendar.getInstance();
        startCal.set(request.getYear(), request.getMonth() - 1, 25,
                EnergyTimeConfig.DAY_START_HOUR,
                EnergyTimeConfig.DAY_START_MINUTE,
                EnergyTimeConfig.DAY_START_SECOND);
        startCal.set(Calendar.MILLISECOND, 0);
        Date startTime = startCal.getTime();
        
        // 计算月末日期
        Calendar endCal = Calendar.getInstance();
        endCal.set(request.getYear(), request.getMonth(), 1,
                EnergyTimeConfig.DAY_END_HOUR,
                EnergyTimeConfig.DAY_END_MINUTE,
                EnergyTimeConfig.DAY_END_SECOND);
        endCal.set(Calendar.MILLISECOND, 999);
        Date endTime = endCal.getTime();
        
        log.info("计算时间范围: {} 到 {}", startTime, endTime);
        
        // 3. 计算各车间电量
        Map<String, BigDecimal> workshopEnergyMap = calculateWorkshopEnergy(startTime, endTime);
        
        // 4. 计算总电量
        BigDecimal totalEnergy = workshopEnergyMap.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (totalEnergy.compareTo(BigDecimal.ZERO) == 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "25-月末总电量为0，无法计算");
        }
        
        log.info("25-月末总电量: {} kWh", totalEnergy);
        
        // 5. 计算单价
        BigDecimal unitPrice = powerSupplyData.getAmount25ToEnd()
                .divide(totalEnergy, 4, RoundingMode.HALF_UP);
        
        log.info("计算单价: {} 元 ÷ {} kWh = {} 元/kWh",
                powerSupplyData.getAmount25ToEnd(), totalEnergy, unitPrice);
        
        // 6. 生成部门电费明细
        List<DepartmentCostDTO> departmentCostList = generateDepartmentCostList(workshopEnergyMap, unitPrice);
        
        // 7. 计算一级部门汇总
        Map<String, ElectricityCostResponse.DepartmentSummaryDTO> dept1Summary = 
                calculateDept1Summary(departmentCostList);
        
        // 8. 组装响应
        ElectricityCostResponse response = new ElectricityCostResponse();
        response.setPowerSupplyData(powerSupplyData);
        response.setDepartmentCostList(departmentCostList);
        response.setDept1Summary(dept1Summary);
        response.setTotalEnergy(totalEnergy);
        response.setTotalCost(powerSupplyData.getAmount25ToEnd());
        response.setAvgUnitPrice(unitPrice);
        
        return response;
    }

    @Override
    public ElectricityCostResponse calculateMode3(ElectricityCostRequest request) {
        log.info("模式三计算：两期数据都有，year={}, month={}", request.getYear(), request.getMonth());
        
        // 1. 获取供电局数据
        PowerSupplyDataVO powerSupplyData = getPowerSupplyData(request.getYear(), request.getMonth());
        if (powerSupplyData == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "未找到供电局数据");
        }
        
        // 🔥 2. 直接调用月度能耗统计服务获取整个月的数据（确保数据一致性）
        javax.servlet.http.HttpServletRequest httpRequest = 
            ((org.springframework.web.context.request.ServletRequestAttributes) 
                org.springframework.web.context.request.RequestContextHolder.getRequestAttributes())
                .getRequest();
        
        com.yupi.springbootinit.model.dto.tempmonitor.MonthlyEnergyStatistics monthlyStats = 
            monthlyEnergyService.getMonthlyStatistics(request.getYear(), request.getMonth(), httpRequest);
        
        if (monthlyStats == null || monthlyStats.getWorkshopMonthlyTotal() == null) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "无法获取月度能耗统计数据");
        }
        
        log.info("🔥 使用月度能耗统计数据，共{}个车间", monthlyStats.getWorkshopList().size());
        
        // 3. 从月度统计中提取1-24日和25-月末的数据
        Map<String, BigDecimal> workshopEnergy1To24 = new java.util.HashMap<>();
        Map<String, BigDecimal> workshopEnergy25ToEnd = new java.util.HashMap<>();
        Map<String, BigDecimal> workshopEnergyMap = new java.util.HashMap<>();
        
        int daysInMonth = monthlyStats.getDaysInMonth();
        
        for (String workshop : monthlyStats.getWorkshopList()) {
            List<BigDecimal> dailyData = monthlyStats.getWorkshopDailyData().get(workshop);
            if (dailyData == null || dailyData.isEmpty()) {
                continue;
            }
            
            // 累加1-24日的能耗（索引0-23，对应1日到24日）
            BigDecimal energy1To24 = BigDecimal.ZERO;
            for (int i = 0; i < 24 && i < dailyData.size(); i++) {
                energy1To24 = energy1To24.add(dailyData.get(i));
            }
            workshopEnergy1To24.put(workshop, energy1To24);
            
            // 累加25-月末的能耗（索引24到月末）
            BigDecimal energy25ToEnd = BigDecimal.ZERO;
            for (int i = 24; i < daysInMonth && i < dailyData.size(); i++) {
                energy25ToEnd = energy25ToEnd.add(dailyData.get(i));
            }
            workshopEnergy25ToEnd.put(workshop, energy25ToEnd);
            
            // 整个月的能耗（直接使用月度统计的汇总值）
            BigDecimal monthlyTotal = monthlyStats.getWorkshopMonthlyTotal().get(workshop);
            workshopEnergyMap.put(workshop, monthlyTotal);
        }
        
        // 4. 计算两个时间段的总电量
        BigDecimal totalEnergy1To24 = workshopEnergy1To24.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEnergy25ToEnd = workshopEnergy25ToEnd.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEnergy = monthlyStats.getMonthlyTotal();
        
        if (totalEnergy.compareTo(BigDecimal.ZERO) == 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "全月总电量为0，无法计算");
        }
        
        log.info("1-24日总电量: {} kWh", totalEnergy1To24);
        log.info("25-月末总电量: {} kWh", totalEnergy25ToEnd);
        log.info("全月总电量: {} kWh", totalEnergy);
        
        // 5. 计算总金额和各时间段的单价
        BigDecimal totalAmount = powerSupplyData.getAmount1To24().add(powerSupplyData.getAmount25ToEnd());
        
        // 计算1-24日内部单价
        BigDecimal unitPrice1To24 = BigDecimal.ZERO;
        if (totalEnergy1To24.compareTo(BigDecimal.ZERO) > 0) {
            unitPrice1To24 = powerSupplyData.getAmount1To24()
                    .divide(totalEnergy1To24, 4, RoundingMode.HALF_UP);
        }
        
        // 计算25-月末内部单价
        BigDecimal unitPrice25ToEnd = BigDecimal.ZERO;
        if (totalEnergy25ToEnd.compareTo(BigDecimal.ZERO) > 0) {
            unitPrice25ToEnd = powerSupplyData.getAmount25ToEnd()
                    .divide(totalEnergy25ToEnd, 4, RoundingMode.HALF_UP);
        }
        
        // 计算月平均单价
        BigDecimal monthlyAvgUnitPrice = totalAmount.divide(totalEnergy, 4, RoundingMode.HALF_UP);
        
        log.info("1-24日内部单价: {} 元 ÷ {} kWh = {} 元/kWh",
                powerSupplyData.getAmount1To24(), totalEnergy1To24, unitPrice1To24);
        log.info("25-月末内部单价: {} 元 ÷ {} kWh = {} 元/kWh",
                powerSupplyData.getAmount25ToEnd(), totalEnergy25ToEnd, unitPrice25ToEnd);
        log.info("月平均单价: {} 元 ÷ {} kWh = {} 元/kWh",
                totalAmount, totalEnergy, monthlyAvgUnitPrice);
        
        // 6. 生成部门电费明细（使用月平均单价）
        List<DepartmentCostDTO> departmentCostList = generateDepartmentCostList(workshopEnergyMap, monthlyAvgUnitPrice);
        
        // 7. 计算一级部门汇总
        Map<String, ElectricityCostResponse.DepartmentSummaryDTO> dept1Summary = 
                calculateDept1Summary(departmentCostList);
        
        // 8. 组装响应
        ElectricityCostResponse response = new ElectricityCostResponse();
        response.setPowerSupplyData(powerSupplyData);
        response.setDepartmentCostList(departmentCostList);
        response.setDept1Summary(dept1Summary);
        response.setTotalEnergy(totalEnergy);
        response.setEnergy1To24(totalEnergy1To24);  // 设置1-24日电量
        response.setEnergy25ToEnd(totalEnergy25ToEnd);  // 设置25-月末电量
        response.setTotalCost(totalAmount);
        response.setAvgUnitPrice1To24(unitPrice1To24);  // 设置1-24日内部单价
        response.setAvgUnitPrice25ToEnd(unitPrice25ToEnd);  // 设置25-月末内部单价
        response.setMonthlyAvgUnitPrice(monthlyAvgUnitPrice);  // 设置月平均单价
        
        return response;
    }

    /**
     * 计算一级部门汇总
     */
    private Map<String, ElectricityCostResponse.DepartmentSummaryDTO> calculateDept1Summary(
            List<DepartmentCostDTO> departmentCostList) {
        
        Map<String, ElectricityCostResponse.DepartmentSummaryDTO> summaryMap = new LinkedHashMap<>();
        
        for (DepartmentCostDTO dto : departmentCostList) {
            String dept1 = dto.getDept1();
            ElectricityCostResponse.DepartmentSummaryDTO summary = summaryMap.get(dept1);
            
            if (summary == null) {
                summary = new ElectricityCostResponse.DepartmentSummaryDTO();
                summary.setDeptName(dept1);
                summary.setTotalEnergy(BigDecimal.ZERO);
                summary.setTotalCost(BigDecimal.ZERO);
                summaryMap.put(dept1, summary);
            }
            
            summary.setTotalEnergy(summary.getTotalEnergy().add(dto.getEnergy()));
            summary.setTotalCost(summary.getTotalCost().add(dto.getCost()));
        }
        
        return summaryMap;
    }

    /**
     * 计算指定时间范围内各车间的电量
     * 
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 车间电量Map (车间名 -> 电量)
     */
    private Map<String, BigDecimal> calculateWorkshopEnergy(Date startTime, Date endTime) {
        // 1. 查询原始数据
        List<TempMonitor> rawData = electricityCostMapper.selectRawEnergyData(startTime, endTime);
        
        if (rawData == null || rawData.isEmpty()) {
            log.warn("时间范围 {} 到 {} 无原始数据", startTime, endTime);
            return new HashMap<>();
        }
        
        // 2. 按车间分组
        Map<String, List<TempMonitor>> dataByWorkshop = rawData.stream()
                .filter(d -> d.getWorkshop() != null && !d.getWorkshop().isEmpty())
                .collect(Collectors.groupingBy(TempMonitor::getWorkshop));
        
        // 3. 获取电能表设备映射(使用 DeviceID|NodeID 作为设备标识)
        Map<String, Set<String>> electricMeterMap = new HashMap<>();
        for (String workshop : dataByWorkshop.keySet()) {
            List<String> deviceKeys = electricityCostMapper.getElectricMeterDeviceKeys(workshop);
            if (deviceKeys != null && !deviceKeys.isEmpty()) {
                electricMeterMap.put(workshop, new HashSet<>(deviceKeys));
            }
        }
        
        // 4. 计算各车间电量
        Map<String, BigDecimal> workshopEnergyMap = new HashMap<>();
        
        for (Map.Entry<String, List<TempMonitor>> entry : dataByWorkshop.entrySet()) {
            String workshop = entry.getKey();
            List<TempMonitor> workshopData = entry.getValue();
            
            // 过滤出电能表设备的数据(使用 DeviceID|NodeID 匹配)
            Set<String> deviceKeys = electricMeterMap.get(workshop);
            if (deviceKeys == null || deviceKeys.isEmpty()) {
                log.warn("车间 {} 没有配置电能表设备", workshop);
                continue;
            }
            
            List<TempMonitor> filteredData = workshopData.stream()
                    .filter(d -> {
                        String deviceKey = d.getDeviceId() + "|" + d.getNodeId();
                        return deviceKeys.contains(deviceKey);
                    })
                    .collect(Collectors.toList());
            
            if (filteredData.isEmpty()) {
                log.warn("车间 {} 无电能表数据", workshop);
                continue;
            }
            
            // 使用 EnergyCalculationUtils 计算日能耗
            List<DailyEnergyConsumption> dailyConsumptions = 
                    EnergyCalculationUtils.calculateDailyEnergyFromRawData(
                            filteredData, startTime, endTime, workshop);
            
            // 累加所有天的能耗 - 直接使用 BigDecimal,避免 double 转换的精度损失
            BigDecimal totalEnergy = dailyConsumptions.stream()
                    .filter(c -> c.getEnergyConsumption() != null)
                    .map(DailyEnergyConsumption::getEnergyConsumption)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            
            workshopEnergyMap.put(workshop, totalEnergy);
            log.info("车间 {} 电量: {} kWh", workshop, totalEnergy.setScale(2, RoundingMode.HALF_UP));
        }
        
        // 🔥 特殊处理：104还原需要扣除无压烧结的数据
        if (workshopEnergyMap.containsKey("104还原") && workshopEnergyMap.containsKey("无压烧结")) {
            BigDecimal restoration104Energy = workshopEnergyMap.get("104还原");
            BigDecimal presslessEnergy = workshopEnergyMap.get("无压烧结");
            BigDecimal adjustedEnergy = restoration104Energy.subtract(presslessEnergy).max(BigDecimal.ZERO);
            
            workshopEnergyMap.put("104还原", adjustedEnergy);
            log.info("🔥 104还原已扣除无压烧结: 原始={} kWh, 无压烧结={} kWh, 调整后={} kWh", 
                    String.format("%.2f", restoration104Energy), 
                    String.format("%.2f", presslessEnergy), 
                    String.format("%.2f", adjustedEnergy));
        }
        
        return workshopEnergyMap;
    }

    /**
     * 根据车间电量和层级关系,生成部门电费明细
     * 
     * @param workshopEnergyMap 车间电量Map
     * @param unitPrice 单价
     * @return 部门电费明细列表
     */
    private List<DepartmentCostDTO> generateDepartmentCostList(
            Map<String, BigDecimal> workshopEnergyMap, BigDecimal unitPrice) {
        
        // 1. 查询车间层级关系
        List<Map<String, Object>> hierarchyList = electricityCostMapper.getWorkshopHierarchy();
        
        // 2. 按二级部门汇总电量
        Map<String, DepartmentCostDTO> dept2Map = new LinkedHashMap<>();
        
        for (Map<String, Object> hierarchy : hierarchyList) {
            String dept1 = (String) hierarchy.get("dept1");
            String dept2 = (String) hierarchy.get("dept2");
            String workshop = (String) hierarchy.get("Workshop");
            
            if (dept1 == null || dept2 == null || workshop == null) {
                continue;
            }
            
            // 获取该车间的电量
            BigDecimal workshopEnergy = workshopEnergyMap.getOrDefault(workshop, BigDecimal.ZERO);
            
            // 累加到二级部门
            String key = dept1 + "|" + dept2;
            DepartmentCostDTO dto = dept2Map.get(key);
            if (dto == null) {
                dto = new DepartmentCostDTO();
                dto.setDept1(dept1);
                dto.setDept2(dept2);
                dto.setEnergy(BigDecimal.ZERO);
                dto.setCost(BigDecimal.ZERO);
                dept2Map.put(key, dto);
            }
            
            dto.setEnergy(dto.getEnergy().add(workshopEnergy));
        }
        
        // 3. 计算各部门分摊金额并排序
        List<DepartmentCostDTO> result = new ArrayList<>();
        for (DepartmentCostDTO dto : dept2Map.values()) {
            BigDecimal cost = dto.getEnergy().multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);
            dto.setCost(cost);
            result.add(dto);
        }
        
        // 4. 按一级部门排序: 工具制造中心 -> 管理部 -> 工具研发中心
        result.sort((a, b) -> {
            int orderA = getDept1Order(a.getDept1());
            int orderB = getDept1Order(b.getDept1());
            if (orderA != orderB) {
                return Integer.compare(orderA, orderB);
            }
            // 同一级部门内按二级部门名称排序
            return a.getDept2().compareTo(b.getDept2());
        });
        
        return result;
    }
    
    /**
     * 获取一级部门的排序顺序
     */
    private int getDept1Order(String dept1) {
        if ("工具制造中心".equals(dept1)) {
            return 1;
        } else if ("管理部".equals(dept1)) {
            return 2;
        } else if ("工具研发中心".equals(dept1)) {
            return 3;
        }
        return 999; // 其他部门排在最后
    }
}
