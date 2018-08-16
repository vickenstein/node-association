"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inflection = require("inflection");
const ExtendableError = require("es6-error");
const Path = require("path");
const fs = require("fs");
let localPath = Path.join(__dirname, '../..');
if (Path.basename(localPath) === 'node_modules') {
    localPath = Path.join(localPath, '..');
}
// @ts-ignore: ExtendableError miss match imported interface
class ClassLocationError extends ExtendableError {
    constructor(message = 'cannot find directory for class search') {
        super(message);
    }
}
exports.ClassLocationError = ClassLocationError;
class ClassFinder {
    static get localPath() {
        return localPath;
    }
    static get searchPath() {
        return ['', 'dist', 'lib', 'src'];
    }
    static classLocation(classType) {
        if (!this._classLocation)
            this._classLocation = {};
        if (!this._classLocation[classType]) {
            this._classLocation[classType] = this.resolveClassLocation(classType);
        }
        return this._classLocation[classType];
    }
    static resolveClassLocation(classType) {
        const folderName = inflection.pluralize(classType[0].toLowerCase() + classType.substr(1));
        // @ts-ignore: cannot properly type Array.some
        let folderPath;
        this.searchPath.some(path => {
            const fullPath = Path.join(this.localPath, path, folderName);
            if (fs.existsSync(fullPath)) {
                folderPath = fullPath;
                return true;
            }
        });
        if (!folderPath)
            throw new ClassLocationError(`cannot find directory for class ${classType}`);
        return folderPath;
    }
    static classForRequire(name, classType) {
        let Controller;
        const classLocation = this.classLocation(classType);
        try {
            Controller = require(Path.join(classLocation, name + classType));
        }
        catch (error) {
            if (!error.message.match(/Cannot find module/))
                throw error;
            Controller = require(Path.join(classLocation, name));
        }
        return Controller;
    }
    static classFor(name, classType) {
        const requiredClass = this.classForRequire(name, classType);
        if (typeof requiredClass === 'function')
            return requiredClass;
        if (requiredClass[name + classType])
            return requiredClass[name + classType];
        if (requiredClass[name])
            return requiredClass[name];
        if (requiredClass.default)
            return requiredClass.default;
    }
}
exports.ClassFinder = ClassFinder;
