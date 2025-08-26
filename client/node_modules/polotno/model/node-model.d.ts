import { Instance } from 'mobx-state-tree';
export declare const Node: import("mobx-state-tree").IModelType<{
    id: import("mobx-state-tree").ISimpleType<string>;
    type: import("mobx-state-tree").IType<string, string, string>;
    name: import("mobx-state-tree").IType<string, string, string>;
    opacity: import("mobx-state-tree").IType<number, number, number>;
    custom: import("mobx-state-tree").IType<any, any, any>;
    visible: import("mobx-state-tree").IType<boolean, boolean, boolean>;
    selectable: import("mobx-state-tree").IType<boolean, boolean, boolean>;
    removable: import("mobx-state-tree").IType<boolean, boolean, boolean>;
    alwaysOnTop: import("mobx-state-tree").IType<boolean, boolean, boolean>;
    showInExport: import("mobx-state-tree").IType<boolean, boolean, boolean>;
}, {
    readonly locked: boolean;
    readonly page: any;
    readonly store: any;
    readonly top: import("mobx-state-tree").ModelInstanceTypeProps<{
        id: import("mobx-state-tree").ISimpleType<string>;
        type: import("mobx-state-tree").IType<string, string, string>;
        name: import("mobx-state-tree").IType<string, string, string>;
        opacity: import("mobx-state-tree").IType<number, number, number>;
        custom: import("mobx-state-tree").IType<any, any, any>;
        visible: import("mobx-state-tree").IType<boolean, boolean, boolean>;
        selectable: import("mobx-state-tree").IType<boolean, boolean, boolean>;
        removable: import("mobx-state-tree").IType<boolean, boolean, boolean>;
        alwaysOnTop: import("mobx-state-tree").IType<boolean, boolean, boolean>;
        showInExport: import("mobx-state-tree").IType<boolean, boolean, boolean>;
    }> & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
        id: import("mobx-state-tree").ISimpleType<string>;
        type: import("mobx-state-tree").IType<string, string, string>;
        name: import("mobx-state-tree").IType<string, string, string>;
        opacity: import("mobx-state-tree").IType<number, number, number>;
        custom: import("mobx-state-tree").IType<any, any, any>;
        visible: import("mobx-state-tree").IType<boolean, boolean, boolean>;
        selectable: import("mobx-state-tree").IType<boolean, boolean, boolean>;
        removable: import("mobx-state-tree").IType<boolean, boolean, boolean>;
        alwaysOnTop: import("mobx-state-tree").IType<boolean, boolean, boolean>;
        showInExport: import("mobx-state-tree").IType<boolean, boolean, boolean>;
    }, {}, import("mobx-state-tree").ModelCreationType<{
        id: string;
        type: string;
        name: string;
        opacity: number;
        custom: any;
        visible: boolean;
        selectable: boolean;
        removable: boolean;
        alwaysOnTop: boolean;
        showInExport: boolean;
    }>, {}>>;
    readonly parent: any;
    readonly zIndex: any;
} & {
    toJSON(): {};
} & {
    clone(attrs?: any, { skipSelect }?: {
        skipSelect?: boolean;
    }): NodeType;
    set(attrs: any): void;
    moveUp(): void;
    moveTop(): void;
    moveDown(): void;
    moveBottom(): void;
    setZIndex(zIndex: number): void;
    beforeDestroy(): void;
}, import("mobx-state-tree").ModelCreationType<{
    id: string;
    type: string;
    name: string;
    opacity: number;
    custom: any;
    visible: boolean;
    selectable: boolean;
    removable: boolean;
    alwaysOnTop: boolean;
    showInExport: boolean;
}>, {}>;
export type NodeType = Instance<typeof Node>;
