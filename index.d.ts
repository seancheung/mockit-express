import { Router } from 'express';

declare function mockit(
    file: string | mockit.Routes,
    watcher?: mockit.Watcher,
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
    interface MountedRoute {
        readonly method: string;
        readonly path: string;
        readonly proxy?: true;
        readonly bypass?: true;
    }
    type MountCallback = (route: MountedRoute) => void;
    type Watcher = (error?: Error, changed?: boolean) => void;
}

export = mockit;
