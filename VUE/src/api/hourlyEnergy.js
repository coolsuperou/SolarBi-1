import request from './request'

export function getHourlyStatistics(year, month, day) {
  return request.get('/hourly/statistics', { params: { year, month, day } })
}
