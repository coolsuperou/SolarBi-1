import { ref, reactive, onMounted, computed, watch } from 'vue';
import moment from 'moment';
import StatisticsCard from '@/components/StatisticsCard.vue';
import PowerChart from '@/components/PowerChart.vue';
import DataTable from '@/components/DataTable.vue';
import { powerApi } from '@/api/power';
// 响应式数据
const statistics = reactive({
    workshop: '114_空调水机主机',
    electricConsumption: 0,
    totalElectricConsumption: 0
});
const searchForm = reactive({
    startTime: '',
    endTime: ''
});
// 分离的日期和时间字段（用于小时模式）
const startDate = ref('');
const startHour = ref('');
const endDate = ref('');
const endHour = ref('');
const currentMode = ref('hour');
const showChart = ref(true);
const chartCollapsed = ref(false);
const searchLoading = ref(false);
const chartLoading = ref(false);
const tableLoading = ref(false);
const chartOptions = ref({});
const tableData = ref([]);
const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0
});
// 表格列配置
const tableColumns = computed(() => [
    { key: 'deviceId', title: '设备ID', width: '150px' },
    { key: 'workshop', title: '部门车间', width: '200px' },
    { key: 'name', title: '名称', width: '150px' },
    { key: 'electricEnergy', title: '电能度数', width: '150px', format: 'number' },
    { key: 'updateTime', title: '时间', width: '180px', format: 'datetime' }
]);
// 格式化日期时间
const formatDateTime = (value) => {
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
};
// 固定车间名（与后端一致）
const FIXED_WORKSHOP = '114_空调水机主机';
// 统一转换为后端需要的时间格式 (yyyy-MM-dd HH:mm:ss)
const getRequestTimes = () => {
    if (!searchForm.startTime || !searchForm.endTime) {
        return { start: undefined, end: undefined };
    }
    if (currentMode.value === 'hour') {
        return {
            start: moment(searchForm.startTime).format('YYYY-MM-DD HH:mm:ss'),
            end: moment(searchForm.endTime).format('YYYY-MM-DD HH:mm:ss')
        };
    }
    return {
        start: moment(searchForm.startTime).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end: moment(searchForm.endTime).endOf('day').format('YYYY-MM-DD HH:mm:ss')
    };
};
// 搜索处理
const handleSearch = async () => {
    searchLoading.value = true;
    try {
        await Promise.all([
            loadStatistics(),
            loadChartData(),
            loadTableData()
        ]);
    }
    finally {
        searchLoading.value = false;
    }
};
// 重置搜索
const resetSearch = () => {
    setDefaultTimeRange();
    handleSearch();
};
// 模式切换
const handleModeChange = (mode) => {
    currentMode.value = mode;
    setDefaultTimeRange();
    loadChartData();
};
// 页码切换
const handlePageChange = (page) => {
    pagination.current = page;
    loadTableData();
};
// 加载统计数据
const loadStatistics = async () => {
    try {
        const { start, end } = getRequestTimes();
        if (currentMode.value === 'hour') {
            const resp = await powerApi.getHourlyEnergyConsumption({
                workshop: FIXED_WORKSHOP,
                startTime: start,
                endTime: end
            });
            const list = resp.data || [];
            const total = list.reduce((sum, item) => sum + Number(item.energyConsumption || 0), 0);
            const first = list[0];
            const last = list[list.length - 1];
            const totalByRange = first && last ? Number(last.endEnergy || 0) - Number(first.startEnergy || 0) : 0;
            statistics.workshop = FIXED_WORKSHOP;
            statistics.electricConsumption = Number(total.toFixed(2));
            statistics.totalElectricConsumption = Number((totalByRange >= 0 ? totalByRange : 0).toFixed(2));
            return;
        }
        const resp = await powerApi.getDailyEnergyConsumptionQuery({
            workshop: FIXED_WORKSHOP,
            startTime: start,
            endTime: end
        });
        const list = resp.data || [];
        const total = list.reduce((sum, item) => sum + Number(item.energyConsumption || 0), 0);
        const first = list[0];
        const last = list[list.length - 1];
        const totalByRange = first && last ? Number(last.endEnergy || 0) - Number(first.startEnergy || 0) : 0;
        statistics.workshop = FIXED_WORKSHOP;
        statistics.electricConsumption = Number(total.toFixed(2));
        statistics.totalElectricConsumption = Number((totalByRange >= 0 ? totalByRange : 0).toFixed(2));
    }
    catch (error) {
        console.error('加载统计数据失败:', error);
    }
};
// 加载图表数据
const loadChartData = async () => {
    chartLoading.value = true;
    try {
        const { start, end } = getRequestTimes();
        let seriesData = [];
        if (currentMode.value === 'hour') {
            const resp = await powerApi.getHourlyEnergyConsumption({
                workshop: FIXED_WORKSHOP,
                startTime: start,
                endTime: end
            });
            const list = resp.data || [];
            seriesData = list.map(item => [moment(item.hour).valueOf(), Number(item.energyConsumption || 0)]);
        }
        else {
            const resp = await powerApi.getDailyEnergyConsumptionQuery({
                workshop: FIXED_WORKSHOP,
                startTime: start,
                endTime: end
            });
            const list = resp.data || [];
            seriesData = list.map(item => [moment(item.day).valueOf(), Number(item.energyConsumption || 0)]);
        }
        chartOptions.value = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(10, 25, 41, 0.95)',
                borderColor: '#00d4ff',
                borderWidth: 2,
                textStyle: {
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 'bold'
                }
            },
            legend: {
                data: ['114_空调水机主机'],
                textStyle: {
                    color: '#00d4ff',
                    fontSize: 12,
                    fontWeight: 'bold'
                }
            },
            grid: {
                left: 60,
                right: 20,
                top: 50,
                bottom: 60,
                borderColor: 'rgba(0, 212, 255, 0.2)',
                show: true,
                backgroundColor: 'rgba(0, 212, 255, 0.03)'
            },
            xAxis: {
                type: 'time',
                axisLabel: {
                    color: '#00d4ff',
                    fontSize: 11,
                    fontWeight: 'bold',
                    formatter: (value) => {
                        return currentMode.value === 'hour'
                            ? moment(value).format('HH:mm')
                            : moment(value).format('MM-DD');
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#00d4ff',
                        width: 2
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.15)',
                        type: 'dashed'
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: currentMode.value === 'hour' ? '每小时用电量 (kWh)' : '每日用电量 (kWh)',
                nameTextStyle: {
                    color: '#00d4ff',
                    fontSize: 12,
                    fontWeight: 'bold'
                },
                axisLabel: {
                    color: '#00d4ff',
                    fontSize: 11,
                    fontWeight: 'bold'
                },
                axisLine: {
                    lineStyle: {
                        color: '#00d4ff',
                        width: 2
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(0, 212, 255, 0.15)',
                        type: 'dashed'
                    }
                }
            },
            series: [{
                    name: '114_空调水机主机',
                    type: 'line',
                    smooth: true,
                    data: seriesData,
                    lineStyle: {
                        width: 3,
                        color: '#00d4ff'
                    },
                    itemStyle: {
                        color: '#00d4ff',
                        borderColor: '#ffffff',
                        borderWidth: 2
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
                                { offset: 1, color: 'rgba(0, 212, 255, 0.1)' }
                            ]
                        }
                    }
                }]
        };
    }
    catch (error) {
        console.error('加载图表数据失败:', error);
    }
    finally {
        chartLoading.value = false;
    }
};
// 加载表格数据（使用后端分页结构）
const loadTableData = async () => {
    tableLoading.value = true;
    try {
        const { start, end } = getRequestTimes();
        const request = {
            current: pagination.current,
            pageSize: pagination.pageSize,
            workshop: FIXED_WORKSHOP,
            startTime: start,
            endTime: end
        };
        const resp = await powerApi.queryByCondition(request);
        const pageData = resp.data;
        tableData.value = pageData.records || [];
        pagination.total = pageData.total || 0;
    }
    catch (error) {
        console.error('加载表格数据失败:', error);
    }
    finally {
        tableLoading.value = false;
    }
};
// 设置默认时间范围
const setDefaultTimeRange = () => {
    const now = moment();
    if (currentMode.value === 'hour') {
        // 小时模式：设置分离的日期和时间字段
        const startMoment = now.clone().subtract(24, 'hours');
        const endMoment = now.clone();
        startDate.value = startMoment.format('YYYY-MM-DD');
        startHour.value = startMoment.format('HH:00');
        endDate.value = endMoment.format('YYYY-MM-DD');
        endHour.value = endMoment.format('HH:00');
        // 同时更新searchForm
        searchForm.startTime = startMoment.format('YYYY-MM-DDTHH:00');
        searchForm.endTime = endMoment.format('YYYY-MM-DDTHH:00');
    }
    else {
        // 日模式：只选择日期
        searchForm.endTime = now.format('YYYY-MM-DD');
        searchForm.startTime = now.clone().subtract(7, 'days').format('YYYY-MM-DD');
    }
};
// 监听分离的日期和时间字段变化，同步到searchForm
watch([startDate, startHour], () => {
    if (currentMode.value === 'hour' && startDate.value && startHour.value) {
        searchForm.startTime = `${startDate.value}T${startHour.value}`;
    }
});
watch([endDate, endHour], () => {
    if (currentMode.value === 'hour' && endDate.value && endHour.value) {
        searchForm.endTime = `${endDate.value}T${endHour.value}`;
    }
});
// 组件挂载时初始化
onMounted(() => {
    // 设置默认时间范围
    setDefaultTimeRange();
    // 加载初始数据
    handleSearch();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "power-monitor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header mb-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title text-glow-primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-description text-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "statistics-section mb-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row g-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-12 col-md-4" },
});
/** @type {[typeof StatisticsCard, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(StatisticsCard, new StatisticsCard({
    icon: "building",
    value: (__VLS_ctx.statistics.workshop),
    label: "车间",
    unit: "",
    precision: (0),
    valueClass: "text-glow-secondary",
}));
const __VLS_1 = __VLS_0({
    icon: "building",
    value: (__VLS_ctx.statistics.workshop),
    label: "车间",
    unit: "",
    precision: (0),
    valueClass: "text-glow-secondary",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-6 col-md-4" },
});
/** @type {[typeof StatisticsCard, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(StatisticsCard, new StatisticsCard({
    icon: "lightning-charge",
    value: (__VLS_ctx.statistics.electricConsumption),
    label: "电能消耗",
    unit: " kWh",
    precision: (2),
    valueClass: "text-glow-primary",
}));
const __VLS_4 = __VLS_3({
    icon: "lightning-charge",
    value: (__VLS_ctx.statistics.electricConsumption),
    label: "电能消耗",
    unit: " kWh",
    precision: (2),
    valueClass: "text-glow-primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-6 col-md-4" },
});
/** @type {[typeof StatisticsCard, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(StatisticsCard, new StatisticsCard({
    icon: "lightning-charge-fill",
    value: (__VLS_ctx.statistics.totalElectricConsumption),
    label: "总电能消耗",
    unit: " kWh",
    precision: (2),
    valueClass: "text-danger",
}));
const __VLS_7 = __VLS_6({
    icon: "lightning-charge-fill",
    value: (__VLS_ctx.statistics.totalElectricConsumption),
    label: "总电能消耗",
    unit: " kWh",
    precision: (2),
    valueClass: "text-danger",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-section mb-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tech-card p-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-header d-flex justify-content-between align-items-center mb-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({
    ...{ class: "search-title text-glow-primary mb-0" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi bi-eye me-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.chartCollapsed = !__VLS_ctx.chartCollapsed;
        } },
    type: "button",
    ...{ class: "btn btn-collapse" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi" },
    ...{ class: (__VLS_ctx.chartCollapsed ? 'bi-chevron-down' : 'bi-chevron-up') },
});
(__VLS_ctx.chartCollapsed ? '展开' : '折叠');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.handleSearch) },
    ...{ class: "row g-3 align-items-end" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-md-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "form-label text-glow-primary fw-semibold" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi bi-calendar me-1" },
});
(__VLS_ctx.currentMode === 'hour' ? '时间' : '日期');
if (__VLS_ctx.currentMode === 'hour') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row g-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "col-7" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "date",
        ...{ class: "form-control form-control-glow" },
        placeholder: "选择日期",
    });
    (__VLS_ctx.startDate);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "col-5" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.startHour),
        ...{ class: "form-select form-control-glow" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
        disabled: true,
    });
    for (const [hour] of __VLS_getVForSourceType((24))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (hour - 1),
            value: (String(hour - 1).padStart(2, '0') + ':00'),
        });
        (hour - 1);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "date",
        ...{ class: "form-control form-control-glow" },
    });
    (__VLS_ctx.searchForm.startTime);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-md-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "form-label text-glow-primary fw-semibold" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi bi-calendar me-1" },
});
(__VLS_ctx.currentMode === 'hour' ? '时间' : '日期');
if (__VLS_ctx.currentMode === 'hour') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row g-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "col-7" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "date",
        ...{ class: "form-control form-control-glow" },
        placeholder: "选择日期",
    });
    (__VLS_ctx.endDate);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "col-5" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.endHour),
        ...{ class: "form-select form-control-glow" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
        disabled: true,
    });
    for (const [hour] of __VLS_getVForSourceType((24))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (hour - 1),
            value: (String(hour - 1).padStart(2, '0') + ':00'),
        });
        (hour - 1);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "date",
        ...{ class: "form-control form-control-glow" },
    });
    (__VLS_ctx.searchForm.endTime);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-md-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex gap-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    ...{ class: "btn btn-search flex-fill" },
    disabled: (__VLS_ctx.searchLoading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi bi-search me-1" },
    ...{ class: ({ 'spinning': __VLS_ctx.searchLoading }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetSearch) },
    type: "button",
    ...{ class: "btn btn-reset" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi bi-arrow-clockwise me-1" },
});
if (__VLS_ctx.showChart && !__VLS_ctx.chartCollapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-section mb-4" },
    });
    /** @type {[typeof PowerChart, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(PowerChart, new PowerChart({
        ...{ 'onModeChange': {} },
        title: (__VLS_ctx.currentMode === 'hour' ? '每小时电能消耗趋势' : '每日电能消耗趋势'),
        chartOptions: (__VLS_ctx.chartOptions),
        loading: (__VLS_ctx.chartLoading),
        currentMode: (__VLS_ctx.currentMode),
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onModeChange': {} },
        title: (__VLS_ctx.currentMode === 'hour' ? '每小时电能消耗趋势' : '每日电能消耗趋势'),
        chartOptions: (__VLS_ctx.chartOptions),
        loading: (__VLS_ctx.chartLoading),
        currentMode: (__VLS_ctx.currentMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onModeChange: (__VLS_ctx.handleModeChange)
    };
    var __VLS_11;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-section" },
});
/** @type {[typeof DataTable, typeof DataTable, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(DataTable, new DataTable({
    ...{ 'onPageChange': {} },
    title: "电能监控数据",
    columns: (__VLS_ctx.tableColumns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.tableLoading),
    pagination: (__VLS_ctx.pagination),
    showRefresh: (false),
}));
const __VLS_17 = __VLS_16({
    ...{ 'onPageChange': {} },
    title: "电能监控数据",
    columns: (__VLS_ctx.tableColumns),
    data: (__VLS_ctx.tableData),
    loading: (__VLS_ctx.tableLoading),
    pagination: (__VLS_ctx.pagination),
    showRefresh: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_19;
let __VLS_20;
let __VLS_21;
const __VLS_22 = {
    onPageChange: (__VLS_ctx.handlePageChange)
};
__VLS_18.slots.default;
{
    const { deviceId: __VLS_thisSlot } = __VLS_18.slots;
    const [{ value }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-glow-primary fw-bold" },
    });
    (value);
}
{
    const { workshop: __VLS_thisSlot } = __VLS_18.slots;
    const [{ value }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "badge bg-primary" },
    });
    (value);
}
{
    const { name: __VLS_thisSlot } = __VLS_18.slots;
    const [{ value }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-info fw-semibold" },
    });
    (value || '-');
}
{
    const { electricEnergy: __VLS_thisSlot } = __VLS_18.slots;
    const [{ value }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-glow-warning fw-bold" },
    });
    (Number(value).toFixed(2));
}
{
    const { updateTime: __VLS_thisSlot } = __VLS_18.slots;
    const [{ value }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-glow-secondary" },
    });
    (__VLS_ctx.formatDateTime(value));
}
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['power-monitor']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['page-description']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['statistics-section']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-3']} */ ;
/** @type {__VLS_StyleScopedClasses['col-12']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-4']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-4']} */ ;
/** @type {__VLS_StyleScopedClasses['col-6']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-4']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tech-card']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['search-header']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-content-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['search-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-eye']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-collapse']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-3']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-end']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-4']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['fw-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-calendar']} */ ;
/** @type {__VLS_StyleScopedClasses['me-1']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-2']} */ ;
/** @type {__VLS_StyleScopedClasses['col-7']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['col-5']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-4']} */ ;
/** @type {__VLS_StyleScopedClasses['form-label']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['fw-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-calendar']} */ ;
/** @type {__VLS_StyleScopedClasses['me-1']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['g-2']} */ ;
/** @type {__VLS_StyleScopedClasses['col-7']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['col-5']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control']} */ ;
/** @type {__VLS_StyleScopedClasses['form-control-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['col-md-4']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-search']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-search']} */ ;
/** @type {__VLS_StyleScopedClasses['me-1']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-reset']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-arrow-clockwise']} */ ;
/** @type {__VLS_StyleScopedClasses['me-1']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-section']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['fw-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['badge']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-info']} */ ;
/** @type {__VLS_StyleScopedClasses['fw-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-warning']} */ ;
/** @type {__VLS_StyleScopedClasses['fw-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-secondary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            StatisticsCard: StatisticsCard,
            PowerChart: PowerChart,
            DataTable: DataTable,
            statistics: statistics,
            searchForm: searchForm,
            startDate: startDate,
            startHour: startHour,
            endDate: endDate,
            endHour: endHour,
            currentMode: currentMode,
            showChart: showChart,
            chartCollapsed: chartCollapsed,
            searchLoading: searchLoading,
            chartLoading: chartLoading,
            tableLoading: tableLoading,
            chartOptions: chartOptions,
            tableData: tableData,
            pagination: pagination,
            tableColumns: tableColumns,
            formatDateTime: formatDateTime,
            handleSearch: handleSearch,
            resetSearch: resetSearch,
            handleModeChange: handleModeChange,
            handlePageChange: handlePageChange,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
