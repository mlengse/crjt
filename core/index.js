require('dotenv').config()
const defaultConfig = require('../config')

let obj = require("fs").readdirSync(require("path").join(__dirname, "lib")).reduce(( obj, file ) => Object.assign({}, obj, require("./lib/" + file)), {})

module.exports = class Core {
  constructor(config) {

    for( let func in obj) {
      if(func.includes('_')) {
        this[func.split('_').join('')] = async (...args) => await obj[func](Object.assign({}, ...args, {that: this }))
      } else {
        this[func] = obj[func]
      }
    }
    this.config = Object.assign({}, this.npmEnv, process.env, defaultConfig, config)
  }

  async init(){
    this.spinner.succeed(`init ${this.config.npm_package_name} ${new Date()}`)
  }

  async close(isPM2){
    if(this.Browser){
      !isPM2 && await this.Browser.close()
      isPM2 && this.Browser.isConnected() && await this.Browser.disconnect()
    } 
    this.spinner.stop()
    this.spinner.succeed(`closed ${this.config.npm_package_name}: ${new Date()}`)
  }

}