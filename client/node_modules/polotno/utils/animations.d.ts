export declare const animations: {
    fade: ({ dTime, element, animation }: {
        dTime: any;
        element: any;
        animation: any;
    }) => {
        opacity: number;
    };
    rotate: ({ dTime, element, animation }: {
        dTime: any;
        element: any;
        animation: any;
    }) => any;
    blink: ({ dTime, element, animation }: {
        dTime: any;
        element: any;
        animation: any;
    }) => {
        opacity: number;
    };
    bounce: ({ dTime, element, animation }: {
        dTime: any;
        element: any;
        animation: any;
    }) => {};
    move: ({ dTime, element, animation }: {
        dTime: any;
        element: any;
        animation: any;
    }) => {};
    zoom: ({ dTime, element, animation }: {
        dTime: any;
        element: any;
        animation: any;
    }) => {};
    cameraZoom: ({ dTime, element, animation }: {
        dTime: any;
        element: any;
        animation: any;
    }) => any;
};
export declare const animate: ({ element, dTime, animation }: {
    element: any;
    dTime: any;
    animation: any;
}) => any;
export declare const registerAnimation: (name: string, animation: any) => void;
