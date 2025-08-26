export declare function getVideoSize(url: string): Promise<{
    width: number;
    height: number;
}>;
export declare function getVideoDuration(url: string): Promise<unknown>;
export declare function getVideoPreview(videoUrl: any, captureTime?: number): Promise<string>;
export declare function getVideoObjectPreview(video: any, canvas: any, captureTime: any): Promise<unknown>;
