import EventManager from '../EventManager'
import DataManagerOptionsInterface from "./Interfaces/DataManagerOptionsInterface";
import {EventsAwareInterface} from "./Interfaces";

export default class DataManager implements EventsAwareInterface{
    private fetch_type?: string;
    private options: DataManagerOptionsInterface;
    private current_page: number;
    private is_fetching_locked: boolean;
    private event: EventManager;
    private fetch_url: string;

    constructor(options: DataManagerOptionsInterface) {
        this.options = {
            ...{
                // full http url for fetching data
                url: null,

                // array of objects with 'src' and 'title' keys
                data: [],

                // the key name that holds the data array
                responseDataKey: 'data',

                // the key name that holds the next page link
                nextPageKey: 'links.next',
            }, ...options
        }

        this.init();
    }

    init() {
        this.current_page = 0;
        this.is_fetching_locked = false;
        this.event = new EventManager();
        this.fetch_url = this.options.url;
        this.fetch_type = this.options.data.length ? 'data' : (this.fetch_url ? 'url' : null);
    }

    // stop data fetching if neither next page link nor data were found
    setNextFetch(response: any) {
        if (response.next_link && response.data.length) {
            this.fetch_url = response.next_link;
        } else {
            this.lockFetching();
        }
    }

    lockFetching() {
        this.is_fetching_locked = true;
    }

    unlockFetching() {
        this.is_fetching_locked = false;
    }

    // get a key from object with dot notation, example: data.key.subkey.
    getObjectKeyByString(object: any, dotted_key: string, default_val?: any) {
        const value = dotted_key.split('.').reduce((item: any, i: any) => {
            return item ? item[i] : {};
        }, object);

        if (typeof default_val == 'undefined') {
            default_val = value;
        }

        return value && !$.isEmptyObject(value) ? value : default_val;
    }

    parseResponse(response: any) {

        return {
            data: this.getObjectKeyByString(response, this.options.responseDataKey, []),
            next_link: this.getObjectKeyByString(response, this.options.nextPageKey, null)
        };
    }

    fetchData() {
        if (this.fetch_type == 'data') {

            this.event.trigger('beforeFetch');
            this.event.trigger('fetch', { data: this.options.data });
            this.event.trigger('afterFetch');

        } else if (this.fetch_type == 'url') {

            // Prevent simultaneous requests.
            // Because we need to get the next page link from each request,
            // they must be synchronous.
            if (this.is_fetching_locked) return;

            const current_link = this.fetch_url;

            this.event.trigger('beforeFetch');

            this.lockFetching();

            $.ajax({
                url: current_link,
                beforeSend:(xhr: any) => {
                    // set the request link to get it afterwards in the response
                    xhr.request_link = current_link;
                },
            })
            .always(() =>{
                // this is the first callback to be called when the request finises
                this.unlockFetching();
            })
            .done((response, status_text, xhr: any) => {
                const parsed_response = this.parseResponse(response);
                this.current_page++;

                //
                this.setNextFetch(parsed_response);

                this.event.trigger(
                    'fetch',
                    {
                        data: parsed_response.data,
                        page: this.current_page,
                        requestLink: xhr.request_link,
                        nextLink: parsed_response.next_link
                    }
                );
            })
            .fail(() => {
                this.event.trigger('error', {
                    error: "problem loading from " + current_link
                });
            })
            .always(() => {
                this.event.trigger('afterFetch');
            });

        } else {
            this.event.trigger('error', {
                error: "options 'data' or 'url' must be set"
            });
        }
    }

    fetchNext() {
        if (this.fetch_type == 'url') {
            this.fetchData();
        }
    }

    on(eventName: string, eventHandler: (data: unknown) => void): EventsAwareInterface {
        return this.event.on(eventName, eventHandler)
    }

    trigger(eventName: string, data: object): EventsAwareInterface {
        return this.event.trigger(eventName, data)
    }
}
