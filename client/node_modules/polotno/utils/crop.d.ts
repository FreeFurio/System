type Size = {
    width: number;
    height: number;
};
export declare function getCrop(imageSize: Size, size: Size, clipPosition?: string): {
    cropX: number;
    cropY: number;
    cropWidth: any;
    cropHeight: any;
};
export {};
