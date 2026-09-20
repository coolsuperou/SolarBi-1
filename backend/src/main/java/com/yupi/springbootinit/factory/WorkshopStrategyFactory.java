package com.yupi.springbootinit.factory;

import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.model.enums.CalculationStrategyType;
import com.yupi.springbootinit.model.enums.WorkshopEnum;
import com.yupi.springbootinit.strategy.WorkshopCalculationStrategy;
import com.yupi.springbootinit.strategy.impl.NestedSubtractionStrategy;
import com.yupi.springbootinit.strategy.impl.StandardCalculationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 车间策略工厂类
 * 根据车间配置返回对应的计算策略实例
 * 
 * @author 欧展煌
 */
@Component
@Slf4j
public class WorkshopStrategyFactory {
    
    @Autowired
    private StandardCalculationStrategy standardStrategy;
    
    @Autowired
    private NestedSubtractionStrategy nestedSubtractionStrategy;
    
    /**
     * 根据车间枚举获取对应的计算策略
     * 
     * @param workshop 车间枚举
     * @return 对应的计算策略实例
     * @throws BusinessException 当车间配置为null或策略类型不支持时抛出
     */
    public WorkshopCalculationStrategy getStrategy(WorkshopEnum workshop) {
        // 参数校验：车间配置为null时抛出BusinessException
        if (workshop == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "车间配置不能为空");
        }
        
        CalculationStrategyType strategyType = workshop.getStrategyType();
        
        // 根据策略类型返回对应的策略实例
        switch (strategyType) {
            case STANDARD:
                log.debug("使用标准计算策略: {}", workshop.getWorkshopName());
                return standardStrategy;
            case NESTED_SUBTRACTION:
                log.debug("使用嵌套减法策略: {}", workshop.getWorkshopName());
                return nestedSubtractionStrategy;
            default:
                // 不支持的策略类型异常处理
                throw new BusinessException(
                    ErrorCode.SYSTEM_ERROR, 
                    "不支持的策略类型: " + strategyType
                );
        }
    }
}
