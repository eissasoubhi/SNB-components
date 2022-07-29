import DataManagerOptionsInterface from "./Interfaces/DataManagerOptionsInterface";
export default class DataManager {
    private fetch_type?;
    private options;
    private current_page;
    private is_fetching_locked;
    private event;
    private fetch_url;
    constructor(options: DataManagerOptionsInterface);
    init(): void;
    setNextFetch(response: any): void;
    lockFetching(): void;
    unlockFetching(): void;
    getObjectKeyByString(object: any, dotted_key: string, default_val?: any): any;
    parseResponse(response: any): {
        data: any;
        next_link: any;
    };
    fetchData(): void;
    fetchNext(): void;
}
//# sourceMappingURL=DataManager.d.ts.map