export declare const fetcher: (url: string) => Promise<any>;
type GET_FUNC = (params: {
    query: string;
    page: number;
}) => string;
interface UseInfiniteAPIParams {
    defaultQuery?: string;
    timeout?: number;
    getAPI: GET_FUNC;
    getSize?: (lastResult: any) => number;
    fetchFunc?: (url: string, attrs?: any) => Promise<any>;
}
export declare const useInfiniteAPI: ({ defaultQuery, timeout, getAPI, getSize, fetchFunc, }: UseInfiniteAPIParams) => {
    setQuery: (query: string) => void;
    isLoading: boolean;
    loadMore: () => void;
    isReachingEnd: boolean;
    data: any[];
    items: any[];
    hasMore: boolean;
    reset: () => void;
    error: any;
};
export {};
