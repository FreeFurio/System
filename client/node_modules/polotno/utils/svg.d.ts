export declare function urlToBase64(url: any): Promise<string>;
export declare function urlToString(url: any): Promise<string>;
export declare function getColors(svgString: any): string[];
export declare function svgToURL(s: any): string;
export declare function getSvgSize(url: string): Promise<{
    width: number;
    height: number;
}>;
export declare function fixSize(svgString: string): string;
export declare const sameColors: (color1: any, color2: any) => boolean;
export declare function replaceColors(svgString: string, replaceMap: Map<string, string>): string;
export declare const useSvgColors: (src: string) => string[];
