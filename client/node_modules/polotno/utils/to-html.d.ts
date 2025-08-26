export declare function fixRatio(svgString: any): string;
export declare function jsonToDOM({ json, elementHook }: {
    json: any;
    elementHook: any;
}): Promise<{
    type: any;
    props: any;
    children: any[];
}>;
export declare function jsonToHTML({ json, elementHook }: {
    json: any;
    elementHook: any;
}): Promise<string>;
