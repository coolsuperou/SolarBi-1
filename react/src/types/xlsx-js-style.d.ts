declare module 'xlsx-js-style' {
  import * as XLSX from 'xlsx';
  
  interface CellStyle {
    font?: {
      bold?: boolean;
      sz?: number;
      color?: { rgb?: string };
      name?: string;
      italic?: boolean;
      underline?: boolean;
    };
    fill?: {
      fgColor?: { rgb?: string };
      bgColor?: { rgb?: string };
      patternType?: string;
    };
    alignment?: {
      horizontal?: 'left' | 'center' | 'right';
      vertical?: 'top' | 'center' | 'bottom';
      wrapText?: boolean;
    };
    border?: {
      top?: { style?: string; color?: { rgb?: string } };
      bottom?: { style?: string; color?: { rgb?: string } };
      left?: { style?: string; color?: { rgb?: string } };
      right?: { style?: string; color?: { rgb?: string } };
    };
    numFmt?: string;
  }

  interface StyledCell extends XLSX.CellObject {
    s?: CellStyle;
    z?: string;
  }

  interface StyledWorkSheet extends XLSX.WorkSheet {
    [cell: string]: StyledCell | any;
  }

  export = XLSX;
}
