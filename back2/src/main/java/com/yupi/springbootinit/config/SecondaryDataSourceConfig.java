package com.yupi.springbootinit.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import com.zaxxer.hikari.HikariDataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

/**
 * SQL Server 辅助数据源配置
 * 参考 CSDN 博客标准实现：https://blog.csdn.net/weixin_44563573/article/details/115630791
 * 
 * @author yupi
 */
@Configuration
@MapperScan(
    basePackages = "com.yupi.springbootinit.mapper.sqlserver", 
    sqlSessionFactoryRef = "secondarySqlSessionFactory"
)
public class SecondaryDataSourceConfig {

    /**
     * SQL Server 辅助数据源
     */
    @Bean(name = "secondaryDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }

    /**
     * SQL Server SqlSessionFactory
     */
    @Bean(name = "secondarySqlSessionFactory")
    public SqlSessionFactory secondarySqlSessionFactory(@Qualifier("secondaryDataSource") DataSource dataSource) throws Exception {
        MybatisSqlSessionFactoryBean bean = new MybatisSqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        
        // 配置MyBatis-Plus分页插件
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.SQL_SERVER));
        bean.setPlugins(interceptor);
        
        // 配置MyBatis-Plus设置
        com.baomidou.mybatisplus.core.MybatisConfiguration configuration = new com.baomidou.mybatisplus.core.MybatisConfiguration();
        configuration.setMapUnderscoreToCamelCase(false); // SQL Server表列名使用标准命名，无需转换
        configuration.setLogImpl(org.apache.ibatis.logging.stdout.StdOutImpl.class); // 启用SQL日志
        bean.setConfiguration(configuration);
        
        // SQL Server mapper XML 文件配置
        bean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/sqlserver/*.xml"));
        return bean.getObject();
    }

    /**
     * SQL Server 事务管理器
     */
    @Bean(name = "secondaryTransactionManager")
    public PlatformTransactionManager secondaryTransactionManager(@Qualifier("secondaryDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    /**
     * SQL Server SqlSessionTemplate
     */
    @Bean(name = "secondarySqlSessionTemplate")
    public SqlSessionTemplate secondarySqlSessionTemplate(@Qualifier("secondarySqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
