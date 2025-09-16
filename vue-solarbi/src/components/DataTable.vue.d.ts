interface Column {
    key: string;
    title: string;
    width?: string;
    format?: 'text' | 'number' | 'date' | 'datetime';
    precision?: number;
}
interface Pagination {
    current: number;
    pageSize: number;
    total: number;
}
interface Props {
    title?: string;
    columns: Column[];
    data: any[];
    loading?: boolean;
    pagination?: Pagination;
    showRefresh?: boolean;
}
declare var __VLS_2: string, __VLS_3: {
    item: any;
    value: any;
    index: number;
};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_2>]?: (props: typeof __VLS_3) => any;
};
declare const __VLS_component: import("vue").DefineComponent<Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    refresh: () => any;
    pageChange: (page: number) => any;
}, string, import("vue").PublicProps, Readonly<Props> & Readonly<{
    onRefresh?: (() => any) | undefined;
    onPageChange?: ((page: number) => any) | undefined;
}>, {
    title: string;
    loading: boolean;
    showRefresh: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
