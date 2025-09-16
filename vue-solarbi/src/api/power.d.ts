export interface BaseResponse<T = any> {
    code: number;
    data: T;
    message: string;
}
export interface TempMonitor {
    id: number;
    deviceId: string;
    name: string;
    tem: number;
    hum: number;
    mac: string;
    updateTime: string;
    electricEnergy: number;
    nodeId: number;
    workshop: string;
}
export interface TempMonitorQueryRequest {
    current: number;
    pageSize: number;
    startTime?: string;
    endTime?: string;
    workshop?: string;
    deviceId?: string;
    name?: string;
    sortField?: string;
    sortOrder?: string;
}
export interface PageResponse<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
    countId?: string;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    searchCount?: boolean;
    orders?: Array<{
        column: string;
        asc: boolean;
    }>;
}
export interface HourlyEnergyConsumption {
    deviceId: string;
    hour: string;
    startTime: string;
    endTime: string;
    startEnergy: number;
    endEnergy: number;
    energyConsumption: number;
    name: string;
    workshop: string;
}
export interface DailyEnergyConsumption {
    deviceId: string;
    day: string;
    startTime: string;
    endTime: string;
    startEnergy: number;
    endEnergy: number;
    energyConsumption: number;
    name: string;
    workshop: string;
}
export interface TempMonitorStatistics {
    avgTemperature: number;
    minTemperature: number;
    maxTemperature: number;
    avgHumidity: number;
    minHumidity: number;
    maxHumidity: number;
    totalElectricEnergy: number;
    avgElectricEnergy: number;
    minElectricEnergy: number;
    maxElectricEnergy: number;
    deviceCount: number;
}
export declare const powerApi: {
    getLatestData(): Promise<BaseResponse<TempMonitor[]>>;
    getDataByWorkshop(workshop: string): Promise<BaseResponse<TempMonitor[]>>;
    getAllWorkshops(): Promise<BaseResponse<string[]>>;
    getDataByDeviceId(deviceId: string): Promise<BaseResponse<TempMonitor[]>>;
    queryByCondition(request: TempMonitorQueryRequest): Promise<BaseResponse<PageResponse<TempMonitor>>>;
    getElectricEnergyTrend(params: {
        workshop?: string;
        deviceId?: string;
        startTime?: string;
        endTime?: string;
        limit?: number;
    }): Promise<BaseResponse<TempMonitor[]>>;
    getHourlyEnergyConsumption(params: {
        workshop?: string;
        deviceId?: string;
        startTime?: string;
        endTime?: string;
    }): Promise<BaseResponse<HourlyEnergyConsumption[]>>;
    getHourlyEnergyConsumptionQuery(params: {
        workshop?: string;
        deviceId?: string;
        startTime?: string;
        endTime?: string;
    }): Promise<BaseResponse<HourlyEnergyConsumption[]>>;
    getDailyEnergyConsumptionQuery(params: {
        workshop?: string;
        deviceId?: string;
        startTime?: string;
        endTime?: string;
    }): Promise<BaseResponse<DailyEnergyConsumption[]>>;
    refreshCache(workshop?: string): Promise<BaseResponse<boolean>>;
};
