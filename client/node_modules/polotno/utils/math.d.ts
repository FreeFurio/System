type Shape = {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
};
export declare function degToRad(angle: any): number;
export declare function getClientRect(element: Shape): {
    x: number;
    y: number;
    width: number;
    height: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};
export declare function getTotalClientRect(elements: Shape[]): {
    x: number;
    y: number;
    width: number;
    height: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};
export declare function getCenter(shape: any): {
    x: any;
    y: any;
};
export declare function rotateAroundPoint(shape: any, deltaDeg: any, point: any): any;
export declare function rotateAroundCenter(shape: any, deltaDeg: any): any;
export {};
