const Core = require('./core')

const app = new Core()

module.exports = async (isPM2) => {
  try{
    await app.init()

    for(let [id, nik] of Object.entries(Object.keys(app.people)))
    if(id > 234)
    {
      app.spinner.succeed(`processing ${id}, ${nik}`)
      await app.inputCorJat( { person: app.people[nik] } )
    }

    await app.close(isPM2)

    console.log(`${app.config.npm_package_name} process done: ${new Date()}`)
  }catch(e){
    console.error(`${app.config.npm_package_name} process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}