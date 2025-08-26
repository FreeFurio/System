import React from 'react';
import { RectConfig } from 'konva/lib/shapes/Rect';
export declare const setHighlighterStyle: (style: RectConfig) => void;
type SimplifiedElement = {
    a: {
        x: number;
        y: number;
        rotation: number;
        width: number;
        height: number;
    };
};
export declare const Highlighter: (({ element }: {
    element: SimplifiedElement;
}) => React.JSX.Element) & {
    displayName: string;
};
export {};
