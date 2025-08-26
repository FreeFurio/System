import React from 'react';
interface SectionTabProps {
    children: any;
    name: string;
    onClick: any;
    active: boolean;
    iconSize?: number;
}
export declare const SectionTab: ({ children, name, onClick, active, iconSize, }: SectionTabProps) => React.JSX.Element;
export {};
