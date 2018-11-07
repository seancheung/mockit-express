export type RouteKey = 'id';
export type RouteName = RouteKey | 'method' | 'path';
export type Omit < T , K extends keyof T > = Pick<T, Exclude<keyof T, K>>;
