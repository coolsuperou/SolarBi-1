import { request } from '@umijs/max';

/** 获取日能耗统计（24小时） */
export async function getHourlyEnergy(params: {
  year: number;
  month: number;
  day: number;
}) {
  return request<API.BaseResponse<any>>('/api/hourly/statistics', {
    method: 'GET',
    params,
  });
}
