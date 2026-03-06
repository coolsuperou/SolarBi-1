import { createWorkshopApi } from './workshopFactory'

/**
 * 车间 API 映射表
 * 通过工厂函数统一创建，无需为每个车间单独建文件
 */
const workshopKeys = [
  'aircompressor114',
  'sintering-105',
  'cleaning-106',
  'injection-110',
  'granule102',
  'cold-press-103',
  'restoration-104',
  'beading-107',
  'rubber-109',
  'edging-111',
  'final-inspection-112',
  'warehouse113',
  'public114',
  'conferenceroom114',
  'elevator114',
  'laboratory114',
  'officearea114',
  'office-building',
  'canteen',
  'dormitory',
  'chargingpile',
  'guardroom',
  'air-conditioning',
  'feeding-workshop',
  'granulation-workshop',
  'injection-workshop',
  'pressless-sintering',
  'toolrdcenter'
]

export const workshopApiMap = Object.fromEntries(
  workshopKeys.map(key => [key, createWorkshopApi(key)])
)

export function getWorkshopApi(apiBase) {
  return workshopApiMap[apiBase] || null
}
