export type CSSFilter = {
    filter: string;
    html?: string;
};
export declare enum Effects {
    sepia = "sepia",
    grayscale = "grayscale",
    natural = "natural",
    warm = "warm",
    cold = "cold",
    temperature = "temperature",
    contrast = "contrast",
    shadows = "shadows",
    white = "white",
    black = "black",
    vibrance = "vibrance",
    saturation = "saturation"
}
export declare function shapeFilterToCSS(filter: Effects, intensity?: number): CSSFilter | null;
