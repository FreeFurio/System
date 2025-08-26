interface PolotnoElement {
    type: string;
    id: string;
    x: number;
    y: number;
}
export declare function svgToURL(s: any): string;
export declare function svgToJson(svgString: any): Promise<{
    width: number;
    height: number;
    pages: {
        id: string;
        children: PolotnoElement[];
    }[];
}>;
export {};
