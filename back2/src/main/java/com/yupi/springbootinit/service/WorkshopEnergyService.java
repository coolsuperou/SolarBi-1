package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.factory.WorkshopStrategyFactory;
import com.yupi.springbootinit.model.dto.tempmonitor.DailyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorQueryRequest;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import com.yupi.springbootinit.model.enums.WorkshopEnum;
import com.yupi.springbootinit.strategy.WorkshopCalculationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * 车间能耗统一服务类
 * 协调策略工厂和策略执行，处理所有车间的能耗计算业务逻辑
 * 
 * @author 欧展煌
 */
@Service
@Slf4j
public class WorkshopEnergyService {
    
    @Autowired
    private WorkshopStrategyFactory strategyFactory;
    
    /**
     * 获取小时能耗数据
     * 验证需求: 2.1, 2.2, 3.4, 3.5
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 小时能耗列表
     */
    public List<HourlyEnergyConsumption> getHourlyEnergyConsumption(
            String workshopName, Date startTime, Date endTime) {
        
        try {
            log.info("获取小时能耗数据 - 车间: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
            
            // 1. 根据车间名称查找WorkshopEnum配置
            WorkshopEnum workshop = WorkshopEnum.getByWorkshopName(workshopName);
            if (workshop == null) {
                log.error("未找到车间配置: {}", workshopName);
                throw new BusinessException(
                    ErrorCode.PARAMS_ERROR, 
                    "未找到车间配置: " + workshopName
                );
            }
            
            // 2. 调用策略工厂获取对应策略
            WorkshopCalculationStrategy strategy = strategyFactory.getStrategy(workshop);
            
            // 3. 执行策略的getHourlyEnergyConsumptionQuery方法
            List<HourlyEnergyConsumption> result = strategy.getHourlyEnergyConsumptionQuery(
                workshopName, null, startTime, endTime
            );
            
            log.info("获取小时能耗数据成功 - 车间: {}, 数据条数: {}", 
                workshopName, result != null ? result.size() : 0);
            
            return result;
            
        } catch (BusinessException e) {
            // 业务异常直接抛出
            throw e;
        } catch (Exception e) {
            // 其他异常包装后抛出
            log.error("获取小时能耗数据失败 - 车间: {}", workshopName, e);
            throw new BusinessException(
                ErrorCode.SYSTEM_ERROR, 
                "获取小时能耗数据失败: " + e.getMessage()
            );
        }
    }
    
    /**
     * 获取日能耗数据
     * 验证需求: 2.1, 2.2, 3.4, 3.5
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 日能耗列表
     */
    public List<DailyEnergyConsumption> getDailyEnergyConsumption(
            String workshopName, Date startTime, Date endTime) {
        
        try {
            log.info("获取日能耗数据 - 车间: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
            
            // 1. 根据车间名称查找WorkshopEnum配置
            WorkshopEnum workshop = WorkshopEnum.getByWorkshopName(workshopName);
            if (workshop == null) {
                log.error("未找到车间配置: {}", workshopName);
                throw new BusinessException(
                    ErrorCode.PARAMS_ERROR, 
                    "未找到车间配置: " + workshopName
                );
            }
            
            // 2. 调用策略工厂获取对应策略
            WorkshopCalculationStrategy strategy = strategyFactory.getStrategy(workshop);
            
            // 3. 执行策略的getDailyEnergyConsumptionQuery方法
            List<DailyEnergyConsumption> result = strategy.getDailyEnergyConsumptionQuery(
                workshopName, null, startTime, endTime
            );
            
            log.info("获取日能耗数据成功 - 车间: {}, 数据条数: {}", 
                workshopName, result != null ? result.size() : 0);
            
            return result;
            
        } catch (BusinessException e) {
            // 业务异常直接抛出
            throw e;
        } catch (Exception e) {
            // 其他异常包装后抛出
            log.error("获取日能耗数据失败 - 车间: {}", workshopName, e);
            throw new BusinessException(
                ErrorCode.SYSTEM_ERROR, 
                "获取日能耗数据失败: " + e.getMessage()
            );
        }
    }
    
    /**
     * 获取能耗消耗总值
     * 验证需求: 2.1, 2.2, 3.4, 3.5
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param mode 计算模式
     * @return 能耗消耗值
     */
    public Double getEnergyConsumption(
            String workshopName, Date startTime, Date endTime, String mode) {
        
        try {
            log.info("获取能耗消耗 - 车间: {}, 时间范围: {} 到 {}, 模式: {}", 
                workshopName, startTime, endTime, mode);
            
            // 1. 根据车间名称查找WorkshopEnum配置
            WorkshopEnum workshop = WorkshopEnum.getByWorkshopName(workshopName);
            if (workshop == null) {
                log.error("未找到车间配置: {}", workshopName);
                throw new BusinessException(
                    ErrorCode.PARAMS_ERROR, 
                    "未找到车间配置: " + workshopName
                );
            }
            
            // 2. 调用策略工厂获取对应策略
            WorkshopCalculationStrategy strategy = strategyFactory.getStrategy(workshop);
            
            // 3. 执行策略的getEnergyConsumption方法
            Double result = strategy.getEnergyConsumption(
                workshopName, startTime, endTime, mode
            );
            
            log.info("获取能耗消耗成功 - 车间: {}, 能耗值: {}", workshopName, result);
            
            return result;
            
        } catch (BusinessException e) {
            // 业务异常直接抛出
            throw e;
        } catch (Exception e) {
            // 其他异常包装后抛出
            log.error("获取能耗消耗失败 - 车间: {}", workshopName, e);
            throw new BusinessException(
                ErrorCode.SYSTEM_ERROR, 
                "获取能耗消耗失败: " + e.getMessage()
            );
        }
    }
    
    /**
     * 分页查询温湿电能数据（支持多条件查询）
     * 验证需求: 2.1, 2.2, 3.4, 3.5
     * 
     * @param workshopName 车间名称
     * @param request 查询请求参数
     * @return 分页结果
     */
    public Page<TempMonitor> queryByCondition(
            String workshopName, TempMonitorQueryRequest request) {
        
        try {
            log.info("分页查询温湿电能数据 - 车间: {}, 查询参数: {}", workshopName, request);
            
            // 1. 根据车间名称查找WorkshopEnum配置
            WorkshopEnum workshop = WorkshopEnum.getByWorkshopName(workshopName);
            if (workshop == null) {
                log.error("未找到车间配置: {}", workshopName);
                throw new BusinessException(
                    ErrorCode.PARAMS_ERROR, 
                    "未找到车间配置: " + workshopName
                );
            }
            
            // 2. 调用策略工厂获取对应策略
            WorkshopCalculationStrategy strategy = strategyFactory.getStrategy(workshop);
            
            // 3. 执行策略的queryByCondition方法
            Page<TempMonitor> result = strategy.queryByCondition(workshopName, request);
            
            log.info("分页查询温湿电能数据成功 - 车间: {}, 总记录数: {}, 当前页: {}", 
                workshopName, result.getTotal(), result.getCurrent());
            
            return result;
            
        } catch (BusinessException e) {
            // 业务异常直接抛出
            throw e;
        } catch (Exception e) {
            // 其他异常包装后抛出
            log.error("分页查询温湿电能数据失败 - 车间: {}", workshopName, e);
            throw new BusinessException(
                ErrorCode.SYSTEM_ERROR, 
                "分页查询温湿电能数据失败: " + e.getMessage()
            );
        }
    }
    
    /**
     * 获取统计信息
     * 验证需求: 2.1, 2.2, 3.4, 3.5
     * 
     * @param workshopName 车间名称
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    public TempMonitorStatistics getStatistics(
            String workshopName, Date startTime, Date endTime) {
        
        try {
            log.info("获取统计信息 - 车间: {}, 时间范围: {} 到 {}", 
                workshopName, startTime, endTime);
            
            // 1. 根据车间名称查找WorkshopEnum配置
            WorkshopEnum workshop = WorkshopEnum.getByWorkshopName(workshopName);
            if (workshop == null) {
                log.error("未找到车间配置: {}", workshopName);
                throw new BusinessException(
                    ErrorCode.PARAMS_ERROR, 
                    "未找到车间配置: " + workshopName
                );
            }
            
            // 2. 调用策略工厂获取对应策略
            WorkshopCalculationStrategy strategy = strategyFactory.getStrategy(workshop);
            
            // 3. 执行策略的getStatistics方法
            TempMonitorStatistics result = strategy.getStatistics(
                workshopName, startTime, endTime
            );
            
            log.info("获取统计信息成功 - 车间: {}, 设备总数: {}", 
                workshopName, result != null ? result.getTotalDevices() : 0);
            
            return result;
            
        } catch (BusinessException e) {
            // 业务异常直接抛出
            throw e;
        } catch (Exception e) {
            // 其他异常包装后抛出
            log.error("获取统计信息失败 - 车间: {}", workshopName, e);
            throw new BusinessException(
                ErrorCode.SYSTEM_ERROR, 
                "获取统计信息失败: " + e.getMessage()
            );
        }
    }
}
