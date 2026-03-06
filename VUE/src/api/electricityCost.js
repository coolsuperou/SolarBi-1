import request from './request'

export function getPowerSupplyData(year, month) {
  return request.get('/electricity-cost/power-supply-data/get', { params: { year, month } })
}

export function savePowerSupplyData(data) {
  return request.post('/electricity-cost/power-supply-data/save', data)
}

export function calculateMode1(year, month) {
  return request.get('/electricity-cost/calculate-mode1', { params: { year, month } })
}

export function calculateMode2(year, month) {
  return request.get('/electricity-cost/calculate-mode2', { params: { year, month } })
}

export function calculateMode3(year, month) {
  return request.get('/electricity-cost/calculate-mode3', { params: { year, month } })
}
