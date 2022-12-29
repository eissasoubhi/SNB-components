import DataManagerOptionsInterface from "./Interfaces/DataManagerOptionsInterface";
import { EventsAwareInterface } from "./Interfaces";
export default class DataManager implements EventsAwareInterface {
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
    on(eventName: string, eventHandler: (data: unknown) => void): EventsAwareInterface;
    trigger(eventName: string, data: object): EventsAwareInterface;
}
//# sourceMappingURL=DataManager.d.ts.map