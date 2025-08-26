export declare const flags: {
    imageDownScalingEnabled: boolean;
    removeBackgroundEnabled: boolean;
    htmlRenderEnabled: boolean;
    forceTextFitEnabled: boolean;
    textVerticalResizeEnabled: boolean;
    textOverflow: string;
    textSplitAllowed: boolean;
    animationsEnabled: boolean;
};
export declare const setTextVerticalResizeEnabled: (value: boolean) => void;
export declare const useRemoveBackground: (value: boolean) => void;
export declare const useHtmlTextRender: (value: boolean) => void;
export declare const setDownScalingEnabled: (value: boolean) => void;
export declare const useDownScaling: (value: boolean) => void;
export declare const setForceTextFit: (value: boolean) => void;
export declare const setTextOverflow: (value: "resize" | "ellipsis" | "change-font-size") => void;
export declare const setTextSplitAllowed: (value: boolean) => void;
export declare const setAnimationsEnabled: (value: boolean) => void;
