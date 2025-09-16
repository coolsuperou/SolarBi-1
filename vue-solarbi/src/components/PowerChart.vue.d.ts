import type { EChartsOption } from 'echarts';
interface Props {
    title?: string;
    chartOptions?: EChartsOption;
    loading?: boolean;
    currentMode?: string;
    chartHeight?: string;
}
declare const _default: import("vue").DefineComponent<Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    modeChange: (mode: string) => any;
}, string, import("vue").PublicProps, Readonly<Props> & Readonly<{
    onModeChange?: ((mode: string) => any) | undefined;
}>, {
    title: string;
    loading: boolean;
    currentMode: string;
    chartHeight: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
