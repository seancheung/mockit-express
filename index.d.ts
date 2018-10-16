import { Router } from 'express';

declare function mockit(
    file: string | mockit.Routes,
    watch?: mockit.Watcher
): Router;
declare namespace mockit {
    interface BaseRoute {
        code?: number;
        headers?: Headers;
        bypass?: boolean;
        delay?: number;
        body?: string;
    }
    interface Proxy {
        remote: string;
        rewrite?: string;
        headers?: Headers;
    }
    export interface Routes {
        [x: string]: Route | ProxyRoute;
    }
    export interface Route extends BaseRoute {
        cond?: Condition[];
    }
    export interface ProxyRoute {
        proxy: Proxy;
    }
    export interface Headers {
        [x: string]: string;
    }
    export interface Condition extends BaseRoute {
        case: string;
    }
    type Watcher = (error?: Error, changed?: boolean) => void;
}

export = mockit;