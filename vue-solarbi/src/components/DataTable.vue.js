import { computed } from 'vue';
import moment from 'moment';
const props = withDefaults(defineProps(), {
    title: '数据表格',
    loading: false,
    showRefresh: true
});
const emit = defineEmits();
// 计算总页数
const totalPages = computed(() => {
    if (!props.pagination)
        return 1;
    return Math.ceil(props.pagination.total / props.pagination.pageSize);
});
// 计算可见页码
const visiblePages = computed(() => {
    if (!props.pagination)
        return [];
    const current = props.pagination.current;
    const total = totalPages.value;
    const pages = [];
    // 显示逻辑：当前页前后各显示2页
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});
// 获取嵌套对象的值
const getNestedValue = (obj, key) => {
    return key.split('.').reduce((o, k) => o?.[k], obj);
};
// 格式化值
const formatValue = (value, column) => {
    if (value === null || value === undefined)
        return '-';
    switch (column.format) {
        case 'number':
            return typeof value === 'number' ? value.toFixed(column.precision || 2) : value;
        case 'date':
            return moment(value).format('YYYY-MM-DD');
        case 'datetime':
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
        default:
            return value;
    }
};
// 刷新数据
const refresh = () => {
    emit('refresh');
};
// 切换页码
const changePage = (page) => {
    if (page < 1 || page > totalPages.value)
        return;
    emit('pageChange', page);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    title: '数据表格',
    loading: false,
    showRefresh: true
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-container tech-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-header d-flex justify-content-between align-items-center mb-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
    ...{ class: "table-title text-glow-primary mb-0" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "bi bi-table me-2" },
});
(__VLS_ctx.title);
if (__VLS_ctx.showRefresh) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.refresh) },
        ...{ class: "btn btn-sm btn-glow" },
        disabled: (__VLS_ctx.loading),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "bi bi-arrow-clockwise me-1" },
        ...{ class: ({ 'spinning': __VLS_ctx.loading }) },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-responsive" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
    ...{ class: "table table-tech table-hover" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
for (const [column] of __VLS_getVForSourceType((__VLS_ctx.columns))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        key: (column.key),
        ...{ style: ({ width: column.width }) },
    });
    (column.title);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
        key: (item.id || index),
    });
    for (const [column] of __VLS_getVForSourceType((__VLS_ctx.columns))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            key: (column.key),
        });
        var __VLS_0 = {
            item: (item),
            value: (__VLS_ctx.getNestedValue(item, column.key)),
            index: (index),
        };
        var __VLS_1 = __VLS_tryAsConstant(column.key);
        (__VLS_ctx.formatValue(__VLS_ctx.getNestedValue(item, column.key), column));
    }
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-loading text-center py-4" },
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
else if (!__VLS_ctx.data || __VLS_ctx.data.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-empty text-center py-5" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "bi bi-inbox display-1 text-secondary mb-3" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-secondary" },
    });
}
if (__VLS_ctx.pagination && !__VLS_ctx.loading && __VLS_ctx.data.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-pagination" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
        'aria-label': "表格分页",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "pagination justify-content-center mb-0" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        ...{ class: "page-item" },
        ...{ class: ({ disabled: __VLS_ctx.pagination.current <= 1 }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.pagination && !__VLS_ctx.loading && __VLS_ctx.data.length > 0))
                    return;
                __VLS_ctx.changePage(__VLS_ctx.pagination.current - 1);
            } },
        ...{ class: "page-link" },
        disabled: (__VLS_ctx.pagination.current <= 1),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "bi bi-chevron-left" },
    });
    for (const [page] of __VLS_getVForSourceType((__VLS_ctx.visiblePages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (page),
            ...{ class: "page-item" },
            ...{ class: ({ active: page === __VLS_ctx.pagination.current }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.pagination && !__VLS_ctx.loading && __VLS_ctx.data.length > 0))
                        return;
                    __VLS_ctx.changePage(page);
                } },
            ...{ class: "page-link" },
        });
        (page);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        ...{ class: "page-item" },
        ...{ class: ({ disabled: __VLS_ctx.pagination.current >= __VLS_ctx.totalPages }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.pagination && !__VLS_ctx.loading && __VLS_ctx.data.length > 0))
                    return;
                __VLS_ctx.changePage(__VLS_ctx.pagination.current + 1);
            } },
        ...{ class: "page-link" },
        disabled: (__VLS_ctx.pagination.current >= __VLS_ctx.totalPages),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: "bi bi-chevron-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-info text-center mt-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({
        ...{ class: "text-secondary" },
    });
    (__VLS_ctx.pagination.current);
    (__VLS_ctx.totalPages);
    (__VLS_ctx.pagination.total);
}
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tech-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-header']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-content-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['table-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-glow-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-table']} */ ;
/** @type {__VLS_StyleScopedClasses['me-2']} */ ;
/** @type {__VLS_StyleScopedClasses['table-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-arrow-clockwise']} */ ;
/** @type {__VLS_StyleScopedClasses['me-1']} */ ;
/** @type {__VLS_StyleScopedClasses['table-responsive']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tech']} */ ;
/** @type {__VLS_StyleScopedClasses['table-hover']} */ ;
/** @type {__VLS_StyleScopedClasses['table-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['spinner-border']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['visually-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['table-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-5']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-inbox']} */ ;
/** @type {__VLS_StyleScopedClasses['display-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['table-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-content-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-0']} */ ;
/** @type {__VLS_StyleScopedClasses['page-item']} */ ;
/** @type {__VLS_StyleScopedClasses['page-link']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-chevron-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-item']} */ ;
/** @type {__VLS_StyleScopedClasses['page-link']} */ ;
/** @type {__VLS_StyleScopedClasses['page-item']} */ ;
/** @type {__VLS_StyleScopedClasses['page-link']} */ ;
/** @type {__VLS_StyleScopedClasses['bi']} */ ;
/** @type {__VLS_StyleScopedClasses['bi-chevron-right']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-info']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
// @ts-ignore
var __VLS_2 = __VLS_1, __VLS_3 = __VLS_0;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            totalPages: totalPages,
            visiblePages: visiblePages,
            getNestedValue: getNestedValue,
            formatValue: formatValue,
            refresh: refresh,
            changePage: changePage,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
