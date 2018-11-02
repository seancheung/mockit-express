import { Router } from 'express';
import { WriteStream } from 'fs';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
interface Headers {
    [x: string]: string;
}
interface MountedRoute {
    readonly method: string;
    readonly path: string;
    readonly proxy?: true;
    readonly bypass?: true;
}
type MountCallback = (route: MountedRoute) => void;
type Watcher = (error?: Error, changed?: boolean) => void;
interface BaseData {
    id: string;
    method: string;
    path: string;
    bypass?: boolean;
}
interface PlainData {
    code?: number;
    headers?: Headers;
    delay?: number;
    body?: string;
}
interface Cond extends PlainData {
    case: string;
}
interface CondData extends PlainData {
    cond: Cond[];
}
interface Proxy {
    remote: string;
    rewrite?: string;
    headers?: Headers;
}
interface ProxyData {
    proxy: Proxy;
}
type RouteKey = 'id';
type RouteName = RouteKey | 'method' | 'path';
type RawRoute =
    | Omit<mockit.PlainRoute, RouteKey>
    | Omit<mockit.CondRoute, RouteKey>
    | Omit<mockit.ProxyRoute, RouteKey>;
type Routes = Record<
    string,
    | Omit<mockit.PlainRoute, RouteName>
    | Omit<mockit.CondRoute, RouteName>
    | Omit<mockit.ProxyRoute, RouteName>
>;

declare function mockit(
    file: string,
    watcher?: Watcher,
    mounted?: MountCallback
): Router;
declare function mockit(data: Routes, mounted?: MountCallback): Router;
declare function mockit(db: mockit.Database, mounted?: MountCallback): Router;
declare namespace mockit {
    interface PlainRoute extends BaseData, PlainData {}
    interface CondRoute extends BaseData, CondData {}
    interface ProxyRoute extends BaseData, ProxyData {}
    type Route = mockit.PlainRoute | mockit.CondRoute | mockit.ProxyRoute;
    class Database {
        /**
         * Get all records
         */
        all(): IterableIterator<Route>;
        /**
         * Select records with pagination
         *
         * @param offset Offset
         * @param limit Limit
         */
        select(offset?: number, limit?: number): IterableIterator<Route>;
        /**
         * Get records count
         */
        count(): number;
        /**
         * Check if an ID exists
         *
         * @param id ID
         */
        has(id: string): boolean;
        /**
         * Check if a composite key exists
         *
         * @param method Method
         * @param path Path
         */
        exists(method: string, path: string): boolean;
        /**
         * Find a record by id
         *
         * @param id ID
         */
        find(id: string): Route;
        /**
         * Insert a record
         *
         * @param doc Route
         */
        insert(doc: RawRoute): Route;
        /**
         * Update a record by id
         *
         * @param id ID
         * @param data Route
         */
        update(id: string, data: RawRoute): Route;
        /**
         * Delete a record by id
         *
         * @param id ID
         */
        remove(id: string): boolean;
        /**
         * Clear all records
         */
        drop(): void;
        /**
         * Dump all records to a writable stream in json format
         *
         * @param stream Stream
         */
        dump(stream: WriteStream): Promise<void>;
        /**
         * Dump all records to a writable stream in yaml format
         *
         * @param stream Stream
         */
        ydump(stream: WriteStream): Promise<void>;
        /**
         * Load records from object
         *
         * @param data Routes
         */
        load(data: Routes): void;
        /**
         * Register a stream to dump to when db changed
         *
         * @param stream Stream
         */
        persist(stream?: WriteStream): void;
        /**
         * Register db changed callback
         *
         * @param cb Callback
         */
        hook(cb?: (db: Database) => void): void;
    }
    /**
     * Load routes file
     *
     * @param filename Filename(json/yaml)
     */
    function load(filename: string): Routes;
    /**
     * Mount route to router
     *
     * @param router Router
     * @param route Route
     * @param callback Mounted callback
     */
    function mount(
        router: Router,
        route: Route,
        callback?: MountCallback
    ): void;
}

export = mockit;
