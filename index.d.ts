import { Router } from 'express';

declare function mockit(
    file: string,
    watcher?: mockit.Watcher,
    mounted?: mockit.MountCallback
): Router;
declare function mockit(
    data: mockit.Routes,
    mounted?: mockit.MountCallback
): Router;
declare function mockit(
    db: mockit.Database,
    mounted?: mockit.MountCallback
): Router;

declare namespace mockit {
    interface BaseRoute {
        code?: number;
        headers?: Headers;
        bypass?: boolean;
        delay?: number;
        body?: string;
    }
    interface ProxyData {
        remote: string;
        rewrite?: string;
        headers?: Headers;
    }
    interface Headers {
        [x: string]: string;
    }
    interface Condition extends BaseRoute {
        case: string;
    }
    interface MountedRoute {
        readonly method: string;
        readonly path: string;
        readonly proxy?: true;
        readonly bypass?: true;
    }
    type MountCallback = (route: MountedRoute) => void;
    type Watcher = (error?: Error, changed?: boolean) => void;
    export interface PlainRoute extends BaseRoute {
        cond?: Condition[];
    }
    export interface ProxyRoute {
        proxy: ProxyData;
    }
    export type Route = PlainRoute | ProxyRoute
    export interface Routes {
        [x: string]: Route;
    }
    export type RouteData = Route & {
        id: string
    }
    export class Database {
        /**
         * Get all records
         */
        all(): IterableIterator<RouteData>
        /**
         * Select records with pagination
         * 
         * @param offset Offset
         * @param limit Limit
         */
        select(offset?: number, limit?: number): IterableIterator<RouteData>
        /**
         * Get records count
         */
        count(): number
        /**
         * Check if an ID exists
         * 
         * @param id ID
         */
        has(id: string): boolean
        /**
         * Check if a composite key exists
         * 
         * @param method Method
         * @param path Path
         */
        exists(method: string, path: string): boolean
        /**
         * Find a record by id
         * 
         * @param id ID
         */
        find(id: string): RouteData
        /**
         * Insert a record
         * 
         * @param doc Route
         */
        insert(doc: Route): RouteData
        /**
         * Update a record by id
         * 
         * @param id ID
         * @param data Route
         */
        update(id: string, data: Route): RouteData
        /**
         * Delete a record by id
         * 
         * @param id ID
         */
        remove(id: string): boolean
        /**
         * Clear all records
         */
        drop(): void
        /**
         * Dump all records to a writable stream in json format
         * 
         * @param stream Stream
         */
        dump(stream: WritableStream): Promise<void>
        /**
         * Dump all records to a writable stream in yaml format
         * 
         * @param stream Stream
         */
        ydump(stream: WritableStream): Promise<void>
        /**
         * Load records from object
         * 
         * @param data Routes
         */
        load(data: Routes): void
        /**
         * Register a stream to dump to when db changed
         * 
         * @param stream Stream
         */
        persist(stream?: WritableStream): void
        /**
         * Register db changed callback
         * 
         * @param cb Callback
         */
        hook(cb?: (db: Database) => void): void
    }
    /**
     * Load routes file
     * 
     * @param filename Filename(json/yaml)
     */
    export function load(filename: string): Routes
    /**
     * Mount route to router
     * 
     * @param router Router
     * @param route Route
     * @param callback Mounted callback
     */
    export function mount(router: Router, route: Route, callback?: MountCallback): void
}

export = mockit;
