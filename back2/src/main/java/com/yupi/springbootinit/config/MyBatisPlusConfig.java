package com.yupi.springbootinit.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis Plus 配置
 * 注意：多数据源配置时，所有配置都移到了 PrimaryDataSourceConfig 中
 *
 * @author https://github.com/liyupi
 */
// @Configuration // 多数据源模式下禁用，配置已移至 PrimaryDataSourceConfig
// @MapperScan("com.yupi.springbootinit.mapper") // 已由 PrimaryDataSourceConfig 处理
public class MyBatisPlusConfig {

    /**
     * 拦截器配置 - 已移至 PrimaryDataSourceConfig
     *
     * @return
     */
    // @Bean // 已在 PrimaryDataSourceConfig 中配置
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}