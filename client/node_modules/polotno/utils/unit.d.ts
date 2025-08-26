export type UnitType = 'pt' | 'mm' | 'cm' | 'in' | 'px';
type fromPx = {
    px: number;
    unit: UnitType;
    dpi: number;
};
export declare const pxToUnit: ({ px, unit, dpi }: fromPx) => number;
export declare const pxToUnitRounded: ({ px, precious, dpi, unit, }: fromPx & {
    precious?: number;
}) => number;
export declare const unitToPx: ({ unitVal, dpi, unit }: {
    unitVal: any;
    dpi: any;
    unit: any;
}) => number;
export declare const pxToUnitString: (conf: fromPx) => string;
export {};
