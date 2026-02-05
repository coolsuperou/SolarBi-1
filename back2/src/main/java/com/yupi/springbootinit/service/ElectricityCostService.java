package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.yupi.springbootinit.model.dto.electricitycost.ElectricityCostRequest;
import com.yupi.springbootinit.model.dto.electricitycost.ElectricityCostResponse;
import com.yupi.springbootinit.model.dto.electricitycost.PowerSupplyDataRequest;
import com.yupi.springbootinit.model.dto.electricitycost.PowerSupplyDataVO;
import com.yupi.springbootinit.model.entity.PowerSupplyData;

/**
 * 电费分摊服务接口
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
public interface ElectricityCostService extends IService<PowerSupplyData> {

    /**
     * 查询供电局数据
     *
     * @param year  年份
     * @param month 月份
     * @return 供电局数据
     */
    PowerSupplyDataVO getPowerSupplyData(Integer year, Integer month);

    /**
     * 保存/更新供电局数据
     *
     * @param request 供电局数据请求
     * @param httpRequest HTTP请求对象(用于获取当前登录用户)
     * @return 是否成功
     */
    boolean savePowerSupplyData(PowerSupplyDataRequest request, javax.servlet.http.HttpServletRequest httpRequest);

    /**
     * 模式一：仅1-24日数据计算
     *
     * @param request 计算请求
     * @return 计算结果
     */
    ElectricityCostResponse calculateMode1(ElectricityCostRequest request);

    /**
     * 模式二：仅25-月末数据计算
     *
     * @param request 计算请求
     * @return 计算结果
     */
    ElectricityCostResponse calculateMode2(ElectricityCostRequest request);

    /**
     * 模式三：两期数据都有计算
     *
     * @param request 计算请求
     * @return 计算结果
     */
    ElectricityCostResponse calculateMode3(ElectricityCostRequest request);
}
