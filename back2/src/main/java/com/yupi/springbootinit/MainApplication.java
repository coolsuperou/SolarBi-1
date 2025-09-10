package com.yupi.springbootinit;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cache.annotation.EnableCaching;

/**
 * 主类（项目启动入口）
 *
 *@author <a href="https://github.com/coolsuperou">每天十点睡</a>
 *  
 */
// 启用Redis缓存支持，排除默认数据源配置，使用自定义多数据源配置
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
@MapperScan("com.yupi.springbootinit.mapper") // 确保Mapper能被正确扫描
@EnableScheduling
@EnableCaching
@EnableAspectJAutoProxy(proxyTargetClass = true, exposeProxy = true)
public class MainApplication {

    public static void main(String[] args) {
        SpringApplication.run(MainApplication.class, args);
    }

}
