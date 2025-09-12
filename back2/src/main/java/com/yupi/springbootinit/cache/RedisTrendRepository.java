package com.yupi.springbootinit.cache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class RedisTrendRepository {

    private final StringRedisTemplate stringRedisTemplate;

    @Autowired
    public RedisTrendRepository(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public String getVersionKeyHour(String workshop) {
        return "tm:trend:ver:hour:" + workshop;
    }

    public String getVersionKeyDay(String workshop) {
        return "tm:trend:ver:day:" + workshop;
    }

    public String getDataKeyHour(String version, String workshop) {
        return "tm:trend:data:" + version + ":hour:" + workshop;
    }

    public String getDataKeyDay(String version, String workshop) {
        return "tm:trend:data:" + version + ":day:" + workshop;
    }

    public String getStatsKey(String version, String workshop) {
        return "tm:stats:" + version + ":" + workshop;
    }

    public String getLockKey(String workshop) {
        return "lock:tm:refresh:" + workshop;
    }

    public boolean tryLock(String lockKey, Duration ttl, String token) {
        Boolean ok = stringRedisTemplate.opsForValue().setIfAbsent(lockKey, token, ttl);
        return ok != null && ok;
    }

    public void unlock(String lockKey, String token) {
        try {
            String val = stringRedisTemplate.opsForValue().get(lockKey);
            if (token != null && token.equals(val)) {
                stringRedisTemplate.delete(lockKey);
            }
        } catch (Exception ignored) {
        }
    }

    public String get(String key) {
        return stringRedisTemplate.opsForValue().get(key);
    }

    public void set(String key, String value) {
        stringRedisTemplate.opsForValue().set(key, value);
    }

    public void setWithTtl(String key, String value, Duration ttl) {
        stringRedisTemplate.opsForValue().set(key, value, ttl);
    }

    public void rename(String oldKey, String newKey) {
        stringRedisTemplate.rename(oldKey, newKey);
    }

    public void delete(String key) {
        stringRedisTemplate.delete(key);
    }

    public void expire(String key, Duration ttl) {
        stringRedisTemplate.expire(key, ttl.getSeconds(), TimeUnit.SECONDS);
    }
}


