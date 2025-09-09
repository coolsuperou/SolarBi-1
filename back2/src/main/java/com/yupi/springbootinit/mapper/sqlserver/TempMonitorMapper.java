package com.yupi.springbootinit.mapper.sqlserver;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.tempmonitor.HourlyEnergyConsumption;
import com.yupi.springbootinit.model.dto.tempmonitor.TempMonitorStatistics;
import com.yupi.springbootinit.model.entity.TempMonitor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Date;
import java.util.List;

/**
 * 温湿电能监控数据 Mapper
 * 使用 SQL Server 数据源
 * 参考 CSDN 博客标准实现：https://blog.csdn.net/weixin_44563573/article/details/115630791
 * 
 * @author yupi
 */
@Mapper
public interface TempMonitorMapper extends BaseMapper<TempMonitor> {

    /**
     * 查询最新数据（显示所有数据）
     */
    @Select("SELECT Id, DeviceID, Name, Tem, Hum, MAC, UpdateTime, ElectricEnergy, NodeID, Workshop " +
            "FROM RSWS_TempMonitor ORDER BY UpdateTime DESC")
    List<TempMonitor> selectLatestData();

    /**
     * 根据车间查询数据
     */
    @Select("SELECT Id, DeviceID, Name, Tem, Hum, MAC, UpdateTime, ElectricEnergy, NodeID, Workshop " +
            "FROM RSWS_TempMonitor WHERE Workshop = #{workshop} ORDER BY UpdateTime DESC")
    List<TempMonitor> selectByWorkshop(String workshop);

    /**
     * 查询所有车间
     */
    @Select("SELECT DISTINCT Workshop FROM RSWS_TempMonitor WHERE Workshop IS NOT NULL AND Workshop != ''")
    List<String> selectAllWorkshops();

    /**
     * 根据设备ID查询数据
     */
    @Select("SELECT Id, DeviceID, Name, Tem, Hum, MAC, UpdateTime, ElectricEnergy, NodeID, Workshop " +
            "FROM RSWS_TempMonitor WHERE DeviceID = #{deviceId} ORDER BY UpdateTime DESC")
    List<TempMonitor> selectByDeviceId(String deviceId);

    /**
     * 分页查询温湿电能数据（支持多条件查询）
     * 使用XML配置文件实现复杂查询
     */
    Page<TempMonitor> selectPageByCondition(Page<TempMonitor> page,
                                           @Param("deviceId") String deviceId,
                                           @Param("name") String name,
                                           @Param("workshop") String workshop,
                                           @Param("startTime") Date startTime,
                                           @Param("endTime") Date endTime,
                                           @Param("sortField") String sortField,
                                           @Param("sortOrder") String sortOrder);

    /**
     * 查询设备数量统计
     * 使用XML配置文件实现
     */
    Integer countDevices(@Param("workshop") String workshop,
                        @Param("startTime") Date startTime,
                        @Param("endTime") Date endTime);

    /**
     * 查询温度、湿度、电能统计信息
     * 使用XML配置文件实现
     */
    TempMonitorStatistics getStatistics(@Param("workshop") String workshop,
                                       @Param("startTime") Date startTime,
                                       @Param("endTime") Date endTime);

    /**
     * 查询电能趋势数据
     * 用于绘制电能变化曲线图
     */
    List<TempMonitor> selectElectricEnergyTrend(@Param("workshop") String workshop,
                                               @Param("deviceId") String deviceId,
                                               @Param("startTime") Date startTime,
                                               @Param("endTime") Date endTime,
                                               @Param("limit") Integer limit);

    /**
     * 查询每小时电能消耗数据（默认模式-实时更新）
     * 最新小时用最新记录减去开始时间记录
     */
    List<HourlyEnergyConsumption> selectHourlyEnergyConsumption(@Param("workshop") String workshop,
                                                               @Param("deviceId") String deviceId,
                                                               @Param("startTime") Date startTime,
                                                               @Param("endTime") Date endTime);

    /**
     * 查询每小时电能消耗数据（查询模式-历史数据）
     * 所有小时都用标准逻辑：结束时间以后最近记录 - 开始时间以后最近记录
     */
    List<HourlyEnergyConsumption> selectHourlyEnergyConsumptionQuery(@Param("workshop") String workshop,
                                                                   @Param("deviceId") String deviceId,
                                                                   @Param("startTime") Date startTime,
                                                                   @Param("endTime") Date endTime);
}
