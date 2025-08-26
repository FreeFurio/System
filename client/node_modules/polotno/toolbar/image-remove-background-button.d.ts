import React from 'react';
export declare function setRemoveBackgroundFunc(func: any): void;
export declare const RemoveBackgroundDialog: (({ isOpen, onClose, element, }: {
    isOpen: boolean;
    onClose: () => void;
    element: any;
}) => React.JSX.Element) & {
    displayName: string;
};
export declare const ImageRemoveBackground: ({ element }: {
    element: any;
}) => React.JSX.Element;
