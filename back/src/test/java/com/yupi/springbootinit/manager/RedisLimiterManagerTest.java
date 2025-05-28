package com.yupi.springbootinit.manager;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest
class RedisLimiterManagerTest {



    @Resource

    private RedisLimiterManager redisLimiterManager;


    @Test
    void doRateLimit() throws  InterruptedException {
//模拟操作
        String userId = "123";
        //瞬间执行两次，每成功一次，就打印“成功”

        for(int i=0;i<2;i++){

            redisLimiterManager.doRateLimit(userId);
            System.out.println("成功");

        }
   //睡一秒
        Thread.sleep(1000);
    //瞬间执行五次，每成功一次，就打印‘成功’
        for(int i=0;i<5;i++){
            redisLimiterManager.doRateLimit(userId);
            System.out.println("成功");
        }

    }
}