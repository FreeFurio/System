export declare function getImageSize(url: any): Promise<any>;
export declare function loadImage(url: string): Promise<HTMLImageElement>;
export declare function cropImage(src: any, element: any): Promise<string>;
type Size = {
    width: number;
    height: number;
};
export declare function getCrop(elementSize: Size, originalImageSize: Size): {
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
};
export {};
