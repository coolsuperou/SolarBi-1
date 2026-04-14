import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.resolve(__dirname, '../src/styles/mobile')

const z = {
  title: '\u624b\u673a\u8f66\u95f4\u9884\u89c8',
  back: '\u8fd4\u56de',
  shell: '101\u914d\u6599',
  dataQuery: '\u6570\u636e\u67e5\u8be2',
  hour: '\u5c0f\u65f6\u6a21\u5f0f',
  day: '\u65e5\u6a21\u5f0f',
  start: '\u5f00\u59cb\u65f6\u95f4',
  end: '\u7ed3\u675f\u65f6\u95f4',
  query: '\u67e5\u8be2',
  chart: '\u7535\u80fd\u8d8b\u52bf',
  pts: '24 \u4e2a\u6570\u636e\u70b9',
  table: '\u6570\u636e\u5217\u8868',
  rec: '\u5171 3 \u6761\u8bb0\u5f55',
  c1: '\u5e8f\u53f7',
  c2: '\u8bbe\u5907ID',
  c3: '\u90e8\u95e8\u8f66\u95f4',
  c4: '\u540d\u79f0',
  c5: '\u7535\u80fd\u5ea6\u6570',
  c6: '\u65f6\u95f4',
  ws: '101\u914d\u6599',
  page: '\u7b2c 1 / 1 \u9875'
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${z.title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <link rel="stylesheet" href="./mobile-base.css" />
  <link rel="stylesheet" href="./mobile-shell.css" />
  <link rel="stylesheet" href="./mobile-embed.css" />
  <link rel="stylesheet" href="./workshop-mobile-design.css" />
  <style>
    body {
      background: #eef2f7 !important;
    }
    .m-sub-page {
      min-height: 100dvh;
      background: #eef2f7;
    }
  </style>
</head>
<body>
  <div class="m-sub-page">
    <header class="m-header">
      <button type="button" class="m-header__action" style="padding-left:0" aria-label="${z.back}" onclick="if (window.history.length > 1) window.history.back()">
        <i class="bi bi-chevron-left" style="font-size:20px"></i>
      </button>
      <h2 class="m-header__title m-header__title--center">${z.shell}</h2>
      <span class="m-header__spacer" aria-hidden="true"></span>
    </header>
    <main class="m-content m-desktop-embed">
      <div class="workshop-page workshop-page--mobile">
    <div class="search-card">
      <div class="search-header">
        <div class="search-title"><i class="bi bi-funnel-fill"></i> ${z.dataQuery}</div>
        <div class="mode-switch">
          <button type="button" class="mode-btn active"><i class="bi bi-clock-fill"></i> ${z.hour}</button>
          <button type="button" class="mode-btn"><i class="bi bi-calendar3-fill"></i> ${z.day}</button>
        </div>
      </div>
      <div class="search-form-row">
        <span class="form-label-sm">${z.start}</span>
        <div class="time-combo">
          <input type="date" value="2026-04-13" />
          <span class="combo-sep"></span>
          <select><option>10:00</option></select>
        </div>
        <span class="form-label-sm">${z.end}</span>
        <div class="time-combo">
          <input type="date" value="2026-04-14" />
          <span class="combo-sep"></span>
          <select><option>10:00</option></select>
        </div>
        <button type="button" class="btn-search"><i class="bi bi-search"></i> ${z.query}</button>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-card-title">
          <i class="bi bi-graph-up-arrow"></i> ${z.chart}
          <span class="chart-badge"><i class="bi bi-dot"></i>${z.pts}</span>
        </div>
        <i class="bi bi-chevron-up collapse-icon"></i>
      </div>
      <div class="chart-area">
        <div id="workshop-preview-chart" class="workshop-preview-chart" aria-label="chart"></div>
      </div>
    </div>
    <div class="table-card">
      <div class="workshop-table-header">
        <span class="workshop-table-title"><i class="bi bi-table"></i> ${z.table}</span>
        <span class="table-count"><i class="bi bi-database"></i>${z.rec}</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:50px">${z.c1}</th>
            <th>${z.c2}</th>
            <th>${z.c3}</th>
            <th>${z.c4}</th>
            <th>${z.c5}</th>
            <th>${z.c6}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="td-index">1</td>
            <td class="td-device">30107338</td>
            <td><span class="td-workshop">${z.ws}</span></td>
            <td class="td-name"><i class="bi bi-cpu"></i>2AA5-1-3</td>
            <td class="td-energy">12.50</td>
            <td class="td-time">2026-04-13 10:00:00</td>
          </tr>
        </tbody>
      </table>
      <div class="table-pagination">
        <span class="page-info">${z.page}</span>
        <div class="page-btns">
          <button type="button" class="page-btn" disabled><i class="bi bi-chevron-double-left"></i></button>
          <button type="button" class="page-btn" disabled><i class="bi bi-chevron-left"></i></button>
          <button type="button" class="page-btn active">1</button>
          <button type="button" class="page-btn" disabled><i class="bi bi-chevron-right"></i></button>
          <button type="button" class="page-btn" disabled><i class="bi bi-chevron-double-right"></i></button>
        </div>
      </div>
    </div>
      </div>
    </main>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
  <script>
(function () {
  var seriesName = "\u7535\u80fd\u6d88\u8017 (kWh)";
  function initPreviewChart() {
    var el = document.getElementById('workshop-preview-chart')
    if (!el || typeof echarts === 'undefined') return
    var chart = echarts.init(el)
    var labels = []
    var data = []
    for (var i = 0; i < 24; i++) {
      labels.push('04-13 ' + (i < 10 ? '0' : '') + i + ':00')
      data.push(+(88 + Math.sin(i / 2.4) * 38 + (Math.random() - 0.5) * 14).toFixed(1))
    }
    chart.setOption({
      color: ['#3b82f6'],
      grid: { left: 44, right: 10, top: 40, bottom: 16 },
      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove|click',
        showDelay: 0,
        hideDelay: 400,
        confine: true
      },
      axisPointer: {
        type: 'line',
        snap: true,
        lineStyle: { color: 'rgba(59, 130, 246, 0.35)', width: 1, type: 'dashed' }
      },
      legend: { data: [seriesName], top: 2, right: 6, textStyle: { fontSize: 11, color: '#64748b' } },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'kWh',
        nameTextStyle: { color: '#94a3b8', fontSize: 11 },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [{
        name: seriesName,
        type: 'line',
        smooth: 0.35,
        symbol: 'circle',
        symbolSize: 7,
        data: data,
        lineStyle: { width: 2.5, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.22)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
          ])
        }
      }]
    })
    window.addEventListener('resize', function () { chart.resize() })
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreviewChart)
  } else {
    initPreviewChart()
  }
})();
  </script>
</body>
</html>
`

fs.writeFileSync(path.join(dir, 'workshop-mobile-design.html'), html, 'utf8')
console.log('Wrote workshop-mobile-design.html')
