export interface FontStyle {
    src: string;
    fontStyle?: string;
    fontWeight?: string;
}
export interface FontConfig {
    styles?: FontStyle[];
    url?: string;
}
export declare function optimizeCss(cssContent: string, html: string): string;
