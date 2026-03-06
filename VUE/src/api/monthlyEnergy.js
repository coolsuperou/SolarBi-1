import request from './request'

export function getMonthlyStatistics(year, month) {
  return request.get('/monthly/statistics', { params: { year, month } })
}
