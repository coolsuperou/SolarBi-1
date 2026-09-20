package com.yupi.springbootinit.controller;

import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.model.dto.electricitycost.ElectricityCostRequest;
import com.yupi.springbootinit.model.dto.electricitycost.ElectricityCostResponse;
import com.yupi.springbootinit.model.dto.electricitycost.PowerSupplyDataRequest;
import com.yupi.springbootinit.model.dto.electricitycost.PowerSupplyDataVO;
import com.yupi.springbootinit.service.ElectricityCostService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * 电费分摊计算接口
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
@RestController
@RequestMapping("/electricity-cost")
@Slf4j
public class ElectricityCostController {

    @Resource
    private ElectricityCostService electricityCostService;

    /**
     * 查询供电局数据
     *
     * @param year  年份
     * @param month 月份
     * @return 供电局数据
     */
    @GetMapping("/power-supply-data/get")
    public BaseResponse<PowerSupplyDataVO> getPowerSupplyData(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        log.info("📊 查询供电局数据: {}年{}月", year, month);
        
        try {
            PowerSupplyDataVO data = electricityCostService.getPowerSupplyData(year, month);
            if (data == null) {
                log.info("⚠️ 未找到供电局数据: {}年{}月", year, month);
                return ResultUtils.success(null);
            }
            log.info("✅ 查询供电局数据成功: {}年{}月", year, month);
            return ResultUtils.success(data);
        } catch (Exception e) {
            log.error("❌ 查询供电局数据失败: {}年{}月", year, month, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "查询失败: " + e.getMessage());
        }
    }

    /**
     * 保存/更新供电局数据
     *
     * @param request 供电局数据请求
     * @param httpRequest HTTP请求对象
     * @return 是否成功
     */
    @PostMapping("/power-supply-data/save")
    public BaseResponse<Boolean> savePowerSupplyData(
            @RequestBody PowerSupplyDataRequest request,
            javax.servlet.http.HttpServletRequest httpRequest) {
        log.info("💾 保存供电局数据: {}年{}月", request.getYear(), request.getMonth());
        
        try {
            boolean result = electricityCostService.savePowerSupplyData(request, httpRequest);
            if (result) {
                log.info("✅ 保存供电局数据成功: {}年{}月", request.getYear(), request.getMonth());
            } else {
                log.warn("⚠️ 保存供电局数据失败: {}年{}月", request.getYear(), request.getMonth());
            }
            return ResultUtils.success(result);
        } catch (BusinessException e) {
            log.error("❌ 保存供电局数据失败: {}年{}月, 错误: {}", 
                    request.getYear(), request.getMonth(), e.getMessage());
            return ResultUtils.error(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("❌ 保存供电局数据失败: {}年{}月", request.getYear(), request.getMonth(), e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "保存失败: " + e.getMessage());
        }
    }

    /**
     * 模式一：仅1-24日数据计算
     *
     * @param year 年份
     * @param month 月份
     * @return 计算结果
     */
    @GetMapping("/calculate-mode1")
    public BaseResponse<ElectricityCostResponse> calculateMode1(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        log.info("💰 模式一计算: {}年{}月", year, month);
        
        try {
            ElectricityCostRequest request = new ElectricityCostRequest();
            request.setYear(year);
            request.setMonth(month);
            ElectricityCostResponse response = electricityCostService.calculateMode1(request);
            log.info("✅ 模式一计算成功: {}年{}月, 总金额={}元", 
                    year, month, response.getTotalCost());
            return ResultUtils.success(response);
        } catch (BusinessException e) {
            log.error("❌ 模式一计算失败: {}年{}月, 错误: {}", 
                    year, month, e.getMessage());
            return ResultUtils.error(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("❌ 模式一计算失败: {}年{}月", year, month, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "计算失败: " + e.getMessage());
        }
    }

    /**
     * 模式二：仅25-月末数据计算
     *
     * @param year 年份
     * @param month 月份
     * @return 计算结果
     */
    @GetMapping("/calculate-mode2")
    public BaseResponse<ElectricityCostResponse> calculateMode2(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        log.info("💰 模式二计算: {}年{}月", year, month);
        
        try {
            ElectricityCostRequest request = new ElectricityCostRequest();
            request.setYear(year);
            request.setMonth(month);
            ElectricityCostResponse response = electricityCostService.calculateMode2(request);
            log.info("✅ 模式二计算成功: {}年{}月, 总金额={}元", 
                    year, month, response.getTotalCost());
            return ResultUtils.success(response);
        } catch (BusinessException e) {
            log.error("❌ 模式二计算失败: {}年{}月, 错误: {}", 
                    year, month, e.getMessage());
            return ResultUtils.error(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("❌ 模式二计算失败: {}年{}月", year, month, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "计算失败: " + e.getMessage());
        }
    }

    /**
     * 模式三：两期数据都有计算
     *
     * @param year 年份
     * @param month 月份
     * @return 计算结果
     */
    @GetMapping("/calculate-mode3")
    public BaseResponse<ElectricityCostResponse> calculateMode3(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        log.info("💰 模式三计算: {}年{}月", year, month);
        
        try {
            ElectricityCostRequest request = new ElectricityCostRequest();
            request.setYear(year);
            request.setMonth(month);
            ElectricityCostResponse response = electricityCostService.calculateMode3(request);
            log.info("✅ 模式三计算成功: {}年{}月, 总金额={}元", 
                    year, month, response.getTotalCost());
            return ResultUtils.success(response);
        } catch (BusinessException e) {
            log.error("❌ 模式三计算失败: {}年{}月, 错误: {}", 
                    year, month, e.getMessage());
            return ResultUtils.error(e.getCode(), e.getMessage());
        } catch (Exception e) {
            log.error("❌ 模式三计算失败: {}年{}月", year, month, e);
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "计算失败: " + e.getMessage());
        }
    }
}
