import { request } from '@umijs/max';

/** 获取月度能耗统计 */
export async function getMonthlyEnergy(params: {
  year: number;
  month: number;
}) {
  return request<API.BaseResponse<any>>('/api/monthly/statistics', {
    method: 'GET',
    params,
  });
}


