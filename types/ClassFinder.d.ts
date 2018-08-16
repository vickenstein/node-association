import * as ExtendableError from 'es6-error';
export declare class ClassLocationError extends ExtendableError {
    constructor(message?: string);
}
export declare class ClassFinder {
    static _classLocation: any;
    static readonly localPath: string;
    static readonly searchPath: string[];
    static classLocation(classType: string): any;
    static resolveClassLocation(classType: string): never;
    static classForRequire(name: string, classType: string): any;
    static classFor(name: string, classType: string): any;
}
//# sourceMappingURL=ClassFinder.d.ts.map