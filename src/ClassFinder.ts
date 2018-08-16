import * as inflection from 'inflection'
import * as ExtendableError from 'es6-error'
import * as Path from 'path'
import * as fs from 'fs'

let localPath = Path.join(__dirname, '../..')
if (Path.basename(localPath) === 'node_modules') {
  localPath = Path.join(localPath, '..')
}

// @ts-ignore: ExtendableError miss match imported interface
export class ClassLocationError extends ExtendableError {
  constructor(message='cannot find directory for class search') {
    super(message)
  }
}

export class ClassFinder {

  static _classLocation: any

  static get localPath() {
    return localPath
  }

  static get searchPath() {
    return ['', 'dist', 'lib', 'src']
  }

  static classLocation(classType: string) {
    if (!this._classLocation) this._classLocation = {}
    if (!this._classLocation[classType]) {
      this._classLocation[classType] = this.resolveClassLocation(classType)
    }
    return this._classLocation[classType]
  }

  static resolveClassLocation(classType: string) {
    const folderName = inflection.pluralize(classType[0].toLowerCase() + classType.substr(1))
    // @ts-ignore: cannot properly type Array.some
    let folderPath
    this.searchPath.some(path => {
      const fullPath = Path.join(this.localPath, path, folderName)
      if (fs.existsSync(fullPath)) {
        folderPath = fullPath
        return true
      }
    })

    if (!folderPath) throw new ClassLocationError(`cannot find directory for class ${classType}`)
    return folderPath
  }

  static classForRequire(name: string, classType: string) {
    let Controller
    const classLocation = this.classLocation(classType)
    try {
      Controller = require(Path.join(classLocation, name + classType))
    } catch (error) {
      if (!error.message.match(/Cannot find module/)) throw error
      Controller = require(Path.join(classLocation, name))
    }
    return Controller
  }

  static classFor(name: string, classType: string) {

    const requiredClass = this.classForRequire(name, classType)
    if (typeof requiredClass === 'function') return requiredClass
    if (requiredClass[name + classType]) return requiredClass[name + classType]
    if (requiredClass[name]) return requiredClass[name]
    if (requiredClass.default) return requiredClass.default

  }
}
