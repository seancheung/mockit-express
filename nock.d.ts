import { Url } from 'url';
import { Options, Scope } from 'nock';
import { Omit, RouteName } from './types';
import { Database, PlainRoute, CondRoute } from './index';

type Route = PlainRoute | CondRoute;
type Routes = Record<
    string,
    Omit<PlainRoute, RouteName> | Omit<CondRoute, RouteName>
>;
interface Nockit {
    stop(): void;
    pause(): void;
    activate(): void;
}

declare function nock(
    basePath: string | RegExp | Url,
    routes: string | Routes | Database,
    options?: Options
): Nockit;
declare namespace nock {
    function mount(scope: Scope, route: PlainRoute | CondRoute): void;
}
export = nock;
