import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
const props = withDefaults(defineProps(), {
    title: '电能趋势图',
    loading: false,
    currentMode: 'hour',
    chartHeight: '400px'
});
const emit = defineEmits();
const chartRef = ref();
let chartInstance = null;
const modes = [
    { value: 'hour', label: '小时' },
    { value: 'day', label: '日' }
];
// 初始化图表
const initChart = () => {
    if (!chartRef.value)
        return;
    chartInstance = echarts.init(chartRef.value);
    // 默认配置
    const defaultOptions = {
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
        yAxis: {
            type: 'value',
            name: '电能消耗 (kWh)',
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
        series: []
    };
    chartInstance.setOption(defaultOptions);
};
// 更新图表
const updateChart = () => {
    if (!chartInstance || !props.chartOptions)
        return;
    chartInstance.setOption(props.chartOptions, true);
};
// 响应式处理
const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize();
    }
};
// 监听配置变化
watch(() => props.chartOptions, () => {
    updateChart();
}, { deep: true });
// 监听加载状态
// 使用自定义覆盖层显示加载状态，避免与 ECharts 内置 loading 重叠
watch(() => props.loading, () => {
    // intentionally no-op
});
onMounted(async () => {
    await nextTick();
    initChart();
    updateChart();
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    window.removeEventListener('resize', handleResize);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    title: '电能趋势图',
    loading: false,
    currentMode: 'hour',
    chartHeight: '400px'
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-container tech-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-header d-flex justify-content-between align-items-center mb-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "chart-title text-glow-primary mb-0" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi bi-graph-up me-2" },
});
(__VLS_ctx.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "btn-group" },
    role: "group",
});
for (const [mode] of __VLS_getVForSourceType((__VLS_ctx.modes))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('modeChange', mode.value);
            } },
        key: (mode.value),
        type: "button",
        ...{ class: "btn btn-sm" },
        ...{ class: (__VLS_ctx.currentMode === mode.value ? 'btn-glow' : 'btn-outline-primary') },
    });
    (mode.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "chartRef",
    ...{ class: "chart-content" },
    ...{ style: ({ height: __VLS_ctx.chartHeight }) },
});
/** @type {typeof __VLS_ctx.chartRef} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-loading" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spinner-border text-primary" },
        role: "status",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "visually-hidden" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "mt-2 text-secondary" },
    });
}
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tech-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-content-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-graph-up']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-group']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner-border']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['visually-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            chartRef: chartRef,
            modes: modes,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
