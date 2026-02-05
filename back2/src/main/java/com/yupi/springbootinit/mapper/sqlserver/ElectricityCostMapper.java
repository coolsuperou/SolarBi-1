package com.yupi.springbootinit.mapper.sqlserver;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yupi.springbootinit.model.entity.PowerSupplyData;
import com.yupi.springbootinit.model.entity.TempMonitor;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 电费分摊Mapper
 *
 * @author 欧展煌
 * @date 2026-02-05
 */
public interface ElectricityCostMapper extends BaseMapper<PowerSupplyData> {

    /**
     * 查询指定时间范围内的原始电能数据
     * 
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 原始监控数据列表
     */
    @Select("SELECT " +
            "Id, DeviceID, Name, Tem, Hum, MAC, UpdateTime, " +
            "ElectricEnergy, NodeID, Workshop " +
            "FROM RSWS_TempMonitor_Copy " +
            "WHERE ElectricEnergy IS NOT NULL " +
            "AND Workshop != '备用' " +
            "AND Workshop != '备用总表' " +
            "AND UpdateTime >= #{startTime} " +
            "AND UpdateTime <= #{endTime} " +
            "ORDER BY Workshop, Name, UpdateTime")
    List<TempMonitor> selectRawEnergyData(@Param("startTime") Date startTime,
                                           @Param("endTime") Date endTime);

    /**
     * 查询车间层级关系
     * 
     * @return 车间层级关系列表
     */
    @Select("SELECT " +
            "FirstLevelDepartment as dept1, " +
            "SecondLevelDepartment as dept2, " +
            "Workshop " +
            "FROM tbl_workshop_hierarchy " +
            "ORDER BY FirstLevelDepartment, SecondLevelDepartment, Workshop")
    List<Map<String, Object>> getWorkshopHierarchy();

    /**
     * 查询指定车间的电能表设备名称列表
     * 
     * @param workshop 车间名称
     * @return 电能表设备名称列表
     */
    @Select("SELECT Name FROM tbl_monitordevice " +
            "WHERE Workshop = #{workshop} AND IsElectricMeter = 1")
    List<String> getElectricMeterNames(@Param("workshop") String workshop);
}
