package com.yupi.springbootinit.model.dto.chart;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 创建请求
 *
 *@author <a href="https://github.com/coolsuperou">每天十点睡</a>
 *  
 */
@Data
public class ChartAddRequest implements Serializable {

    /**
     * 分析目标
     */
    private String goal;
/**
 * 图表名称
 */

private String name;
    /**
     * 图表数据
     */
    private String chartData;

    /**
     * 图表类型
     */
    private String chartType;

  private static  final long serialVersionUID = 1L;
}