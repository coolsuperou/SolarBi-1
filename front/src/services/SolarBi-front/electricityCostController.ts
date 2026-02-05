import { request } from '@umijs/max';

/** 获取供电局数据 */
export async function getPowerSupplyData(params: {
  year: number;
  month: number;
}) {
  return request<API.BaseResponse<any>>('/api/electricity-cost/power-supply-data/get', {
    method: 'GET',
    params,
  });
}

/** 保存/更新供电局数据 */
export async function savePowerSupplyData(data: {
  year: number;
  month: number;
  reading1To24?: number;
  amount1To24?: number;
  reading25ToEnd?: number;
  amount25ToEnd?: number;
}) {
  return request<API.BaseResponse<boolean>>('/api/electricity-cost/power-supply-data/save', {
    method: 'POST',
    data,
  });
}

/** 模式一：仅1-24日数据计算 */
export async function calculateMode1(params: {
  year: number;
  month: number;
}) {
  return request<API.BaseResponse<any>>('/api/electricity-cost/calculate-mode1', {
    method: 'GET',
    params,
  });
}

/** 模式二：仅25-月末数据计算 */
export async function calculateMode2(params: {
  year: number;
  month: number;
}) {
  return request<API.BaseResponse<any>>('/api/electricity-cost/calculate-mode2', {
    method: 'GET',
    params,
  });
}

/** 模式三：两期数据都有计算 */
export async function calculateMode3(params: {
  year: number;
  month: number;
}) {
  return request<API.BaseResponse<any>>('/api/electricity-cost/calculate-mode3', {
    method: 'GET',
    params,
  });
}
