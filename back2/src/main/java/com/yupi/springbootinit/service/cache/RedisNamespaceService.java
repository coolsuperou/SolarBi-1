package com.yupi.springbootinit.service.cache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 管理 Redis 命名空间指针与键拼接，支持原子切换活动命名空间。
 */
@Service
public class RedisNamespaceService {

    private static final String ACTIVE_NS_KEY = "tempMonitor:activeNs";

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public String getActiveNamespace() {
        String ns = stringRedisTemplate.opsForValue().get(ACTIVE_NS_KEY);
        if (!StringUtils.hasText(ns)) {
            // 默认命名空间
            ns = "v0";
            stringRedisTemplate.opsForValue().set(ACTIVE_NS_KEY, ns);
        }
        return ns;
    }

    public void switchActiveNamespace(String newNamespace) {
        if (!StringUtils.hasText(newNamespace)) {
            throw new IllegalArgumentException("newNamespace must not be empty");
        }
        stringRedisTemplate.opsForValue().set(ACTIVE_NS_KEY, newNamespace);
    }

    public String buildKey(String namespace, String suffix) {
        return namespace + ":" + suffix;
    }

    public String buildActiveKey(String suffix) {
        return buildKey(getActiveNamespace(), suffix);
    }
}



