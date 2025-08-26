import { Instance } from 'mobx-state-tree';
export declare const Audio: import("mobx-state-tree").IModelType<{
    id: import("mobx-state-tree").ISimpleType<string>;
    src: import("mobx-state-tree").IType<string, string, string>;
    duration: import("mobx-state-tree").IType<number, number, number>;
    startTime: import("mobx-state-tree").IType<number, number, number>;
    endTime: import("mobx-state-tree").IType<number, number, number>;
    volume: import("mobx-state-tree").IType<number, number, number>;
    delay: import("mobx-state-tree").IType<number, number, number>;
}, {
    toJSON(): {
        id: string;
        src: string;
        duration: number;
        startTime: number;
        endTime: number;
        volume: number;
        delay: number;
    };
} & {
    set(attrs: any): void;
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
export type AudioType = Instance<typeof Audio>;
