package com.yupi.springbootinit.service;

import java.util.List;
import java.util.Map;

public interface TrendCacheService {

    String WORKSHOP = "114_空调水机主机";

    String getHourSeriesJson();

    String getDaySeriesJson();

    Map<String, Object> getStats();

    void preheatAll();
}


