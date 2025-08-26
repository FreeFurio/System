export declare const UndoManager: import("mobx-state-tree").IModelType<{
    history: import("mobx-state-tree").IArrayType<import("mobx-state-tree").IType<any, any, any>>;
    undoIdx: import("mobx-state-tree").IType<number, number, number>;
    targetPath: import("mobx-state-tree").IType<string, string, string>;
}, {
    readonly canUndo: boolean;
    readonly canRedo: boolean;
} & {
    startTransaction(): void;
    endTransaction(skipSave?: boolean): void;
    ignore(func: any, skipStateReplacement?: boolean, delayed?: boolean): Promise<void>;
    transaction(func: any): Promise<void>;
    requestAddState(state: any): void;
    addUndoState(): void;
    afterCreate(): void;
    clear(): void;
    beforeDestroy(): void;
    undo(): void;
    redo(): void;
    replaceState(): void;
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
export default UndoManager;
