// 页面通用样式
// 整合了表格样式、响应式样式等通用CSS

import { tableStylesCSS } from './tableStyles';
import { responsiveStylesCSS } from './responsiveStyles';

// 合并所有通用样式
export const pageStylesCSS = `
${tableStylesCSS}

${responsiveStylesCSS}
`;

// 页面背景装饰样式
export const pageBackgroundStyles = {
  // 渐变背景装饰效果
  backgroundDecoration: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
    background: `
      radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 60% 40%, rgba(0, 255, 136, 0.06) 0%, transparent 50%)
    `,
    zIndex: -1
  },

  // 网格背景效果
  gridBackground: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
    backgroundImage: `
      linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    zIndex: -1
  }
};
