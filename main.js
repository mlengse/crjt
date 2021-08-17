const Core = require('./core')

const app = new Core()

module.exports = async (isPM2) => {
  try{
    await app.init()
   
    await app.close(isPM2)

    console.log(`${app.config.npm_package_name} process done: ${new Date()}`)
  }catch(e){
    console.error(`${app.config.npm_package_name} process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}